<?php
// Per-user settings — BYOK (Bring Your Own Key) for AI image generation,
// plus persistent Brand Identity (name, colors, font, logo) and tone prefs.
// All data is stored in the user_settings table, scoped to the logged-in user.

function ensure_user_settings_row(string $userId): void {
    $pdo = db();
    $exists = $pdo->prepare('SELECT 1 FROM user_settings WHERE user_id = ?');
    $exists->execute([$userId]);
    if (!$exists->fetch()) {
        $pdo->prepare('INSERT INTO user_settings (user_id) VALUES (?)')->execute([$userId]);
    }
}

function brand_settings($m) {
    $u = require_auth();
    $pdo = db();

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $q = $pdo->prepare('SELECT brand_name, brand_logo_url, brand_colors, brand_font FROM user_settings WHERE user_id = ?');
        $q->execute([$u['id']]);
        $row = $q->fetch() ?: [];
        $colorsRaw = (string)($row['brand_colors'] ?? '');
        json_out([
            'brand_name'  => $row['brand_name']     ?? '',
            'logo_url'    => $row['brand_logo_url'] ?? '',
            'colors'      => $colorsRaw === '' ? [] : array_values(array_filter(array_map('trim', explode(',', $colorsRaw)))),
            'font'        => $row['brand_font']     ?? '',
        ]);
    }

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $b = json_in();
        $name   = trim((string)($b['brand_name'] ?? ''));
        $logo   = trim((string)($b['logo_url']   ?? ''));
        $font   = trim((string)($b['font']       ?? ''));
        $colors = $b['colors'] ?? [];
        if (!is_array($colors)) $colors = [];
        // sanitize hex codes
        $colors = array_values(array_filter(array_map(function($c){
            $c = trim((string)$c);
            return preg_match('/^#[0-9a-fA-F]{3,8}$/', $c) ? $c : null;
        }, $colors)));
        $colorsCsv = implode(',', array_slice($colors, 0, 8));

        if (mb_strlen($name) > 120) json_out(['error' => 'name_too_long'], 400);
        if (mb_strlen($font) > 120) json_out(['error' => 'font_too_long'], 400);
        if (mb_strlen($logo) > 2000) json_out(['error' => 'logo_too_long'], 400);

        ensure_user_settings_row($u['id']);
        $pdo->prepare('UPDATE user_settings SET brand_name=?, brand_logo_url=?, brand_colors=?, brand_font=? WHERE user_id=?')
            ->execute([$name ?: null, $logo ?: null, $colorsCsv ?: null, $font ?: null, $u['id']]);
        json_out(['ok' => true]);
    }

    json_out(['error' => 'method_not_allowed'], 405);
}

function tone_prefs($m) {
    $u = require_auth();
    $pdo = db();

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $q = $pdo->prepare('SELECT caption_tone, prefs FROM user_settings WHERE user_id = ?');
        $q->execute([$u['id']]);
        $row = $q->fetch() ?: [];
        $prefs = [];
        if (!empty($row['prefs'])) { $tmp = json_decode($row['prefs'], true); if (is_array($tmp)) $prefs = $tmp; }
        json_out(['tone' => $row['caption_tone'] ?? '', 'prefs' => $prefs]);
    }

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $b = json_in();
        $tone  = trim((string)($b['tone'] ?? ''));
        $prefs = isset($b['prefs']) && is_array($b['prefs']) ? $b['prefs'] : [];
        if (mb_strlen($tone) > 60) json_out(['error' => 'tone_too_long'], 400);
        ensure_user_settings_row($u['id']);
        $pdo->prepare('UPDATE user_settings SET caption_tone=?, prefs=? WHERE user_id=?')
            ->execute([$tone ?: null, json_encode($prefs), $u['id']]);
        json_out(['ok' => true]);
    }

    json_out(['error' => 'method_not_allowed'], 405);
}

// Used by ai.php when the user enables "Apply Branding".
function get_user_brand(string $userId): array {
    $q = db()->prepare('SELECT brand_name, brand_logo_url, brand_colors, brand_font FROM user_settings WHERE user_id = ?');
    $q->execute([$userId]);
    $row = $q->fetch() ?: [];
    $colorsRaw = (string)($row['brand_colors'] ?? '');
    return [
        'brand_name' => $row['brand_name']     ?? '',
        'logo_url'   => $row['brand_logo_url'] ?? '',
        'colors'     => $colorsRaw === '' ? [] : array_values(array_filter(array_map('trim', explode(',', $colorsRaw)))),
        'font'       => $row['brand_font']     ?? '',
    ];
}

