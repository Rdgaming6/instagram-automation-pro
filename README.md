# Instagram Automation Pro — Free Self-Hosted Platform

A complete, production-ready, self-hosted Instagram automation app for
Instagram Professional (Business / Creator) accounts. Connect via official
Meta OAuth, build comment-to-DM and public-reply automations, and watch them
run in a live dashboard.

**Zero software subscription cost by design.** No ManyChat, Zapier, Make,
paid AI, or paid automation service. Free tiers only: Supabase (Postgres +
Auth + Realtime), Cloudflare Pages (frontend), and a free Node host for the
backend (Render free tier / Railway trial / Fly.io free allowance — see
`docs/DEPLOYMENT.md` for limits). Meta's Instagram Graph API itself is free;
Meta app review is required for live use (see `docs/META_SETUP.md`).

> **Honest status:** this repo ships in **Demo mode by default** with
> realistic seed data so every page, button and rule can be explored without
> credentials. Switch to **Live mode** only after Supabase + Meta are
> configured — the app then shows a clear *Setup required* state instead of
> faking successful Instagram sends. It never simulates a live DM.

## What it does

- **Meta OAuth** — connect a Professional Instagram account, show username /
  avatar / status, refresh long-lived tokens, disconnect cleanly. No password
  is ever asked for or stored.
- **Comment-to-DM (Option A/B/C)** — Specific Keyword (exact / contains /
  case-insensitive, any-of / all-of), Any Comment, and multiple keyword
  groups with different DM templates per rule.
- **Public comment replies** — keyword or any-comment public replies on your
  own media only, with delay, manual-review mode, and independent on/off.
- **Campaign builder** — name, media, triggers, DM + public reply, pause /
  resume / duplicate / delete, per-campaign stats and activity.
- **Posts & Reels** — gallery from the Graph API (`/{ig-user-id}/media`),
  thumbnail, caption, type, date, comment count, automation status.
- **Live dashboard + activity feed** — comments, keyword matches, any-comment
  triggers, DMs sent, public replies sent, failures, active/paused campaigns.
- **Comments manager** — search, filter by keyword / media, triggered?,
  DM sent?, public reply sent?, duplicates / failures.
- **Templates** — DM + public-reply templates with preview and a
  *test-formatting* preview that never sends a DM.
- **Safety by construction** — one private reply per comment (Meta rule),
  idempotent webhook processing (unique `comment_id`, DB constraints),
  duplicate-DM prevention, retry with backoff, webhook signature
  verification, tokens stored server-side only, rate-limit respect.

## Repo layout

```
instagram-automation-pro/
├── frontend/          React 18 + TypeScript + Vite + Tailwind + shadcn-style UI
├── backend/           Node.js + Express (modular — swap host without touching routes)
│   ├── src/routes/    auth, instagram, campaigns, templates, comments, activity, webhook
│   ├── src/lib/       supabase, meta graph client, keyword matching, rate limit
│   └── src/services/  automation engine (the webhook → match → reply pipeline)
├── supabase/
│   ├── migrations/0001_init.sql   users, instagram_accounts, access_tokens,
│   │                             campaigns, campaign_triggers, keyword_rules,
│   │                             dm_templates, public_reply_templates,
│   │                             instagram_media, instagram_comments,
│   │                             automation_logs, webhook_events (+ RLS)
│   └── seed-demo.sql  realistic demo data used by Demo mode
├── docs/
│   ├── ARCHITECTURE.md  full design: data flow, webhook flow, matching engine
│   ├── META_SETUP.md    Meta app, permissions, app review, webhook subscription
│   ├── DEPLOYMENT.md    Supabase + Cloudflare Pages + free backend host
│   ├── TESTING.md       unit, webhook-simulation, and end-to-end checklists
│   └── LIMITS.md        free-tier limits, Meta limits, what is NOT possible
└── .env.example
```

## Quick start (Demo mode — no credentials)

```bash
# Frontend
cd frontend && npm install && npm run dev      # http://localhost:5173

# Backend (demo mode, in-memory demo store when Supabase is not configured)
cd backend && npm install && npm test && npm run dev   # http://localhost:3001
```

Open the frontend, explore Dashboard → Create Automation → pick a Reel →
choose **[ Specific Keyword ]** or **[ Any Comment ]** → save. Everything
works against demo data until you connect Supabase + Meta.

## Quick start (Live mode)

1. Supabase: create a free project, run `supabase/migrations/0001_init.sql`
   in the SQL editor, enable Auth (email), copy URL + anon + service-role keys.
2. Meta: follow `docs/META_SETUP.md` — create a Meta app, add Instagram
   Graph API, request `instagram_basic`, `instagram_manage_comments`,
   `instagram_manage_messages`, `pages_read_engagement`,
   `instagram_manage_insights` (as needed), set the webhook, submit for app
   review. **Development mode only reaches test users / your own account.**
3. Backend: copy `.env.example` → `.env`, fill it, deploy to a free Node
   host (see `docs/DEPLOYMENT.md`). Set the webhook URL in Meta to
   `https://<your-backend>/webhook/instagram`.
4. Frontend: deploy `frontend/` to Cloudflare Pages, set
   `VITE_API_URL` and `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`.
5. In Settings, connect Instagram. The Setup checklist turns green only
   when each piece is actually verified.

Full steps: `docs/DEPLOYMENT.md`. Permissions list: `docs/META_SETUP.md`.

## Key Meta rules this app enforces (not workarounds)

- Private replies: **one per comment**, only via the official
  `POST /{comment-id}/private_replies` endpoint, only within 7 days of the
  comment, only for comments on your own media. No unsolicited follow-up DMs.
- Public replies: only on comments on your own media.
- Webhooks: Instagram sends comment events only for media you own and only
  while the webhook subscription is active. Selecting “all posts” means
  *all posts created after the webhook is live and eligible* — historical
  comments are not retroactively delivered.
- Messaging windows, rate limits and the 24-hour human-agent window for
  normal (non-private-reply) DMs are respected; the app does not send a
  second DM to the same commenter from the same comment.

See `docs/LIMITS.md` before promising anything to a client.
