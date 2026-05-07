<?php
// Per-user settings — BYOK (Bring Your Own Key) for AI image generation.
// If the user saves their own API key, we use that. Otherwise we fall back
// to the platform default key in config.php.

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
    if (str_starts_with($key, 'sk-') || str_starts_with($key, 'sk_')) return 'lovable';
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
