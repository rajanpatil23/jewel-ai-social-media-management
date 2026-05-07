# Advora — PHP backend (Hostinger)

Drop the contents of this folder into `public_html/api/` on your Hostinger
shared host. The frontend (built from `npm run build` → `dist/`) goes in
`public_html/`.

## One-time setup

1. **Create MySQL DB** in hPanel → MySQL Databases. Note the host, db name,
   user, password.
2. **Edit `config.php`** with those creds and a long random `app_secret`.
3. **Visit** `https://yourdomain.com/api/install.php` once → tables are
   created → **DELETE that file**.
4. **Cron job** (hPanel → Advanced → Cron Jobs):
   ```
   */1 * * * * /usr/bin/php /home/USER/public_html/api/cron.php >> /home/USER/cron.log 2>&1
   ```

## Meta (Facebook + Instagram) OAuth

1. Create a Meta app at https://developers.facebook.com/ → add product
   **Facebook Login**.
2. Set the OAuth redirect URI to:
   `https://yourdomain.com/api/connections/meta/callback`
3. Put **App ID + App Secret** in `config.php` (`meta_app_id`,
   `meta_app_secret`).
4. For real publishing in production you must submit App Review for these
   scopes (Meta requires it):
   - `pages_show_list`, `pages_manage_posts`, `pages_read_engagement`
   - `instagram_basic`, `instagram_content_publish`,
     `instagram_manage_insights`, `business_management`
5. Until App Review is granted, only people listed as **Roles** in your Meta
   app can connect.
6. Instagram requires a **Business** or **Creator** IG account that is
   linked to a Facebook Page you admin.

When `meta_app_id` is empty, `/connections/meta/connect` falls back to a
**mock connection** so the rest of the app stays usable.

## AI image generation

`config.php` → `ai_provider`:
- `gemini` → uses Google Gemini API keys directly (`AIza...`)
- `lovable` → uses Lovable AI Gateway keys (`sk_...`)
- `openai` → uses OpenAI Images keys (`sk-...`)

Per-user keys saved in Settings are used first. If no user key is saved, the
backend falls back to `config.php`, then environment variables like
`GEMINI_API_KEY`, `GOOGLE_API_KEY`, `LOVABLE_API_KEY`, or `OPENAI_API_KEY`.

## API surface

| Method | Path                              | Notes                                  |
|--------|-----------------------------------|----------------------------------------|
| POST   | `/api/auth/register`              | `{ email, password, name }`            |
| POST   | `/api/auth/login`                 | `{ email, password }`                  |
| POST   | `/api/auth/logout`                |                                        |
| GET    | `/api/auth/me`                    |                                        |
| GET/POST/DELETE | `/api/gallery[?id]`      | per-user creative gallery              |
| POST   | `/api/upload`                     | multipart `file=` → returns public URL |
| GET    | `/api/connections`                |                                        |
| POST   | `/api/connections/meta/connect`   | returns `{ mode, url? }`               |
| GET    | `/api/connections/meta/callback`  | OAuth landing                          |
| POST   | `/api/connections/meta/disconnect`|                                        |
| GET/POST | `/api/posts`                    | list / create                          |
| GET/PATCH/DELETE | `/api/posts/{id}`       |                                        |
| GET    | `/api/analytics/summary`          | totals + Meta insights                 |
| POST   | `/api/ai/generate`                | `{ prompt, count, ratio, style }`      |
| GET    | `/api/health`                     |                                        |

## Local dev

```
php -S localhost:8000 -t backend backend/index.php
npm run dev   # vite proxies /api → :8000
```
