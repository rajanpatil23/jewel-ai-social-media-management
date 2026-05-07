<?php
// One-time installer. DELETE THIS FILE after running it once.

require __DIR__ . '/db.php';

try {
    $pdo = db();

    $pdo->exec("CREATE TABLE IF NOT EXISTS users (
        id              CHAR(36) PRIMARY KEY,
        email           VARCHAR(255) NOT NULL UNIQUE,
        password_hash   VARCHAR(255) NOT NULL,
        name            VARCHAR(120) NOT NULL,
        created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    $pdo->exec("CREATE TABLE IF NOT EXISTS gallery (
        id          CHAR(36) PRIMARY KEY,
        user_id     CHAR(36) NOT NULL,
        src         TEXT NOT NULL,
        label       VARCHAR(255) NOT NULL DEFAULT '',
        created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX (user_id, created_at),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    $pdo->exec("CREATE TABLE IF NOT EXISTS connections (
        id              CHAR(36) PRIMARY KEY,
        user_id         CHAR(36) NOT NULL,
        provider        VARCHAR(40) NOT NULL,
        account_label   VARCHAR(255) NOT NULL DEFAULT '',
        access_token    TEXT,
        refresh_token   TEXT,
        meta            JSON,
        expires_at      DATETIME NULL,
        created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uniq_user_provider (user_id, provider),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    $pdo->exec("CREATE TABLE IF NOT EXISTS posts (
        id              CHAR(36) PRIMARY KEY,
        user_id         CHAR(36) NOT NULL,
        title           VARCHAR(255) NOT NULL DEFAULT '',
        caption_ig      TEXT,
        caption_fb      TEXT,
        media_url       TEXT,
        media_urls      JSON NULL,
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
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    // Idempotent migration: add media_urls if missing on existing installs
    try { $pdo->exec("ALTER TABLE posts ADD COLUMN media_urls JSON NULL AFTER media_url"); } catch (Throwable $e) {}

    // Per-user settings (BYOK API keys + preferences)
    $pdo->exec("CREATE TABLE IF NOT EXISTS user_settings (
        user_id     CHAR(36) PRIMARY KEY,
        ai_provider VARCHAR(40) NOT NULL DEFAULT 'lovable',
        ai_api_key  TEXT,
        ai_model    VARCHAR(120) NOT NULL DEFAULT 'google/gemini-2.5-flash-image',
        updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    // OAuth state store — survives cross-domain popup flows where PHP session cookie is lost.
    $pdo->exec("CREATE TABLE IF NOT EXISTS oauth_states (
        state       CHAR(64) PRIMARY KEY,
        user_id     CHAR(36) NOT NULL,
        provider    VARCHAR(40) NOT NULL,
        created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    echo "OK — tables created. Now DELETE install.php.";
} catch (Throwable $e) {
    http_response_code(500);
    echo "ERROR: " . htmlspecialchars($e->getMessage());
}
