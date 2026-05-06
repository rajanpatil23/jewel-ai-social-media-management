# Hostinger Upload — Meta Data Deletion Callback

These files are **NOT part of the React build**. Upload them manually to your
Hostinger account via File Manager or FTP.

## Files

| Local path                                     | Upload to (on Hostinger)                          |
| ---------------------------------------------- | ------------------------------------------------- |
| `data-deletion/index.php`                      | `public_html/data-deletion/index.php`             |
| `data-deletion-status.html`                    | `public_html/data-deletion-status.html`           |

## Resulting public URLs

- Callback (POST):   `https://ekhadijewels-demo.advora.in/data-deletion`
- Status page (GET): `https://ekhadijewels-demo.advora.in/data-deletion-status.html`

## Before uploading — EDIT ONE VALUE

Open `data-deletion/index.php` and replace:

```
$APP_SECRET = 'PASTE_YOUR_META_APP_SECRET_HERE';
```

with your real **Meta App Secret** (Meta App Dashboard → Settings → Basic →
App Secret → "Show").

## Set in Meta Dashboard

App Dashboard → Settings → Basic → **Data Deletion Callback URL**:

```
https://ekhadijewels-demo.advora.in/data-deletion
```

## Quick test (after upload)

```bash
curl -X POST https://ekhadijewels-demo.advora.in/data-deletion \
     -d "signed_request=invalid"
```

Expected response: `{"error":"Missing or malformed signed_request"}` (HTTP 400).
That confirms PHP is executing and the endpoint is reachable.
