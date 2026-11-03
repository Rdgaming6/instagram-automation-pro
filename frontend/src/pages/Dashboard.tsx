import { useEffect, useState } from 'react';
import { api, demo } from '../lib/api';
import { Card, Stat, Badge } from '../components/ui';
export default function Dashboard() {
  const [status, setStatus] = useState<any>(null);
  const [activity, setActivity] = useState<any[]>(demo.activity);
  useEffect(() => { api.status().then(setStatus); api.activity().then(d => setActivity(d.activity)); }, []);
  const c = demo.campaigns;
  const totals = { comments: c.reduce((s, x) => s + x.total_comments, 0), dms: c.reduce((s, x) => s + x.successful_dms, 0), replies: c.reduce((s, x) => s + x.successful_public_replies, 0), failed: c.reduce((s, x) => s + x.failed_actions, 0) };
  return <div className="space-y-6">
    <div><h1 className="text-2xl font-bold">Dashboard</h1><p className="text-zinc-500 text-sm">@{demo.account.username} · {demo.account.account_type} · {status?.mode === 'live' ? 'Live mode' : 'Demo mode — connect Supabase + Meta in Settings to go live'}</p></div>
    {status && !status.setup?.meta && <Card className="border-amber-300 bg-amber-50 dark:bg-amber-950"><b>Setup required.</b> Meta is not configured yet — stats below are demo data and no real Instagram DM will be sent. See Settings → Setup checklist and docs/META_SETUP.md.</Card>}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Stat label="Total comments" value={totals.comments} /><Stat label="DMs sent" value={totals.dms} />
      <Stat label="Public replies sent" value={totals.replies} /><Stat label="Failed actions" value={totals.failed} />
      <Stat label="Active campaigns" value={c.filter(x => x.status === 'active').length} /><Stat label="Paused campaigns" value={c.filter(x => x.status === 'paused').length} />
      <Stat label="Keyword matches" value={55} sub="KURTI 32 · PRICE 18 · LINK 5" /><Stat label="Any Comment triggers" value={23} />
    </div>
    <Card><h2 className="font-semibold mb-3">Live activity feed</h2><ul className="space-y-2">
      {activity.map(a => <li key={a.id} className="flex gap-3 text-sm"><Badge tone={a.status === 'failed' ? 'red' : 'green'}>{a.status === 'failed' ? 'Failed' : 'Success'}</Badge><span>{a.message}{a.error && <span className="text-red-600"> — {a.error}</span>}</span><span className="ml-auto text-zinc-400 text-xs whitespace-nowrap">{new Date(a.created_at).toLocaleString()}</span></li>)}
    </ul></Card>
  </div>;
}
