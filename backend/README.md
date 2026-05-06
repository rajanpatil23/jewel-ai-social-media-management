# Advora PHP Backend (Hostinger)

Drop-in PHP backend for the Advora frontend. Designed for Hostinger shared hosting (PHP 8.1+, MySQL, Apache with mod_rewrite).

## Deploy

1. Build the frontend: `npm run build` → produces `dist/`
2. In Hostinger File Manager, open `public_html/`
3. Upload everything inside `dist/` to `public_html/` (so `index.html` sits at the root)
4. Upload everything inside `backend/` to `public_html/api/` (so `public_html/api/index.php` exists)
5. Edit `public_html/api/config.php` with your MySQL credentials and a strong `APP_SECRET`
6. Visit `https://yourdomain.com/api/install.php` ONCE to create tables, then DELETE that file
7. Set up a cron job in hPanel:
   `*/1 * * * * /usr/bin/php /home/USERNAME/public_html/api/cron.php >> /home/USERNAME/cron.log 2>&1`

The frontend talks to `/api/*` (same origin) so no CORS config is needed.

## Endpoints (all under `/api/`)

- `POST /api/auth/register` `{email, password, name}`
- `POST /api/auth/login`    `{email, password}`
- `POST /api/auth/logout`
- `GET  /api/auth/me`
- `GET  /api/gallery`
- `POST /api/gallery` `{src, label}`            (upload also via `/api/upload`)
- `POST /api/upload` (multipart `file`) → `{url}`
- `GET  /api/connections`
- `POST /api/connections/meta/connect`          (mock — replace with real OAuth)
- `POST /api/connections/meta/disconnect`
- `GET  /api/posts`
- `POST /api/posts` `{title, captionIg, captionFb, mediaUrl, format, scheduledAt}`
- `PATCH /api/posts/{id}` `{...}`
- `DELETE /api/posts/{id}`
- `POST /api/ai/generate` `{prompt, ratio, style, count}` → returns image URLs
   (server-side proxy — put your AI key in `config.php` so it stays secret)

## Files

- `index.php`     – front controller / router
- `config.php`    – DB + secrets (EDIT THIS)
- `db.php`        – PDO singleton
- `helpers.php`   – json/auth/validate helpers
- `install.php`   – one-time schema setup (DELETE after running)
- `cron.php`      – scheduler worker (publishes due posts)
- `routes/*.php`  – per-feature handlers
- `.htaccess`     – pretty URLs + protect sensitive files
- `uploads/`      – user files (auto-created, served at `/api/uploads/...`)
