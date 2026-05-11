<?php
// Server-side AI image-generation proxy.
// - Multimodal (text + reference image) via Gemini directly or Lovable AI Gateway / Nano Banana
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
    $count     = max(1, min(6, (int)($b['count'] ?? 1)));
    $ratio     = (string)($b['ratio'] ?? '1:1');
    $sceneId   = isset($b['scene']) ? (string)$b['scene'] : null;
    $refImage  = isset($b['reference_image']) ? (string)$b['reference_image'] : null; // URL or data URI
    $applyBrand = !empty($b['apply_branding']);

    if ($prompt === '' && !$refImage) json_out(['error' => 'prompt_or_reference_required'], 400);
    if (mb_strlen($prompt) > 2000)    json_out(['error' => 'prompt_too_long'], 400);

    $basePrompt = build_jewelry_prompt($prompt, $sceneId, !empty($refImage));

    // Apply Branding — inject brand DNA into the prompt and pass logo as extra reference.
    $brandLogo = null;
    if ($applyBrand) {
        $brand = get_user_brand($u['id']);
        $brandBits = [];
        if (!empty($brand['brand_name'])) $brandBits[] = "Brand: " . $brand['brand_name'];
        if (!empty($brand['colors']))     $brandBits[] = "Brand accent palette: " . implode(', ', $brand['colors'])
                                            . " — use these tones in props, background, and styling, but do NOT alter the actual metal or gemstone colors of the jewelry";
        if (!empty($brand['font']))       $brandBits[] = "Typography mood: " . $brand['font'] . " (luxury editorial)";
        if (!empty($brand['logo_url'])) {
            $brandLogo = $brand['logo_url'];
            $brandBits[] = "Place a small, subtle brand logo watermark in the bottom-right corner using the provided logo reference (low opacity, tasteful, do not distort)";
        }
        if ($brandBits) $basePrompt .= ". " . implode('. ', $brandBits) . ".";
    }

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
            // Hard error — do NOT silently mock. Tell the UI to direct the user to Settings.
            json_out([
                'error'   => 'no_api_key',
                'detail'  => 'No AI API key configured. Open Settings → AI & API Key and paste your key, '
                           . 'or set ai_api_key in backend/config.php as the platform default.',
            ], 400);
        }

        $extraRefs = $brandLogo ? [$brandLogo] : [];
        if ($provider === 'gemini') {
            $images = call_gemini_image_multi($basePrompt, $refImage, $count, $apiKey, $model, $extraRefs);
        } elseif ($provider === 'lovable') {
            $images = call_lovable_ai_multi($basePrompt, $refImage, $count, $apiKey, $model, $extraRefs);
        } elseif ($provider === 'openai') {
            $images = call_openai_image($basePrompt, $count, ['ai_api_key' => $apiKey, 'ai_model' => $model]);
        } else {
            json_out(['error' => 'unknown_provider', 'detail' => $provider], 400);
        }

        // Persist data URIs as files + auto-add to gallery so they appear everywhere
        $persisted = persist_and_save_gallery($u['id'], $images, $prompt ?: ($sceneId ?: 'Generated'));
        json_out([
            'images'        => $persisted,
            'using_own_key' => $ai['using_own'],
            'provider'      => $provider,
            'model'         => $model,
        ]);

    } catch (Throwable $e) {
        error_log('[ai/generate] ' . $e->getMessage());
        // Real error — surface it. The frontend will show a toast with this detail.
        json_out([
            'error'         => 'ai_failed',
            'detail'        => $e->getMessage(),
            'using_own_key' => $ai['using_own'] ?? false,
        ], 502);
    }
}

