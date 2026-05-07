<?php
// Server-side AI image-generation proxy.
// - Multimodal (text + reference image) via Lovable AI Gateway / Nano Banana
// - BYOK: uses the user's own API key if configured, else platform default
// - Tuned prompts for jewelry: identity preservation + scene styling

require_once __DIR__ . '/settings.php';

// ---- Curated jewelry scene library (kept on the server so we control quality) ----
function jewelry_scenes(): array {
    return [
        'studio' => "photographed in a high-end professional studio on a seamless pure white background, "
                  . "soft directional softbox lighting, sharp macro focus, ultra-detailed reflections on metal "
                  . "and gemstones, e-commerce catalog photography, 8k",
        'luxury' => "displayed in a luxury showroom on a black velvet pedestal with marble and brushed gold accents, "
                  . "dramatic spotlight, deep shadows, premium boutique mood, hyper-detailed editorial product photography",
        'model_w'=> "worn by an elegant young Indian woman, soft beauty lighting, close-up on the jewelry, "
                  . "blurred luxurious background, fashion editorial photography, photorealistic, ultra-detailed",
        'bridal' => "worn by a stunning Indian bride in a red and gold bridal lehenga, traditional makeup, "
                  . "soft warm lighting, ornate background, regal wedding mood, photorealistic editorial",
        'lifestyle' => "worn by a stylish woman in a candid lifestyle moment, golden hour natural light, "
                  . "shallow depth of field, premium fashion lifestyle photography",
        'festive'=> "styled on rich maroon silk with glowing diyas and marigold flowers around, "
                  . "warm festive Diwali lighting, cinematic mood, ultra-detailed product photography",
        'marble' => "in a top-down flatlay on white Carrara marble with soft morning light, "
                  . "minimalist composition, premium magazine styling, sharp macro details",
        'editorial' => "against a dark moody backdrop, dramatic chiaroscuro lighting, "
                     . "high-fashion magazine cover aesthetic, ultra-sharp metal and gemstone detail",
    ];
}

function build_jewelry_prompt(string $userPrompt, ?string $sceneId, bool $hasReference): string {
    $scenes = jewelry_scenes();
    $sceneClause = $sceneId && isset($scenes[$sceneId]) ? $scenes[$sceneId] : '';

    if ($hasReference) {
        // Identity-preserving restyle of the uploaded product
        $base = "Recreate the EXACT SAME jewelry product shown in the reference image — preserve its precise "
              . "shape, metal color, gemstone count, cut, setting, and proportions with 100% accuracy. "
              . "Do NOT invent new gems, change the metal, or alter the design. Only change the scene/styling.";
        if ($sceneClause) $base .= " Scene: the same product " . $sceneClause . ".";
        if (trim($userPrompt) !== '') $base .= " Additional direction: " . trim($userPrompt) . ".";
    } else {
        $base = trim($userPrompt) !== '' ? trim($userPrompt) : "An elegant piece of fine jewelry";
        $base .= " — luxury jewelry product photography, ultra-detailed, sharp focus on metal and gemstones, "
               . "studio-grade lighting, premium showroom mood";
        if ($sceneClause) $base .= ", " . $sceneClause;
    }

    // Strong negative directives baked into the prompt (Gemini doesn't take a separate negative_prompt)
    $base .= ". Avoid: blurry, low quality, distorted gems, extra fingers, cartoonish, watermark, "
           . "text, logo, jpeg artifacts, oversaturated colors, plastic look.";

    return $base;
}

