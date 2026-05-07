<?php
// Front controller — all /api/* requests land here (via .htaccess).

require __DIR__ . '/db.php';
require __DIR__ . '/helpers.php';

// Same-origin in production, but be permissive for local dev with Vite proxy.
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: same-origin');

$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? '/';
// Strip leading /api
$path = preg_replace('#^/api#', '', $path);
$path = '/' . trim($path, '/');

// Static uploads served by Apache directly via .htaccess; this is a fallback.
if (str_starts_with($path, '/uploads/')) {
    $f = cfg()['uploads_dir'] . substr($path, strlen('/uploads'));
    if (is_file($f)) {
        header('Content-Type: ' . (mime_content_type($f) ?: 'application/octet-stream'));
        readfile($f);
        exit;
    }
    json_out(['error' => 'not_found'], 404);
}

// Route table — order matters (specific before generic)
$routes = [
    '#^/auth/register$#'                   => 'routes/auth.php:register',
    '#^/auth/login$#'                      => 'routes/auth.php:login',
    '#^/auth/logout$#'                     => 'routes/auth.php:logout',
    '#^/auth/me$#'                         => 'routes/auth.php:me',

    '#^/gallery$#'                         => 'routes/gallery.php:index',
    '#^/gallery/(?P<id>[a-f0-9-]{36})$#'   => 'routes/gallery.php:remove',

    '#^/upload$#'                          => 'routes/upload.php:upload',

    '#^/connections$#'                     => 'routes/connections.php:index',
    '#^/connections/meta/connect$#'        => 'routes/connections.php:meta_start',
    '#^/connections/meta/callback$#'       => 'routes/connections.php:meta_callback',
    '#^/connections/meta/disconnect$#'     => 'routes/connections.php:meta_disconnect',

    '#^/posts$#'                           => 'routes/posts.php:index',
    '#^/posts/(?P<id>[a-f0-9-]{36})$#'     => 'routes/posts.php:item',

    '#^/analytics/summary$#'               => 'routes/analytics.php:summary',

    '#^/ai/generate$#'                     => 'routes/ai.php:generate',
    '#^/settings/ai$#'                     => 'routes/settings.php:ai_settings',

    '#^/meta/data-deletion$#'              => 'routes/meta_deletion.php:meta_data_deletion',
    '#^/meta/data-deletion/status$#'       => 'routes/meta_deletion.php:meta_data_deletion_status',

    '#^/health$#'                          => 'routes/health.php:ping',
];

foreach ($routes as $pattern => $target) {
    if (preg_match($pattern, $path, $m)) {
        [$file, $fn] = explode(':', $target);
        require __DIR__ . '/' . $file;
        $fn($m);
        exit;
    }
}

json_out(['error' => 'not_found', 'path' => $path], 404);
