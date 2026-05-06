<?php

function index($m) {
    require_method('GET');
    $u = require_auth();
    $q = db()->prepare('SELECT id, provider, account_label, expires_at, created_at FROM connections WHERE user_id = ?');
    $q->execute([$u['id']]);
    json_out(['connections' => $q->fetchAll()]);
}

// MOCK connect — replace with real Meta OAuth flow.
// Real flow: redirect user to https://www.facebook.com/v19.0/dialog/oauth?client_id=...&redirect_uri=...&scope=pages_manage_posts,instagram_content_publish,...
// then exchange ?code=... for a long-lived token at /v19.0/oauth/access_token.
function meta_connect($m) {
    require_method('POST');
    $u = require_auth();
    $b = json_in();
    $label = trim((string)($b['account_label'] ?? 'Meta account'));

    $pdo = db();
    $existing = $pdo->prepare('SELECT id FROM connections WHERE user_id = ? AND provider = ?');
    $existing->execute([$u['id'], 'meta']);
    if ($row = $existing->fetch()) {
        $pdo->prepare('UPDATE connections SET account_label = ? WHERE id = ?')->execute([$label, $row['id']]);
        json_out(['ok' => true, 'id' => $row['id'], 'mock' => true]);
    }
    $id = uuid();
    $pdo->prepare('INSERT INTO connections (id,user_id,provider,account_label,access_token,meta) VALUES (?,?,?,?,?,?)')
        ->execute([$id, $u['id'], 'meta', $label, 'MOCK_TOKEN', json_encode(['mock' => true])]);
    json_out(['ok' => true, 'id' => $id, 'mock' => true]);
}

function meta_disconnect($m) {
    require_method('POST');
    $u = require_auth();
    db()->prepare('DELETE FROM connections WHERE user_id = ? AND provider = ?')->execute([$u['id'], 'meta']);
    json_out(['ok' => true]);
}
