<?php
// One-time installer. Re-runnable. DELETE THIS FILE after a successful run in production.
// This version runs each statement independently so a single failure doesn't abort the rest,
// and reports per-statement status so we can see exactly which DDL the DB rejects.

require __DIR__ . '/db.php';

header('Content-Type: text/plain; charset=utf-8');

try {
    $pdo = db();
} catch (Throwable $e) {
    http_response_code(500);
    echo "FATAL: cannot connect to DB — " . $e->getMessage();
    exit;
}

// Show server version so we can rule out MariaDB/MySQL version mismatches.
try {
    $ver = $pdo->query('SELECT VERSION()')->fetchColumn();
    echo "DB server version: $ver\n\n";
} catch (Throwable $e) {
    echo "DB version check failed: " . $e->getMessage() . "\n\n";
}

$statements = [
    'users' => "CREATE TABLE IF NOT EXISTS users (
        id              CHAR(36) PRIMARY KEY,
        email           VARCHAR(255) NOT NULL UNIQUE,
        password_hash   VARCHAR(255) NOT NULL,
        name            VARCHAR(120) NOT NULL,
        created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

    'gallery' => "CREATE TABLE IF NOT EXISTS gallery (
        id          CHAR(36) PRIMARY KEY,
        user_id     CHAR(36) NOT NULL,
        src         TEXT NOT NULL,
        label       VARCHAR(255) NOT NULL DEFAULT '',
        created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX (user_id, created_at),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

    // Note: `meta` was JSON. Some older MariaDB builds choke on JSON in DDL — use LONGTEXT for max compatibility.
    'connections' => "CREATE TABLE IF NOT EXISTS connections (
        id              CHAR(36) PRIMARY KEY,
        user_id         CHAR(36) NOT NULL,
        provider        VARCHAR(40) NOT NULL,
        account_label   VARCHAR(255) NOT NULL DEFAULT '',
        access_token    TEXT,
        refresh_token   TEXT,
        meta            LONGTEXT,
        expires_at      DATETIME NULL,
        created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uniq_user_provider (user_id, provider),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

    'posts' => "CREATE TABLE IF NOT EXISTS posts (
        id              CHAR(36) PRIMARY KEY,
        user_id         CHAR(36) NOT NULL,
        title           VARCHAR(255) NOT NULL DEFAULT '',
        caption_ig      TEXT,
        caption_fb      TEXT,
        media_url       TEXT,
        media_urls      LONGTEXT NULL,
        format          VARCHAR(20) NOT NULL DEFAULT 'image',
        platforms       VARCHAR(120) NOT NULL DEFAULT 'instagram,facebook',
        status          VARCHAR(20) NOT NULL DEFAULT 'draft',
        scheduled_at    DATETIME NULL,
        published_at    DATETIME NULL,
        last_error      TEXT,
        created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX (user_id, scheduled_at),
        INDEX (status, scheduled_at),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

    'posts.media_urls (migration)' => "ALTER TABLE posts ADD COLUMN media_urls LONGTEXT NULL AFTER media_url",

    'user_settings' => "CREATE TABLE IF NOT EXISTS user_settings (
        user_id     CHAR(36) PRIMARY KEY,
        ai_provider VARCHAR(40) NOT NULL DEFAULT 'gemini',
        ai_api_key  TEXT,
        ai_model    VARCHAR(120) NOT NULL DEFAULT 'gemini-2.5-flash-image',
        updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

    'oauth_states' => "CREATE TABLE IF NOT EXISTS oauth_states (
        state       CHAR(64) PRIMARY KEY,
        user_id     CHAR(36) NOT NULL,
        provider    VARCHAR(40) NOT NULL,
        created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",
];

$failed = 0;
foreach ($statements as $name => $sql) {
    try {
        $pdo->exec($sql);
        echo "[OK]   $name\n";
    } catch (Throwable $e) {
        // Treat "duplicate column" / "already exists" on the migration as success.
        $msg = $e->getMessage();
        if (str_contains($msg, 'Duplicate column') || str_contains($msg, 'already exists')) {
            echo "[SKIP] $name — " . $msg . "\n";
            continue;
        }
        $failed++;
        echo "[FAIL] $name\n       " . $msg . "\n";
    }
}

echo "\n";
echo $failed === 0
    ? "All done. You can DELETE install.php now.\n"
    : "Finished with $failed failure(s) above. Fix them and re-run.\n";
