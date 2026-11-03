# Limits — read before promising anything

## Free-tier limits (honest, not “unlimited”)
- **Supabase free:** 500 MB database, 50,000 monthly active users,
  2 GB bandwidth, 500k Edge Function invocations (not used here). Enough
  for one account + thousands of comments/month; large media/comment
  history will eventually need the $25/mo Pro tier.
- **Cloudflare Pages free:** 500 builds/month, unlimited bandwidth for
  static assets. Fine.
- **Render free:** sleeps after 15 min idle; 750 instance-hours/month.
  A sleeping backend can miss a webhook delivery window — Meta retries,
  but a comment may be processed late. For a 24/7 webhook, use an
  always-on free VM (Oracle Always Free) or a paid $5–7/mo host.
- **Meta Graph API:** free, but rate-limited (roughly 200 calls/hour per
  user for most Instagram endpoints, plus per-app limits). The backend
  respects 429 + `Retry-After` and queues retries.

## What Meta does NOT permit (no workaround in this app)
- Private replies: **one per comment**, within **7 days** of the comment,
  only on **your own media**, only via the official private-reply endpoint.
  You cannot DM someone who never commented, and you cannot send a second
  DM for the same comment.
- Normal DMs outside the private-reply flow need the recipient to have
  messaged you first and are subject to the 24-hour messaging window.
- Webhooks deliver only **new** comments after subscription; historical
  comments are never delivered. “Apply to all posts” therefore means all
  eligible posts going forward, not a backfill of old comments.
- Only Professional (Business/Creator) Instagram accounts. Personal
  accounts, scraping, and browser automation are not supported and would
  violate Meta policy — this app contains none of them.
- **Development mode:** only app admins/test users can connect or be
  automated. Live use by anyone else requires Meta app review (see
  `docs/META_SETUP.md`).
- Instagram may throttle or block accounts that send high volumes of
  near-identical replies. Keep delays, vary templates, and never automate
  replies to spam/abusive comments — use manual review mode for that.

## What this app does not do
- No AI generation, no paid AI model, no auto-follow/unfollow, no liking,
  no story automation, no scraping, no password storage.
