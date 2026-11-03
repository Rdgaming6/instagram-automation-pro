import { useEffect, useState } from 'react';
import { api, demo, isDemo } from '../lib/api';
import { Card, Btn, Badge } from '../components/ui';
export default function Settings() {
  const [status, setStatus] = useState<any>(null);
  useEffect(() => { api.status().then(setStatus); }, []);
  const row = (label: string, ok: boolean, note: string) => <div className="flex justify-between py-2 border-t text-sm"><span>{label}</span><span className="text-right"><Badge tone={ok ? 'green' : 'amber'}>{ok ? 'Connected' : 'Setup required'}</Badge><span className="block text-xs text-zinc-500">{note}</span></span></div>;
  return <div className="space-y-6 max-w-3xl"><h1 className="text-2xl font-bold">Settings</h1>
    <Card><h2 className="font-semibold">Instagram account</h2><div className="flex items-center gap-3 mt-3"><div className="w-12 h-12 rounded-full bg-pink-500 text-white flex items-center justify-center text-xl font-bold">R</div><div><p className="font-medium">@{demo.account.username}</p><p className="text-xs text-zinc-500">{demo.account.account_type} · {demo.account.followers.toLocaleString()} followers · {isDemo ? 'Demo account' : 'Live account'}</p></div><span className="ml-auto"><Badge tone="green">{demo.account.status}</Badge></span></div>
    <div className="flex gap-2 mt-4"><Btn variant="outline" onClick={() => alert(isDemo ? 'Demo mode: configure META_APP_ID in the backend .env, then connect for real. See docs/META_SETUP.md.' : 'Redirecting to Meta OAuth…')}>Reconnect Instagram</Btn><Btn variant="danger" onClick={() => { if (confirm('Disconnect Instagram? Automations will stop.')) alert('Disconnected (demo). Live mode deletes the token and revokes it at Meta.'); }}>Disconnect</Btn></div></Card>
    <Card><h2 className="font-semibold">Setup checklist</h2>
      {status ? <>{row('Supabase database', !!status.setup?.supabase, status.setup?.supabase ? 'Connected' : 'Run supabase/migrations/0001_init.sql and set SUPABASE_URL + keys — see docs/DEPLOYMENT.md')}
      {row('Meta app / OAuth', !!status.setup?.meta, status.setup?.meta ? 'Configured' : 'Create a Meta app and set META_APP_ID / META_APP_SECRET — see docs/META_SETUP.md')}
      {row('Webhook', !!status.setup?.webhook, status.setup?.webhook ? 'Verify token set' : 'Set META_WEBHOOK_VERIFY_TOKEN and subscribe comments in the Meta dashboard')}
      {row('Access token', false, 'Demo mode — no live token. Live: long-lived token, ~60 days, refresh before expiry (Settings shows expiry).')}</> : <p className="text-sm text-zinc-500">Loading…</p>}
    </Card>
    <Card><h2 className="font-semibold">Automation preferences</h2><p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">Defaults (editable in live mode, stored in Supabase): duplicate prevention <b>on</b> (one DM per comment), default DM template “Kurti shopping link”, default public reply “Check your DM, girl! 💗”, public-reply delay 10s, manual review off. Notifications: in-app activity feed (email/webhook notifications are a future, free, optional addition — not required).</p></Card>
    <Card><h2 className="font-semibold">Free-tier limits</h2><p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">Supabase free: 500 MB DB. Cloudflare Pages free: unlimited static bandwidth. Render free backend sleeps when idle — see docs/LIMITS.md for what Meta does and does not permit.</p></Card></div>;
}
