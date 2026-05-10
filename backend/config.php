<?php
// ============================================================
//  EDIT THESE VALUES BEFORE DEPLOYING
// ============================================================

return [
    // MySQL (create the DB in hPanel → MySQL Databases)
    'db' => [
        'host'     => 'localhost',
        'name'     => 'u788338702_EkhadiJewels',
        'user'     => 'u788338702_EkhadiJewels',
        'pass'     => 'EkhadiJewels@123',
        'charset'  => 'utf8mb4',
    ],

    // Random long string. Used to sign sessions / CSRF.
    // Generate one: `php -r "echo bin2hex(random_bytes(32));"`
    'app_secret' => 'CHANGE_ME_to_a_long_random_string',

    // Public site URL (no trailing slash). Used for absolute upload URLs.
    'site_url' => 'https://ekhadijewels-demo.advora.in',

    // Uploads directory (filesystem path, relative to /api/)
    'uploads_dir' => __DIR__ . '/uploads',
    'uploads_url' => '/api/uploads',

    // ---- AI image generation ----
    // 'gemini' uses Google Gemini API keys (AIza...) directly.
    // 'lovable' uses Lovable AI Gateway keys (sk_...).
    // 'openai' uses OpenAI image keys (sk-...).
    // If blank, routes/settings.php also checks GEMINI_API_KEY / GOOGLE_API_KEY / LOVABLE_API_KEY / OPENAI_API_KEY env vars.
    'ai_provider'  => 'gemini', // 'gemini' | 'lovable' | 'openai'
    'ai_api_key'   => 'AIzaSyA3XQTuy9gCiVc6wiOZj9lt4Zn5sN8lcNk', // RAJAN backup: 'AIzaSyBrHe5LAg8M-wxjd4cqSfT7KwR54ZPU5rk'
    'ai_model'     => 'gemini-2.5-flash-image',

    // ---- Meta (Facebook + Instagram) ----
    // Create a Meta App at https://developers.facebook.com/
    // For production publishing you need App Review for:
    //   pages_manage_posts, instagram_content_publish, etc.
    'meta_app_id'      => '1019319593993048',
    'meta_app_secret'  => '61031afc1f6ca7a8aced9d1788165400',
    'meta_redirect_uri'=> 'https://ekhadijewels-demo.advora.in/api/connections/meta/callback',

    // Session cookie lifetime (seconds). 30 days default.
    'session_lifetime' => 60 * 60 * 24 * 30,
];
