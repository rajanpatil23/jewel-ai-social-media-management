<?php

function index($m) {
    $u = require_auth();
    $method = $_SERVER['REQUEST_METHOD'];

    if ($method === 'GET') {
        $q = db()->prepare('SELECT id, src, label, UNIX_TIMESTAMP(created_at)*1000 AS createdAt
                            FROM gallery WHERE user_id = ? ORDER BY created_at DESC LIMIT 200');
        $q->execute([$u['id']]);
        json_out(['items' => $q->fetchAll()]);
    }

    if ($method === 'POST') {
        $b = json_in();
        $items = isset($b['items']) && is_array($b['items']) ? $b['items'] : [$b];
        $ins = db()->prepare('INSERT INTO gallery (id,user_id,src,label) VALUES (?,?,?,?)');
        foreach ($items as $it) {
            $src = trim((string)($it['src'] ?? ''));
            $label = substr(trim((string)($it['label'] ?? '')), 0, 255);
            if ($src === '') continue;
            $ins->execute([uuid(), $u['id'], $src, $label]);
        }
        json_out(['ok' => true]);
    }

    json_out(['error' => 'method_not_allowed'], 405);
}

function remove($m) {
    require_method('DELETE');
    $u = require_auth();
    db()->prepare('DELETE FROM gallery WHERE id = ? AND user_id = ?')->execute([$m['id'], $u['id']]);
    json_out(['ok' => true]);
}
