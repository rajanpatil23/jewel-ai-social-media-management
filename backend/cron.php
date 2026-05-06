<?php
// Scheduler worker. Run every minute via Hostinger cron:
//   */1 * * * * /usr/bin/php /home/USER/public_html/api/cron.php
//
// Picks up posts where status='scheduled' and scheduled_at <= NOW(), and
// publishes them to Facebook Page and/or Instagram Business via Meta Graph.

require __DIR__ . '/db.php';
require __DIR__ . '/helpers.php';
require __DIR__ . '/meta.php';

$pdo = db();
$now = date('Y-m-d H:i:s');

$due = $pdo->prepare("SELECT * FROM posts
                      WHERE status = 'scheduled' AND scheduled_at <= ?
                      ORDER BY scheduled_at ASC LIMIT 25");
$due->execute([$now]);
$rows = $due->fetchAll();

$siteUrl = rtrim(cfg()['site_url'] ?? '', '/');

foreach ($rows as $p) {
    try {
        $conn = $pdo->prepare('SELECT * FROM connections WHERE user_id = ? AND provider = ?');
        $conn->execute([$p['user_id'], 'meta']);
        $c = $conn->fetch();
        if (!$c) throw new Exception('no_meta_connection');
        $meta = json_decode($c['meta'] ?? '{}', true) ?: [];
        if (!empty($meta['mock'])) throw new Exception('mock_connection_cannot_publish');

        $pageId    = $meta['page_id']    ?? null;
        $pageToken = $meta['page_token'] ?? null;
        $igUser    = $meta['ig_user_id'] ?? null;
        if (!$pageId || !$pageToken) throw new Exception('missing_page_token');

        $platforms = array_filter(array_map('trim', explode(',', $p['platforms'] ?? '')));

        // Resolve absolute media URL for IG (must be public HTTPS)
        $media = $p['media_url'] ?? '';
        if ($media && str_starts_with($media, '/')) $media = $siteUrl . $media;

        $captionFb = $p['caption_fb'] ?: $p['caption_ig'];
        $captionIg = $p['caption_ig'] ?: $p['caption_fb'];

        $results = [];
        if (in_array('facebook', $platforms)) {
            $results['fb'] = meta_publish_facebook($pageId, $pageToken, $media ?: null, (string)$captionFb);
        }
        if (in_array('instagram', $platforms)) {
            if (!$igUser) throw new Exception('no_instagram_business_account');
            if (!$media || !preg_match('#^https://#i', $media)) throw new Exception('ig_requires_public_https_image');
            $results['ig'] = meta_publish_instagram($igUser, $pageToken, $media, (string)$captionIg);
        }

        $pdo->prepare("UPDATE posts SET status='published', published_at=NOW(), last_error=NULL WHERE id = ?")
            ->execute([$p['id']]);
        echo "published {$p['id']} " . json_encode($results) . "\n";
    } catch (Throwable $e) {
        $pdo->prepare("UPDATE posts SET status='failed', last_error=? WHERE id = ?")
            ->execute([substr($e->getMessage(), 0, 500), $p['id']]);
        echo "failed {$p['id']}: " . $e->getMessage() . "\n";
    }
}

echo "done at $now (" . count($rows) . " posts)\n";
