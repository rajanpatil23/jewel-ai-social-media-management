<?php
// Server-side AI image-generation proxy.
// Keeps API keys off the client. Switch providers via config.php.

function generate($m) {
    require_method('POST');
    $u = require_auth();
    $b = json_in();

    $prompt = trim((string)($b['prompt'] ?? ''));
    $count  = max(1, min(4, (int)($b['count'] ?? 1)));
    $ratio  = (string)($b['ratio'] ?? '1:1');
    $style  = (string)($b['style'] ?? 'studio');

    if (mb_strlen($prompt) < 4)   json_out(['error' => 'prompt_too_short'], 400);
    if (mb_strlen($prompt) > 2000) json_out(['error' => 'prompt_too_long'], 400);

    // Light prompt enrichment for jewellery use-case
    $enriched = "$prompt — jewellery product, $style aesthetic, ratio $ratio, ultra-detailed, "
              . "studio-grade lighting, sharp focus on metal and gemstones, premium luxury showroom mood";

    $cfg = cfg();
    $provider = $cfg['ai_provider'] ?? 'mock';

    try {
        if ($provider === 'mock' || empty($cfg['ai_api_key'])) {
            // Return placeholder URLs so the UI still works without a key
            $images = [];
            for ($i = 0; $i < $count; $i++) {
                $seed = bin2hex(random_bytes(4));
                $images[] = "https://picsum.photos/seed/$seed/1024/1024";
            }
            json_out(['images' => $images, 'mock' => true]);
        }

        if ($provider === 'lovable') {
            $images = call_lovable_ai($enriched, $count, $cfg);
            json_out(['images' => $images]);
        }

        if ($provider === 'openai') {
            $images = call_openai_image($enriched, $count, $cfg);
            json_out(['images' => $images]);
        }

        json_out(['error' => 'unknown_provider'], 500);
    } catch (Throwable $e) {
        json_out(['error' => 'ai_failed', 'detail' => $e->getMessage()], 502);
    }
}

function call_lovable_ai(string $prompt, int $count, array $cfg): array {
    $url = 'https://ai.gateway.lovable.dev/v1/chat/completions';
    $images = [];
    for ($i = 0; $i < $count; $i++) {
        $payload = [
            'model'    => $cfg['ai_model'] ?: 'google/gemini-2.5-flash-image-preview',
            'messages' => [['role' => 'user', 'content' => $prompt]],
            'modalities' => ['image', 'text'],
        ];
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST           => true,
            CURLOPT_TIMEOUT        => 90,
            CURLOPT_HTTPHEADER     => [
                'Content-Type: application/json',
                'Authorization: Bearer ' . $cfg['ai_api_key'],
            ],
            CURLOPT_POSTFIELDS     => json_encode($payload),
        ]);
        $resp = curl_exec($ch);
        $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        if ($resp === false) throw new Exception('curl: ' . curl_error($ch));
        curl_close($ch);
        if ($code >= 400) throw new Exception("ai $code: $resp");
        $data = json_decode($resp, true);
        // Look for a base64 image in choices[0].message.images[0].image_url.url
        $img = $data['choices'][0]['message']['images'][0]['image_url']['url'] ?? null;
        if ($img) $images[] = $img; // returns data:image/png;base64,...
    }
    return $images;
}

function call_openai_image(string $prompt, int $count, array $cfg): array {
    $ch = curl_init('https://api.openai.com/v1/images/generations');
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_TIMEOUT        => 90,
        CURLOPT_HTTPHEADER     => [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $cfg['ai_api_key'],
        ],
        CURLOPT_POSTFIELDS => json_encode([
            'model'  => $cfg['ai_model'] ?: 'gpt-image-1',
            'prompt' => $prompt,
            'n'      => $count,
            'size'   => '1024x1024',
        ]),
    ]);
    $resp = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    if ($code >= 400) throw new Exception("openai $code: $resp");
    $d = json_decode($resp, true);
    $out = [];
    foreach (($d['data'] ?? []) as $it) {
        if (!empty($it['b64_json'])) $out[] = 'data:image/png;base64,' . $it['b64_json'];
        elseif (!empty($it['url'])) $out[] = $it['url'];
    }
    return $out;
}
