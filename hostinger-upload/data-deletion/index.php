<?php
/**
 * Meta (Facebook) Data Deletion Callback Endpoint
 * --------------------------------------------------
 * Upload this file to: public_html/data-deletion/index.php
 * Public URL:          https://ekhadijewels-demo.advora.in/data-deletion
 *
 * Meta will POST a `signed_request` parameter here when a user
 * removes your app. We verify the HMAC-SHA256 signature with the
 * App Secret, then return JSON with a confirmation URL + code.
 */

// ====== CONFIG — EDIT THESE TWO VALUES ======
$APP_SECRET   = 'PASTE_YOUR_META_APP_SECRET_HERE'; // Meta App Dashboard → Settings → Basic → App Secret
$STATUS_URL   = 'https://ekhadijewels-demo.advora.in/data-deletion-status.html';
// ============================================

header('Content-Type: application/json; charset=utf-8');

// --- Helpers ---
function b64url_decode($input) {
    $remainder = strlen($input) % 4;
    if ($remainder) {
        $input .= str_repeat('=', 4 - $remainder);
    }
    return base64_decode(strtr($input, '-_', '+/'));
}

function fail($msg, $code = 400) {
    http_response_code($code);
    echo json_encode(['error' => $msg]);
    exit;
}

// --- Only accept POST ---
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed. Meta sends POST with a signed_request.']);
    exit;
}

// --- Read signed_request ---
$signed_request = $_POST['signed_request'] ?? '';
if (!$signed_request || strpos($signed_request, '.') === false) {
    fail('Missing or malformed signed_request');
}

list($encoded_sig, $payload) = explode('.', $signed_request, 2);
$sig  = b64url_decode($encoded_sig);
$data = json_decode(b64url_decode($payload), true);

if (!is_array($data) || ($data['algorithm'] ?? '') !== 'HMAC-SHA256') {
    fail('Unknown algorithm. Expected HMAC-SHA256');
}

// --- Verify signature ---
$expected_sig = hash_hmac('sha256', $payload, $APP_SECRET, true);
if (!hash_equals($expected_sig, $sig)) {
    fail('Bad signed_request signature', 401);
}

// --- Build confirmation ---
$user_id           = $data['user_id'] ?? 'unknown';
$confirmation_code = bin2hex(random_bytes(8)) . '-' . substr(hash('sha256', $user_id), 0, 8);

// (Optional) Log the deletion request for your records
@file_put_contents(
    __DIR__ . '/deletion-log.txt',
    date('c') . " | user_id={$user_id} | code={$confirmation_code}\n",
    FILE_APPEND
);

// --- Respond in the format Meta requires ---
echo json_encode([
    'url'               => $STATUS_URL . '?code=' . $confirmation_code,
    'confirmation_code' => $confirmation_code,
]);
