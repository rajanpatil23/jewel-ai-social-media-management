<?php
// ============================================================
//  EDIT THESE VALUES BEFORE DEPLOYING
// ============================================================

return [
    // MySQL (create the DB in hPanel → MySQL Databases)
    'db' => [
        'host'     => 'localhost',
        'name'     => 'CHANGE_ME_dbname',
        'user'     => 'CHANGE_ME_dbuser',
        'pass'     => 'CHANGE_ME_dbpass',
        'charset'  => 'utf8mb4',
    ],

    // Random long string. Used to sign sessions / CSRF.
    // Generate one: `php -r "echo bin2hex(random_bytes(32));"`
    'app_secret' => 'CHANGE_ME_to_a_long_random_string',

    // Public site URL (no trailing slash). Used for absolute upload URLs.
    'site_url' => 'https://yourdomain.com',

    // Uploads directory (filesystem path, relative to /api/)
    'uploads_dir' => __DIR__ . '/uploads',
    'uploads_url' => '/api/uploads',

    // ---- AI image generation ----
    // Option A: Lovable AI Gateway (recommended — supports image gen)
    //   https://ai.gateway.lovable.dev/v1/...
    //   Get key from your Lovable workspace → Settings → AI.
    // Option B: OpenAI / Stability / Replicate — adapt routes/ai.php.
    'ai_provider'  => 'lovable', // 'lovable' | 'openai' | 'mock'
    'ai_api_key'   => 'CHANGE_ME_or_leave_blank_for_mock',
    'ai_model'     => 'google/gemini-2.5-flash-image-preview',

    // ---- Meta (Facebook + Instagram) ----
    // Create a Meta App at https://developers.facebook.com/
    // For production publishing you need App Review for:
    //   pages_manage_posts, instagram_content_publish, etc.
    'meta_app_id'      => '',
    'meta_app_secret'  => '',
    'meta_redirect_uri'=> 'https://yourdomain.com/api/connections/meta/callback',

    // Session cookie lifetime (seconds). 30 days default.
    'session_lifetime' => 60 * 60 * 24 * 30,
];
