<?php

function register($m) {
    require_method('POST');
    $b = json_in();
    $email = strtolower(trim($b['email'] ?? ''));
    $pass  = (string)($b['password'] ?? '');
    $name  = trim((string)($b['name'] ?? ''));

    if (!valid_email($email))           json_out(['error' => 'invalid_email'], 400);
    if (strlen($pass) < 8)              json_out(['error' => 'weak_password'], 400);
    if ($name === '' || strlen($name) > 120) json_out(['error' => 'invalid_name'], 400);

    $pdo = db();
    $exists = $pdo->prepare('SELECT 1 FROM users WHERE email = ?');
    $exists->execute([$email]);
    if ($exists->fetch()) json_out(['error' => 'email_taken'], 409);

    $id = uuid();
    $hash = password_hash($pass, PASSWORD_BCRYPT);
    $pdo->prepare('INSERT INTO users (id,email,password_hash,name) VALUES (?,?,?,?)')
        ->execute([$id, $email, $hash, $name]);

    start_session_once();
    session_regenerate_id(true);
    $_SESSION['uid'] = $id;

    json_out(['user' => ['id' => $id, 'email' => $email, 'name' => $name]]);
}

function login($m) {
    require_method('POST');
    $b = json_in();
    $email = strtolower(trim($b['email'] ?? ''));
    $pass  = (string)($b['password'] ?? '');
    if (!$email || !$pass) json_out(['error' => 'missing_credentials'], 400);

    $u = db()->prepare('SELECT id,email,name,password_hash FROM users WHERE email = ?');
    $u->execute([$email]);
    $row = $u->fetch();
    if (!$row || !password_verify($pass, $row['password_hash'])) {
        json_out(['error' => 'invalid_credentials'], 401);
    }

    start_session_once();
    session_regenerate_id(true);
    $_SESSION['uid'] = $row['id'];

    json_out(['user' => ['id' => $row['id'], 'email' => $row['email'], 'name' => $row['name']]]);
}

function logout($m) {
    start_session_once();
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $p = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000, $p['path'], $p['domain'], $p['secure'], $p['httponly']);
    }
    session_destroy();
    json_out(['ok' => true]);
}

function me($m) {
    $u = require_auth();
    json_out(['user' => $u]);
}