function generate($m) {
    require_method('POST');
    $u = require_auth();
    $b = json_in();

    $prompt    = trim((string)($b['prompt'] ?? ''));
    $count     = max(1, min(4, (int)($b['count'] ?? 1)));
    $ratio     = (string)($b['ratio'] ?? '1:1');
    $sceneId   = isset($b['scene']) ? (string)$b['scene'] : null;
    $refImage  = isset($b['reference_image']) ? (string)$b['reference_image'] : null; // URL or data URI

    if ($prompt === '' && !$refImage) json_out(['error' => 'prompt_or_reference_required'], 400);
    if (mb_strlen($prompt) > 2000)    json_out(['error' => 'prompt_too_long'], 400);

    $finalPrompt = build_jewelry_prompt($prompt, $sceneId, !empty($refImage));

    $ai = resolve_user_ai($u['id']);
    $provider = $ai['provider'];
    $apiKey   = $ai['api_key'];
    $model    = $ai['model'];

    $mockImages = function(int $n) {
        $out = [];
        for ($i = 0; $i < $n; $i++) {
            $seed = bin2hex(random_bytes(4));
            $out[] = "https://picsum.photos/seed/$seed/1024/1024";
        }
        return $out;
    };

    try {
        if (empty($apiKey)) {
            json_out([
                'images'        => $mockImages($count),
                'mock'          => true,
                'using_own_key' => false,
                'reason'        => 'no_api_key_configured',
            ]);
        }

        if ($provider === 'lovable') {
            $images = call_lovable_ai_multi($finalPrompt, $refImage, $count, $apiKey, $model);
            json_out(['images' => $images, 'using_own_key' => $ai['using_own']]);
        }

        if ($provider === 'openai') {
            $images = call_openai_image($finalPrompt, $count, ['ai_api_key' => $apiKey, 'ai_model' => $model]);
            json_out(['images' => $images, 'using_own_key' => $ai['using_own']]);
        }

        json_out([
            'images' => $mockImages($count), 'mock' => true,
            'reason' => 'unknown_provider:' . $provider,
        ]);
    } catch (Throwable $e) {
        // Never 502 the client — return mock images + the real reason so the
        // UI stays functional and you can see what went wrong on the server.
        error_log('[ai/generate] ' . $e->getMessage());
        json_out([
            'images'        => $mockImages($count),
            'mock'          => true,
            'fallback'      => true,
            'using_own_key' => $ai['using_own'] ?? false,
            'error'         => 'ai_failed',
            'detail'        => $e->getMessage(),
        ]);
    }
}

// Generate $count images in parallel via Lovable AI Gateway (Nano Banana).
// Each request asks for a single image so we get count distinct variations.
function call_lovable_ai_multi(string $prompt, ?string $refImage, int $count, string $apiKey, string $model): array {
    $url = 'https://ai.gateway.lovable.dev/v1/chat/completions';

    // Build the message content (multimodal if reference image is present)
    if ($refImage) {
        $content = [
            ['type' => 'text', 'text' => $prompt],
            ['type' => 'image_url', 'image_url' => ['url' => $refImage]],
        ];
    } else {
        $content = $prompt; // string is fine
    }

    $payload = [
        'model'      => $model ?: 'google/gemini-2.5-flash-image',
        'messages'   => [['role' => 'user', 'content' => $content]],
        'modalities' => ['image', 'text'],
    ];
    $body = json_encode($payload);

    // Parallel curl
    $mh = curl_multi_init();
    $handles = [];
    for ($i = 0; $i < $count; $i++) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST           => true,
            CURLOPT_TIMEOUT        => 120,
            CURLOPT_HTTPHEADER     => [
                'Content-Type: application/json',
                'Authorization: Bearer ' . $apiKey,
            ],
            CURLOPT_POSTFIELDS     => $body,
        ]);
        curl_multi_add_handle($mh, $ch);
        $handles[] = $ch;
    }

    $running = null;
    do {
        curl_multi_exec($mh, $running);
        if ($running) curl_multi_select($mh, 1.0);
    } while ($running > 0);

    $images = [];
    $lastErr = null;
    foreach ($handles as $ch) {
        $resp = curl_multi_getcontent($ch);
        $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_multi_remove_handle($mh, $ch);
        if ($code >= 400 || !$resp) {
            $lastErr = "ai $code: " . substr((string)$resp, 0, 300);
            curl_close($ch);
            continue;
        }
        curl_close($ch);
        $data = json_decode($resp, true);
        $img = $data['choices'][0]['message']['images'][0]['image_url']['url'] ?? null;
        if ($img) $images[] = $img;
    }
    curl_multi_close($mh);

    if (empty($images)) throw new Exception($lastErr ?: 'no_images_returned');
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
