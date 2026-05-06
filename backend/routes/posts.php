<?php

function index($m) {
    $u = require_auth();
    $method = $_SERVER['REQUEST_METHOD'];
    $pdo = db();

    if ($method === 'GET') {
        $q = $pdo->prepare('SELECT * FROM posts WHERE user_id = ? ORDER BY COALESCE(scheduled_at, created_at) DESC LIMIT 500');
        $q->execute([$u['id']]);
        json_out(['posts' => $q->fetchAll()]);
    }

    if ($method === 'POST') {
        $b = json_in();
        $id = uuid();
        $status = !empty($b['scheduledAt']) ? 'scheduled' : (($b['status'] ?? 'draft'));
        $mediaUrls = isset($b['mediaUrls']) && is_array($b['mediaUrls']) ? json_encode(array_values($b['mediaUrls'])) : null;
        $pdo->prepare('INSERT INTO posts (id,user_id,title,caption_ig,caption_fb,media_url,media_urls,format,platforms,status,scheduled_at)
                       VALUES (?,?,?,?,?,?,?,?,?,?,?)')
            ->execute([
                $id, $u['id'],
                substr((string)($b['title'] ?? 'Untitled post'), 0, 255),
                (string)($b['captionIg'] ?? ''),
                (string)($b['captionFb'] ?? ''),
                (string)($b['mediaUrl'] ?? ''),
                $mediaUrls,
                (string)($b['format'] ?? 'image'),
                (string)($b['platforms'] ?? 'instagram,facebook'),
                $status,
                !empty($b['scheduledAt']) ? date('Y-m-d H:i:s', strtotime($b['scheduledAt'])) : null,
            ]);
        json_out(['id' => $id, 'status' => $status]);
    }

    json_out(['error' => 'method_not_allowed'], 405);
}

function item($m) {
    $u = require_auth();
    $method = $_SERVER['REQUEST_METHOD'];
    $pdo = db();

    if ($method === 'PATCH') {
        $b = json_in();
        $fields = [];
        $vals = [];
        $map = [
            'title'       => 'title',
            'captionIg'   => 'caption_ig',
            'captionFb'   => 'caption_fb',
            'mediaUrl'    => 'media_url',
            'format'      => 'format',
            'platforms'   => 'platforms',
            'status'      => 'status',
        ];
        foreach ($map as $k => $col) {
            if (array_key_exists($k, $b)) { $fields[] = "$col = ?"; $vals[] = $b[$k]; }
        }
        if (array_key_exists('scheduledAt', $b)) {
            $fields[] = 'scheduled_at = ?';
            $vals[] = $b['scheduledAt'] ? date('Y-m-d H:i:s', strtotime($b['scheduledAt'])) : null;
        }
        if (!$fields) json_out(['ok' => true]);
        $vals[] = $m['id']; $vals[] = $u['id'];
        $pdo->prepare('UPDATE posts SET ' . implode(',', $fields) . ' WHERE id = ? AND user_id = ?')->execute($vals);
        json_out(['ok' => true]);
    }

    if ($method === 'DELETE') {
        $pdo->prepare('DELETE FROM posts WHERE id = ? AND user_id = ?')->execute([$m['id'], $u['id']]);
        json_out(['ok' => true]);
    }

    if ($method === 'GET') {
        $q = $pdo->prepare('SELECT * FROM posts WHERE id = ? AND user_id = ?');
        $q->execute([$m['id'], $u['id']]);
        $row = $q->fetch();
        if (!$row) json_out(['error' => 'not_found'], 404);
        json_out(['post' => $row]);
    }

    json_out(['error' => 'method_not_allowed'], 405);
}
