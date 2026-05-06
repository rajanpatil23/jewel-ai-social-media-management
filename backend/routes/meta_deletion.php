<?php
/**
 * Meta (Facebook/Instagram) Data Deletion Callback
 * -------------------------------------------------
 * Endpoint: POST /api/meta/data-deletion
 * Public URL (set in Meta App Dashboard → Settings → Basic
 *             → "Data Deletion Callback URL"):
 *     https://yourdomain.com/api/meta/data-deletion
 *
 * Meta sends a `signed_request` form field. We verify it with the
 * App Secret from config.php, log the request, and respond with the
 * JSON shape Meta requires: { url, confirmation_code }.
 */

function meta_data_deletion(array $m): void {
    require_method('POST');

    $cfg    = cfg();
    $secret = $cfg['meta_app_secret'] ?? '';
    if ($secret === '') {
        json_out(['error' => 'meta_app_secret_not_configured'], 500);
    }

    $signed = $_POST['signed_request'] ?? '';
    if (!$signed || strpos($signed, '.') === false) {
        json_out(['error' => 'missing_or_malformed_signed_request'], 400);
    }

    [$encoded_sig, $payload] = explode('.', $signed, 2);

    $b64url_decode = function (string $s): string {
        $rem = strlen($s) % 4;
        if ($rem) $s .= str_repeat('=', 4 - $rem);
        return base64_decode(strtr($s, '-_', '+/'));
    };

    $sig  = $b64url_decode($encoded_sig);
    $data = json_decode($b64url_decode($payload), true);

    if (!is_array($data) || ($data['algorithm'] ?? '') !== 'HMAC-SHA256') {
        json_out(['error' => 'unknown_algorithm'], 400);
    }

    $expected = hash_hmac('sha256', $payload, $secret, true);
    if (!hash_equals($expected, $sig)) {
        json_out(['error' => 'bad_signature'], 401);
    }

    $user_id = (string)($data['user_id'] ?? 'unknown');
    $code    = bin2hex(random_bytes(8)) . '-' . substr(hash('sha256', $user_id), 0, 8);

    // Best-effort: record the request so you can prove compliance.
    // If a `meta_deletion_requests` table exists, insert there;
    // otherwise fall back to a log file in uploads/.
    try {
        $stmt = db()->prepare(
            'INSERT INTO meta_deletion_requests (id, meta_user_id, confirmation_code, created_at)
             VALUES (?, ?, ?, NOW())'
        );
        $stmt->execute([uuid(), $user_id, $code]);
    } catch (Throwable $e) {
        @file_put_contents(
            ($cfg['uploads_dir'] ?? __DIR__) . '/meta-deletion-log.txt',
            date('c') . " | user_id={$user_id} | code={$code}\n",
            FILE_APPEND
        );
    }

    // The status URL the user is shown when they check deletion progress.
    $status_url = rtrim($cfg['site_url'], '/') . '/api/meta/data-deletion/status?code=' . urlencode($code);

    json_out([
        'url'               => $status_url,
        'confirmation_code' => $code,
    ]);
}

function meta_data_deletion_status(array $m): void {
    // Simple human-readable status page (GET).
    $code = $_GET['code'] ?? '';
    $code = htmlspecialchars($code, ENT_QUOTES, 'UTF-8');
    header('Content-Type: text/html; charset=utf-8');
    echo <<<HTML
<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex">
<title>Data Deletion Status</title>
<style>
  body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;
       background:#faf7f2;color:#2a2a2a;margin:0;min-height:100vh;
       display:flex;align-items:center;justify-content:center}
  .card{background:#fff;max-width:560px;margin:24px;padding:40px;
        border-radius:12px;box-shadow:0 4px 24px rgba(0,0,0,.06)}
  h1{margin:0 0 12px;font-size:24px;color:#8b5a2b}
  .code{background:#f4efe7;padding:8px 12px;border-radius:6px;
        font-family:ui-monospace,Menlo,monospace;word-break:break-all}
</style></head><body>
<div class="card">
  <h1>Data Deletion Request Received</h1>
  <p>Your request to delete personal data associated with your account has been received and is being processed.</p>
  <p>We will permanently remove your data from our systems within <strong>30 days</strong>, in line with our Privacy Policy.</p>
  <p><strong>Your confirmation code:</strong></p>
  <p class="code">{$code}</p>
</div></body></html>
HTML;
}
