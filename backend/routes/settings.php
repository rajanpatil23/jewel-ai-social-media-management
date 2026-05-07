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
        json_out([
            'provider'      => $row['ai_provider'] ?? ($cfg['ai_provider'] ?? 'lovable'),
            'model'         => $row['ai_model']    ?? ($cfg['ai_model']    ?? 'google/gemini-2.5-flash-image'),
            'has_own_key'   => !empty($row['ai_api_key']),
            'using_default' => empty($row['ai_api_key']),
        ]);
    }

    if ($method === 'POST') {
        $b = json_in();
        $provider = (string)($b['provider'] ?? 'lovable');
        $model    = trim((string)($b['model'] ?? 'google/gemini-2.5-flash-image'));
        $key      = trim((string)($b['api_key'] ?? ''));
        $clear    = !empty($b['clear_key']);

        if (!in_array($provider, ['lovable', 'openai'], true)) json_out(['error' => 'bad_provider'], 400);
        if (mb_strlen($model) > 120) json_out(['error' => 'bad_model'], 400);

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
    return [
        'provider' => $row['ai_provider'] ?? ($cfg['ai_provider'] ?? 'lovable'),
        'model'    => $row['ai_model']    ?? ($cfg['ai_model']    ?? 'google/gemini-2.5-flash-image'),
        'api_key'  => !empty($row['ai_api_key']) ? $row['ai_api_key'] : ($cfg['ai_api_key'] ?? ''),
        'using_own'=> !empty($row['ai_api_key']),
    ];
}
