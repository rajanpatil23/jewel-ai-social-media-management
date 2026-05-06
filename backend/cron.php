<?php
// Scheduler worker. Run every minute via Hostinger cron:
//   */1 * * * * /usr/bin/php /home/USER/public_html/api/cron.php

require __DIR__ . '/db.php';

$pdo = db();
$now = date('Y-m-d H:i:s');

$due = $pdo->prepare("SELECT * FROM posts
                      WHERE status = 'scheduled' AND scheduled_at <= ?
                      ORDER BY scheduled_at ASC LIMIT 25");
$due->execute([$now]);
$rows = $due->fetchAll();

foreach ($rows as $p) {
    try {
        // TODO: replace with real Meta Graph publish using user's connection token.
        // For Instagram: 2-step (POST /{ig-user-id}/media → POST /{ig-user-id}/media_publish)
        // For Facebook Page: POST /{page-id}/photos (or /feed for text)

        $conn = $pdo->prepare('SELECT * FROM connections WHERE user_id = ? AND provider = ?');
        $conn->execute([$p['user_id'], 'meta']);
        $c = $conn->fetch();
        if (!$c) throw new Exception('no_meta_connection');

        // Stub: pretend we published.
        $pdo->prepare("UPDATE posts SET status='published', published_at=NOW(), last_error=NULL WHERE id = ?")
            ->execute([$p['id']]);
        echo "published {$p['id']}\n";
    } catch (Throwable $e) {
        $pdo->prepare("UPDATE posts SET status='failed', last_error=? WHERE id = ?")
            ->execute([substr($e->getMessage(), 0, 500), $p['id']]);
        echo "failed {$p['id']}: " . $e->getMessage() . "\n";
    }
}

echo "done at $now (" . count($rows) . " posts)\n";
