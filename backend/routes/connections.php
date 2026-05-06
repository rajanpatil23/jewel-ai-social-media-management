<?php
require_once __DIR__ . '/../meta.php';

function index($m) {
    require_method('GET');
    $u = require_auth();
    $q = db()->prepare('SELECT id, provider, account_label, expires_at, created_at, meta FROM connections WHERE user_id = ?');
    $q->execute([$u['id']]);
    $rows = $q->fetchAll();
    foreach ($rows as &$r) {
        $r['meta'] = json_decode($r['meta'] ?? '{}', true) ?: [];
        // never leak tokens to client
        unset($r['meta']['page_token'], $r['meta']['user_token']);
    }
    json_out(['connections' => $rows]);
}

// Step 1: Begin OAuth — return URL the browser must visit
function meta_start($m) {
    require_method('POST');
    $u = require_auth();
    $c = cfg();
    if (empty($c['meta_app_id']) || empty($c['meta_app_secret'])) {
        // Fallback to MOCK connect when app isn't configured yet
        return meta_mock_connect($u);
    }
    $state = bin2hex(random_bytes(24));
    // Store in DB (works across domains/popups where session cookie may be lost)
    db()->prepare('INSERT INTO oauth_states (state,user_id,provider) VALUES (?,?,?)')
        ->execute([$state, $u['id'], 'meta']);
    // Also keep session copy as a fallback
    start_session_once();
    $_SESSION['meta_state'] = $state;
    $_SESSION['meta_uid']   = $u['id'];
    json_out(['mode' => 'oauth', 'url' => meta_oauth_url($state)]);
}

function meta_mock_connect(array $u) {
    $pdo = db();
    $existing = $pdo->prepare('SELECT id FROM connections WHERE user_id = ? AND provider = ?');
    $existing->execute([$u['id'], 'meta']);
    if ($row = $existing->fetch()) {
        json_out(['mode' => 'mock', 'ok' => true, 'id' => $row['id']]);
    }
    $id = uuid();
    $pdo->prepare('INSERT INTO connections (id,user_id,provider,account_label,access_token,meta) VALUES (?,?,?,?,?,?)')
        ->execute([$id, $u['id'], 'meta', 'Demo Meta account', 'MOCK_TOKEN', json_encode(['mock' => true])]);
    json_out(['mode' => 'mock', 'ok' => true, 'id' => $id]);
}

// Step 2: OAuth callback — Facebook redirects here with ?code & ?state
function meta_callback($m) {
    require_method('GET');
    start_session_once();
    $code  = $_GET['code']  ?? '';
    $state = $_GET['state'] ?? '';

    $errHtml = function ($msg) {
        echo '<!doctype html><meta charset="utf-8"><title>Connect failed</title>'
           . '<body style="font-family:system-ui;padding:40px;max-width:520px;margin:auto">'
           . '<h2>Could not connect Meta</h2><p>' . htmlspecialchars($msg) . '</p>'
           . '<p><a href="/connections">Back</a></p>';
        exit;
    };

    if (!$code || !$state) $errHtml('Missing code or state from Facebook.');

    // Look up state in DB (primary), fall back to session
    $uid = null;
    $q = db()->prepare('SELECT user_id FROM oauth_states WHERE state = ? AND provider = ? AND created_at > (NOW() - INTERVAL 1 HOUR)');
    $q->execute([$state, 'meta']);
    if ($row = $q->fetch()) {
        $uid = $row['user_id'];
        db()->prepare('DELETE FROM oauth_states WHERE state = ?')->execute([$state]);
    } elseif (!empty($_SESSION['meta_state']) && hash_equals($_SESSION['meta_state'], $state)) {
        $uid = $_SESSION['meta_uid'] ?? null;
    }
    if (!$uid) $errHtml('Invalid OAuth state. Please try again.');

    try {
        $tok    = meta_exchange_code($code);
        $assets = meta_fetch_assets($tok['access_token']);
        $page   = $assets['pages'][0] ?? null; // For MVP take first page
        if (!$page) $errHtml('No Facebook Page found on this account. Create or admin a Page first.');

        $ig = $page['instagram_business_account'] ?? null;
        $meta = [
            'user_id'    => $assets['user']['id'] ?? null,
            'user_name'  => $assets['user']['name'] ?? null,
            'page_id'    => $page['id'],
            'page_name'  => $page['name'],
            'page_token' => $page['access_token'],
            'ig_user_id' => $ig['id'] ?? null,
            'ig_username'=> $ig['username'] ?? null,
        ];

        $pdo = db();
        $existing = $pdo->prepare('SELECT id FROM connections WHERE user_id = ? AND provider = ?');
        $existing->execute([$uid, 'meta']);
        $expiresAt = !empty($tok['expires_in']) ? date('Y-m-d H:i:s', time() + (int)$tok['expires_in']) : null;
        $label = $ig ? '@' . $ig['username'] . ' · ' . $page['name'] : $page['name'];
        if ($row = $existing->fetch()) {
            $pdo->prepare('UPDATE connections SET account_label=?, access_token=?, meta=?, expires_at=? WHERE id=?')
                ->execute([$label, $tok['access_token'], json_encode($meta), $expiresAt, $row['id']]);
        } else {
            $pdo->prepare('INSERT INTO connections (id,user_id,provider,account_label,access_token,meta,expires_at)
                           VALUES (?,?,?,?,?,?,?)')
                ->execute([uuid(), $uid, 'meta', $label, $tok['access_token'], json_encode($meta), $expiresAt]);
        }
        unset($_SESSION['meta_state'], $_SESSION['meta_uid']);

        // Pop-up flow: tell opener and close.
        echo '<!doctype html><meta charset="utf-8"><title>Connected</title>'
           . '<body style="font-family:system-ui;padding:40px;text-align:center">'
           . '<h2>Meta connected ✓</h2><p>You can close this window.</p>'
           . '<script>try{window.opener&&window.opener.postMessage({type:"meta-connected"},"*");window.close();}catch(e){}'
           . 'setTimeout(function(){location.href="/connections"},1200);</script>';
        exit;
    } catch (Throwable $e) {
        $errHtml($e->getMessage());
    }
}

function meta_disconnect($m) {
    require_method('POST');
    $u = require_auth();
    db()->prepare('DELETE FROM connections WHERE user_id = ? AND provider = ?')->execute([$u['id'], 'meta']);
    json_out(['ok' => true]);
}
