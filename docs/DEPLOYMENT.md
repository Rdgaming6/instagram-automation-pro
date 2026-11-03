# Deployment — free tier

## Supabase (free tier)
1. supabase.com → New project (free tier: 500 MB DB, 50k monthly active
   users, 2 GB bandwidth — ample for a single-account automation app).
2. SQL Editor → paste `supabase/migrations/0001_init.sql` → Run.
   Optional demo data: `supabase/seed-demo.sql` (Demo mode only — do not
   seed into a live account).
3. Authentication → Providers → Email enabled; Site URL =
   your Cloudflare Pages URL; add redirect URLs for that domain.
4. Copy Project URL, anon key, service-role key → backend `.env`.
   The service-role key never goes in the frontend.

## Backend — free Node host (pick one)
The backend is plain Express with no host-specific code, so any of these
works unchanged. **Note:** free tiers sleep / spin down — the webhook must
still answer Meta's verification quickly when awake; Render free spins
down after inactivity (first request can take ~50s, which can fail a
webhook delivery — Meta retries, and the app logs it).

| Host | Free tier note |
|---|---|
| Render (Web Service, free) | 750h/month, sleeps after 15 min idle |
| Railway (trial credit) | $5 trial credit, then paid — good for testing only |
| Fly.io | Free allowance ~3 small VMs; needs a credit card on file |
| Oracle Cloud Always Free | 2 VMs free, more setup, no sleep — best for a 24/7 webhook |

```bash
cd backend && npm install && npm test
# set env vars in the host dashboard (see .env.example), then deploy.
# Start command: npm start   (PORT is provided by the host)
```
Set `META_REDIRECT_URI` and the Meta webhook URL to the deployed backend URL.

## Frontend — Cloudflare Pages (free)
```bash
cd frontend && npm install && npm run build   # output: dist/
```
Cloudflare dashboard → Pages → Create → connect the repo (or direct upload
of `dist/`). Build command `npm run build`, output `dist`. Env vars:
`VITE_API_URL=https://<your-backend>`, `VITE_SUPABASE_URL`,
`VITE_SUPABASE_ANON_KEY`, `VITE_DEMO_MODE=false`.
(Rajas — same flow as QRFlow: Pages project from the GitHub repo, env vars
in **Production**, not Preview only.)

## Local development
```bash
# Terminal 1 — backend on :3001 (demo mode if Supabase env is missing)
cd backend && cp ../.env.example .env && npm install && npm run dev
# Terminal 2 — frontend on :5173
cd frontend && npm install && npm run dev
```
Expose the local backend for Meta webhook testing with `cloudflared tunnel`
or ngrok (temporary, testing only).