// Lightweight credential test — used by Settings "Test connection" button.
function ai_test($m) {
    $u = require_auth();
    require_method('POST');
    $ai = resolve_user_ai($u['id']);
    if (empty($ai['api_key'])) json_out(['ok' => false, 'error' => 'no_api_key'], 400);

    try {
        if ($ai['provider'] === 'gemini') {
            $images = call_gemini_image_multi(
                'A tiny gold ring on a white background, product photography',
                null, 1, $ai['api_key'], $ai['model']
            );
            json_out(['ok' => true, 'sample' => $images[0] ?? null, 'provider' => 'gemini', 'model' => $ai['model']]);
        }
        if ($ai['provider'] === 'lovable') {
            $images = call_lovable_ai_multi(
                'A tiny gold ring on a white background, product photography',
                null, 1, $ai['api_key'], $ai['model']
            );
            json_out(['ok' => true, 'sample' => $images[0] ?? null, 'provider' => 'lovable', 'model' => $ai['model']]);
        }
        if ($ai['provider'] === 'openai') {
            $images = call_openai_image(
                'A tiny gold ring on a white background, product photography',
                1, ['ai_api_key' => $ai['api_key'], 'ai_model' => $ai['model']]
            );
            json_out(['ok' => true, 'sample' => $images[0] ?? null, 'provider' => 'openai', 'model' => $ai['model']]);
        }
        json_out(['ok' => false, 'error' => 'unknown_provider'], 400);
    } catch (Throwable $e) {
        json_out(['ok' => false, 'error' => 'ai_failed', 'detail' => $e->getMessage()], 502);
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

// Direct Gemini API path for customer Google API keys (AIza...).
// We add a unique variation hint + randomized temperature/seed per request so
// asking for N images returns N DIFFERENT compositions (Gemini is otherwise near-deterministic).
function call_gemini_image_multi(string $prompt, ?string $refImage, int $count, string $apiKey, string $model): array {
    $model = preg_replace('#^google/#', '', $model) ?: 'gemini-2.5-flash-image';
    $url = 'https://generativelanguage.googleapis.com/v1beta/models/' . rawurlencode($model) . ':generateContent?key=' . rawurlencode($apiKey);

    $variationHints = [
        'Variation A: tighter macro framing, slight left-side angle.',
        'Variation B: wider composition, slight right-side angle, different background prop arrangement.',
        'Variation C: top-down flatlay perspective, alternative styling props.',
        'Variation D: three-quarter hero angle, alternate lighting direction and shadow shape.',
        'Variation E: side profile view, different background tone.',
        'Variation F: dramatic close-up on gemstone, alternate reflection pattern.',
    ];

    $images = [];
    $lastErr = null;
    for ($i = 0; $i < $count; $i++) {
        $seed = random_int(1, 2147483000);
        $hint = $variationHints[$i % count($variationHints)];
        $variedPrompt = $prompt . ' ' . $hint . ' [unique-seed:' . $seed . ']';

        $parts = [['text' => $variedPrompt]];
        if ($refImage) $parts[] = gemini_image_part($refImage);
        $body = json_encode([
            'contents' => [['role' => 'user', 'parts' => $parts]],
            'generationConfig' => [
                'responseModalities' => ['TEXT', 'IMAGE'],
                'temperature'        => 1.0,
                'seed'               => $seed,
            ],
        ]);

        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST           => true,
            CURLOPT_TIMEOUT        => 120,
            CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
            CURLOPT_POSTFIELDS     => $body,
        ]);
        $resp = curl_exec($ch);
        $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        if ($code >= 400 || !$resp) { $lastErr = "gemini $code: " . substr((string)$resp, 0, 500); continue; }
        $data = json_decode($resp, true);
        foreach (($data['candidates'][0]['content']['parts'] ?? []) as $part) {
            $inline = $part['inlineData'] ?? $part['inline_data'] ?? null;
            if (!empty($inline['data'])) {
                $images[] = 'data:' . ($inline['mimeType'] ?? $inline['mime_type'] ?? 'image/png') . ';base64,' . $inline['data'];
                break; // one image per request — next loop iteration brings a new seed
            }
        }
    }
    if (empty($images)) throw new Exception($lastErr ?: 'gemini_no_images_returned');
    return array_slice($images, 0, $count);
}

// Save data: URIs to /uploads as real files, insert into gallery, return public URLs.
// External URLs (https://) are left as-is but still inserted into gallery.
function persist_and_save_gallery(string $userId, array $images, string $label): array {
    $cfg = cfg();
    $dir = $cfg['uploads_dir'];
    $urlBase = $cfg['uploads_url'] ?? '/api/uploads';
    if (!is_dir($dir)) @mkdir($dir, 0775, true);

    $out = [];
    $ins = db()->prepare('INSERT INTO gallery (id,user_id,src,label) VALUES (?,?,?,?)');
    $shortLabel = mb_substr($label, 0, 240);

    foreach ($images as $img) {
        $finalUrl = $img;
        if (preg_match('#^data:([^;]+);base64,(.*)$#', $img, $m)) {
            $mime = $m[1];
            $bytes = base64_decode($m[2]);
            $ext = $mime === 'image/jpeg' ? 'jpg' : ($mime === 'image/webp' ? 'webp' : 'png');
            $name = 'gen_' . date('Ymd_His') . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
            $path = $dir . '/' . $name;
            if ($bytes && @file_put_contents($path, $bytes)) {
                $finalUrl = rtrim($cfg['site_url'] ?? '', '/') . $urlBase . '/' . $name;
            }
        }
        try { $ins->execute([uuid(), $userId, $finalUrl, $shortLabel]); } catch (Throwable $e) { /* ignore */ }
        $out[] = $finalUrl;
    }
    return $out;
}

function gemini_image_part(string $src): array {
    if (preg_match('#^data:(.*?);base64,(.*)$#', $src, $m)) {
        return ['inlineData' => ['mimeType' => $m[1] ?: 'image/png', 'data' => $m[2]]];
    }
    $bytes = null; $mime = null;
    $uploadsUrl = cfg()['uploads_url'] ?? '/api/uploads';
    if (str_starts_with($src, $uploadsUrl . '/')) {
        $path = cfg()['uploads_dir'] . substr($src, strlen($uploadsUrl));
        if (is_file($path)) { $bytes = file_get_contents($path); $mime = mime_content_type($path) ?: 'image/png'; }
    } elseif (preg_match('#^https?://#', $src)) {
        $bytes = @file_get_contents($src);
        $mime = 'image/png';
    }
    if (!$bytes) throw new Exception('reference_image_unreadable');
    return ['inlineData' => ['mimeType' => $mime ?: 'image/png', 'data' => base64_encode($bytes)]];
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
