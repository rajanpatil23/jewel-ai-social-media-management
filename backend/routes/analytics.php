<?php
require_once __DIR__ . '/../meta.php';

function summary($m) {
    require_method('GET');
    $u = require_auth();
    $pdo = db();

    // Internal stats from posts table (always available)
    $totals = $pdo->prepare("
        SELECT
          SUM(status='published') AS published,
          SUM(status='scheduled') AS scheduled,
          SUM(status='draft')     AS drafts,
          SUM(status='failed')    AS failed,
          COUNT(*)                AS total
        FROM posts WHERE user_id = ?");
    $totals->execute([$u['id']]);
    $row = $totals->fetch() ?: [];

    $recent = $pdo->prepare("
        SELECT id,title,status,platforms,scheduled_at,published_at,created_at
        FROM posts WHERE user_id = ? ORDER BY COALESCE(published_at, scheduled_at, created_at) DESC LIMIT 8");
    $recent->execute([$u['id']]);

    $insights = null;
    $conn = $pdo->prepare('SELECT * FROM connections WHERE user_id = ? AND provider = ?');
    $conn->execute([$u['id'], 'meta']);
    $c = $conn->fetch();
    if ($c) {
        $meta = json_decode($c['meta'] ?? '{}', true) ?: [];
        $pageId    = $meta['page_id']     ?? null;
        $pageToken = $meta['page_token']  ?? null;
        $igId      = $meta['ig_user_id']  ?? null;
        if ($pageId && $pageToken) {
            try { $insights = meta_insights($pageId, $pageToken, $igId, 28); }
            catch (Throwable $e) { $insights = ['error' => $e->getMessage()]; }
        }
    }

    json_out([
        'totals'   => $row,
        'recent'   => $recent->fetchAll(),
        'insights' => $insights,
    ]);
}
