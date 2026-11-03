# Architecture — Instagram Automation Pro

## Design first (as requested)

```
User (browser)
  │  React + TS + Tailwind (Cloudflare Pages)
  │  Supabase Auth (email) + Supabase Realtime (activity feed)
  ▼
Backend — Node + Express (free Node host; modular, host-swappable)
  ├─ /auth/instagram/*      Meta OAuth: login → code → long-lived token
  ├─ /api/instagram/*       account, media list, disconnect, token status
  ├─ /api/campaigns/*       CRUD, pause/resume, duplicate, stats
  ├─ /api/templates/*       DM + public-reply templates
  ├─ /api/comments/*        list / search / filter
  ├─ /api/activity/*        automation_logs feed
  ├─ /api/settings/*        setup checklist, webhook/db/token status
  └─ /webhook/instagram     GET verify (hub.challenge) · POST events
        │  verify X-Hub-Signature-256 (HMAC-SHA256, app secret)
        │  store raw event (webhook_events, unique delivery id)
        │  idempotent process: INSERT instagram_comments ON CONFLICT DO NOTHING
        ▼
  Automation engine (src/services/automation.js)
    1. Load active campaigns for media_id (or all-media campaigns)
    2. Keyword engine: normalise (trim, lowercase when case-insensitive),
       exact vs contains, any-of vs all-of, any-comment mode
    3. First matching enabled rule wins (rules ordered by priority);
       record which rule triggered
    4. Duplicate guard: automation_logs unique (comment_id, action)
       + instagram_comments.dm_sent / public_reply_sent flags
    5. Private reply: POST /{comment-id}/private_replies {message}
       — one per comment, ≤7 days old, own media only
    6. Public reply: POST /{comment-id}/replies {message} (optional delay,
       manual-review mode holds it as `pending_review` instead of sending)
    7. Log every step to automation_logs; failures → retry queue (3 attempts,
       exponential backoff 5s / 30s / 5min) — never a silent drop
        │
        ▼
  Supabase Postgres (free tier)
    users · instagram_accounts · access_tokens (server-side only)
    campaigns · campaign_triggers · keyword_rules
    dm_templates · public_reply_templates
    instagram_media · instagram_comments · automation_logs · webhook_events
    RLS: every row is scoped to owner_id = auth.uid(); service-role key is
    used only by the backend.
  Meta Instagram Graph API
    OAuth, /{ig-user-id}/media, /{media-id}/comments,
    /{comment-id}/private_replies, /{comment-id}/replies
```

## Why this shape

- **Backend is the only place that touches Meta / tokens.** The frontend
  never sees an access token, app secret, or service-role key.
- **Host-swappable:** Express routes have no host-specific code. Move the
  same `backend/` to Render, Railway, Fly.io, or a VPS unchanged; only the
  `META_REDIRECT_URI` / webhook URL change.
- **Demo vs Live is explicit:** `VITE_DEMO_MODE=true` (frontend) and
  missing Supabase/Meta env (backend) both produce a visible
  *Setup required / Demo mode* banner. Live mode never fakes a send.

## Matching engine (exact rules)

- Normalisation: trim; lowercase both comment and keyword when
  `case_insensitive` (default true). Unicode-aware, emoji pass through.
- `exact`: comment text (after trim) equals keyword.
- `contains`: comment includes keyword as a substring. "kurti" matches
  "I want kurti", "Send me kurti link", "KURTI!!" (case-insensitive).
- `match_mode: any` — any keyword in the group matches. `all` — every
  keyword must match (contains-mode: every keyword present).
- `any_comment: true` — keyword list is ignored; every comment triggers.
  Priority: keyword rules are evaluated before any-comment rules in the
  same campaign, so a KURTI comment gets the KURTI DM, not the general one.
- A comment is processed once: `instagram_comments.processed_at` +
  unique `(comment_id, action)` in `automation_logs`.

## Webhook flow

1. Meta `GET /webhook/instagram?hub.mode=subscribe&hub.verify_token=…&
   hub.challenge=…` → backend checks verify token, returns challenge.
2. Meta `POST` with `X-Hub-Signature-256: sha256=<hmac>` → verify before
   any processing; reject (401) on mismatch, log to `webhook_events`.
3. Entry: `{field: "comments", value: {id: comment_id, media_id, text,
   from: {id, username}, parent_id?}}`. Store raw JSON, then process
   asynchronously (respond 200 fast — Meta retries on slow/timeout).
4. Only top-level comments on own media trigger private replies; replies
   to comments are logged but not auto-DM'd (prevents loops).

## Failure / retry

- Transient Graph errors (5xx, rate-limit 429 with `retry-after`): queue
  retry, respect `Retry-After`, back off. Permanent errors (4xx except
  429, e.g. permission revoked, comment deleted, >7 days): mark failed
  with the Meta error message, surface it in the activity feed, do not
  retry forever.
- Token expired: `GET /{ig-user-id}?fields=…` 190 error → account status
  becomes `token_expired`, dashboard banner prompts reconnect; long-lived
  tokens are refreshed on a schedule when Meta supports it (60-day tokens).
