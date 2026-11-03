# Meta Developer App Setup — Instagram Graph API

Do this in order. Nothing here needs a paid plan; Meta app review is free
but takes time and is **required** before strangers (anyone who is not a
test user / admin of the app) can connect or receive automations.

## 1. Prerequisites
- An Instagram **Professional** account (Business or Creator). Personal
  accounts cannot use the Graph API. Switch in Instagram: Settings →
  Account type → Switch to professional account.
- A Facebook Page linked to that Instagram account (required by the Graph
  API for Business/Creator accounts).
- A Meta developer account (developers.facebook.com, free).

## 2. Create the app
1. developers.facebook.com → My Apps → Create App → **Other** → **Business**.
2. Add product **Instagram Graph API** (and Facebook Login for OAuth if
   offered separately in your region — the Instagram login flow is via
   Facebook Login with Instagram scopes).
3. Settings → Basic: note **App ID** and **App Secret** → backend `.env`
   (`META_APP_ID`, `META_APP_SECRET`). Set App Domains to your backend
   domain and Privacy Policy / Terms URLs (required for review — a simple
   page on your site is enough).

## 3. Permissions to request
| Permission | Why |
|---|---|
| `instagram_basic` | Read profile + media |
| `instagram_manage_comments` | Read comments + post public replies |
| `instagram_manage_messages` | Send private replies (comment-to-DM) |
| `pages_read_engagement` | Page / account linkage |
| `instagram_manage_insights` | (optional) comment/reach counts in Analytics |

Request only what you use. In **Development mode** these work only for
app admins / test users — add yourself as a test user first, test, then
submit for review.

## 4. OAuth redirect
- Facebook Login → Settings → Valid OAuth Redirect URIs: add
  `https://<your-backend>/auth/instagram/callback`
- Must be HTTPS in production and must match `META_REDIRECT_URI` exactly.

## 5. Webhook subscription
1. In the app dashboard: Webhooks → Instagram → Subscribe to
   `comments` (and `messages` only if you later add conversation handling).
2. Callback URL: `https://<your-backend>/webhook/instagram`
3. Verify token: the same long random string as `META_WEBHOOK_VERIFY_TOKEN`.
4. Meta will GET-verify it (see `backend/src/routes/webhook.js`).
5. Subscribe the Page: the backend does this after OAuth via
   `POST /{page-id}/subscribed_apps` — or do it manually in the dashboard.

## 6. App review
App Review → Permissions and Features → request each permission above with:
- a screencast showing login → connect → create automation → comment →
  DM received, and
- a written use case: “When a user comments a keyword on my own post, I
  send one private reply with a shopping link they asked for.”
Expect follow-up questions. Do not submit until the end-to-end flow works
in Development mode.

## 7. Token lifecycle
- Short-lived token (from OAuth code, ~1h) is exchanged server-side for a
  **long-lived token (~60 days)** and stored in `access_tokens`.
- Refresh before expiry (`GET /oauth/access_token?grant_type=fb_exchange_token`
  flow); the app shows expiry in Settings and warns 7 days before.
- Disconnect deletes the token row and revokes it at Meta where supported.