function ai_settings($m) {
    $u = require_auth();
    $method = $_SERVER['REQUEST_METHOD'];
    $pdo = db();

    if ($method === 'GET') {
        $q = $pdo->prepare('SELECT ai_provider, ai_model, ai_api_key FROM user_settings WHERE user_id = ?');
        $q->execute([$u['id']]);
        $row = $q->fetch();
        $cfg = cfg();
        $resolved = resolve_user_ai($u['id']);
        json_out([
            'provider'      => $resolved['provider'] ?? ($row['ai_provider'] ?? ($cfg['ai_provider'] ?? 'gemini')),
            'model'         => $resolved['model']    ?? ($row['ai_model']    ?? ($cfg['ai_model']    ?? 'gemini-2.5-flash-image')),
            'has_own_key'   => !empty($row['ai_api_key']),
            'using_default' => empty($row['ai_api_key']),
        ]);
    }

    if ($method === 'POST') {
        $b = json_in();
        $provider = (string)($b['provider'] ?? 'gemini');
        $model    = trim((string)($b['model'] ?? 'gemini-2.5-flash-image'));
        $key      = trim((string)($b['api_key'] ?? ''));
        $clear    = !empty($b['clear_key']);

        if (!in_array($provider, ['gemini', 'lovable', 'openai'], true)) json_out(['error' => 'bad_provider'], 400);
        if (mb_strlen($model) > 120) json_out(['error' => 'bad_model'], 400);
        if ($key !== '') {
            $detected = detect_ai_provider_from_key($key);
            if ($detected) $provider = $detected;
            $model = normalize_model_for_provider($provider, $model);
        }

        // Upsert
        $exists = $pdo->prepare('SELECT 1 FROM user_settings WHERE user_id = ?');
        $exists->execute([$u['id']]);
        if ($exists->fetch()) {
            if ($clear) {
                $pdo->prepare('UPDATE user_settings SET ai_provider=?, ai_model=?, ai_api_key=NULL WHERE user_id=?')
                    ->execute([$provider, $model, $u['id']]);
            } elseif ($key !== '') {
                $pdo->prepare('UPDATE user_settings SET ai_provider=?, ai_model=?, ai_api_key=? WHERE user_id=?')
                    ->execute([$provider, $model, $key, $u['id']]);
            } else {
                $pdo->prepare('UPDATE user_settings SET ai_provider=?, ai_model=? WHERE user_id=?')
                    ->execute([$provider, $model, $u['id']]);
            }
        } else {
            $pdo->prepare('INSERT INTO user_settings (user_id, ai_provider, ai_model, ai_api_key) VALUES (?,?,?,?)')
                ->execute([$u['id'], $provider, $model, $key !== '' ? $key : null]);
        }
        json_out(['ok' => true]);
    }

    json_out(['error' => 'method_not_allowed'], 405);
}

// Helper used by ai.php to resolve the active API key + model for a user.
function resolve_user_ai(string $user_id): array {
    $cfg = cfg();
    $q = db()->prepare('SELECT ai_provider, ai_model, ai_api_key FROM user_settings WHERE user_id = ?');
    $q->execute([$user_id]);
    $row = $q->fetch();
    $provider = $row['ai_provider'] ?? ($cfg['ai_provider'] ?? 'gemini');
    $model    = $row['ai_model']    ?? ($cfg['ai_model']    ?? 'gemini-2.5-flash-image');
    $apiKey   = trim((string)(!empty($row['ai_api_key']) ? $row['ai_api_key'] : ($cfg['ai_api_key'] ?? '')));
    if ($apiKey === '' || str_starts_with($apiKey, 'CHANGE_ME')) $apiKey = '';
    if ($apiKey === '') {
        $envKey = env_ai_key_for_provider($provider) ?: env_ai_key_for_provider('gemini') ?: env_ai_key_for_provider('lovable') ?: env_ai_key_for_provider('openai');
        if ($envKey) $apiKey = $envKey;
    }
    $detected = detect_ai_provider_from_key((string)$apiKey);
    if ($detected) $provider = $detected;

    return [
        'provider' => $provider,
        'model'    => normalize_model_for_provider($provider, $model),
        'api_key'  => $apiKey,
        'using_own'=> !empty($row['ai_api_key']),
    ];
}

function detect_ai_provider_from_key(string $key): ?string {
    $key = trim($key);
    if ($key === '' || str_starts_with($key, 'CHANGE_ME')) return null;
    if (str_starts_with($key, 'sk_')) return 'lovable';
    if (str_starts_with($key, 'sk-')) return 'openai';
    if (str_starts_with($key, 'AIza')) return 'gemini';
    return null;
}

function normalize_model_for_provider(string $provider, string $model): string {
    if ($provider === 'gemini') {
        return preg_replace('#^google/#', '', $model) ?: 'gemini-2.5-flash-image';
    }
    if ($provider === 'lovable') {
        return str_starts_with($model, 'google/') ? $model : 'google/' . $model;
    }
    return $model ?: 'gpt-image-1';
}

function env_ai_key_for_provider(string $provider): string {
    $names = $provider === 'gemini'
        ? ['GEMINI_API_KEY', 'GOOGLE_API_KEY']
        : ($provider === 'lovable' ? ['LOVABLE_API_KEY'] : ['OPENAI_API_KEY']);
    foreach ($names as $name) {
        $v = getenv($name);
        if (is_string($v) && trim($v) !== '') return trim($v);
    }
    return '';
}
