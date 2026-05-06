<?php

function upload($m) {
    require_method('POST');
    $u = require_auth();
    if (empty($_FILES['file'])) json_out(['error' => 'no_file'], 400);

    $f = $_FILES['file'];
    if ($f['error'] !== UPLOAD_ERR_OK) json_out(['error' => 'upload_failed', 'code' => $f['error']], 400);
    if ($f['size'] > 20 * 1024 * 1024) json_out(['error' => 'too_large'], 400);

    $allowed = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp', 'video/mp4' => 'mp4'];
    $mime = mime_content_type($f['tmp_name']) ?: '';
    if (!isset($allowed[$mime])) json_out(['error' => 'unsupported_type', 'mime' => $mime], 400);

    $ext = $allowed[$mime];
    $dir = cfg()['uploads_dir'] . '/' . $u['id'];
    if (!is_dir($dir)) mkdir($dir, 0775, true);
    $name = uuid() . '.' . $ext;
    $dest = $dir . '/' . $name;
    if (!move_uploaded_file($f['tmp_name'], $dest)) json_out(['error' => 'move_failed'], 500);

    $url = cfg()['uploads_url'] . '/' . $u['id'] . '/' . $name;
    json_out(['url' => $url]);
}
