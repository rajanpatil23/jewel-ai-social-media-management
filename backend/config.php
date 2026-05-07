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
    // 'gemini' uses Google Gemini API keys (AIza...) directly.
    // 'lovable' uses Lovable AI Gateway keys (sk_...).
    // 'openai' uses OpenAI image keys (sk-...).
    // If blank, routes/settings.php also checks GEMINI_API_KEY / GOOGLE_API_KEY / LOVABLE_API_KEY / OPENAI_API_KEY env vars.
    'ai_provider'  => 'gemini', // 'gemini' | 'lovable' | 'openai'
    'ai_api_key'   => '',
    'ai_model'     => 'gemini-2.5-flash-image',

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
