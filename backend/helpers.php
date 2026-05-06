<?php

function start_session_once(): void {
    if (session_status() === PHP_SESSION_ACTIVE) return;
    $c = cfg();
    session_set_cookie_params([
        'lifetime' => $c['session_lifetime'],
        'path'     => '/',
        'secure'   => !empty($_SERVER['HTTPS']),
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    session_name('advora_sid');
    session_start();
}

function json_out($data, int $status = 200): void {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

function json_in(): array {
    $raw = file_get_contents('php://input');
    if (!$raw) return [];
    $d = json_decode($raw, true);
    return is_array($d) ? $d : [];
}

function require_method(string $method): void {
    if ($_SERVER['REQUEST_METHOD'] !== strtoupper($method)) {
        json_out(['error' => 'method_not_allowed'], 405);
    }
}

function require_auth(): array {
    start_session_once();
    if (empty($_SESSION['uid'])) json_out(['error' => 'unauthenticated'], 401);
    $u = db()->prepare('SELECT id,email,name,created_at FROM users WHERE id = ?');
    $u->execute([$_SESSION['uid']]);
    $row = $u->fetch();
    if (!$row) {
        session_destroy();
        json_out(['error' => 'unauthenticated'], 401);
    }
    return $row;
}

function valid_email(string $e): bool {
    return (bool) filter_var($e, FILTER_VALIDATE_EMAIL) && strlen($e) <= 255;
}

function uuid(): string {
    $d = random_bytes(16);
    $d[6] = chr((ord($d[6]) & 0x0f) | 0x40);
    $d[8] = chr((ord($d[8]) & 0x3f) | 0x80);
    return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($d), 4));
}
