import { demo } from '../lib/api';
import { Card, Stat } from '../components/ui';
export default function Analytics() {
  const c = demo.campaigns;
  return <div className="space-y-6"><h1 className="text-2xl font-bold">Analytics</h1>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4"><Stat label="Total comments" value={c.reduce((s, x) => s + x.total_comments, 0)} /><Stat label="Keyword matches" value={55} /><Stat label="Any Comment triggers" value={23} /><Stat label="DMs sent" value={c.reduce((s, x) => s + x.successful_dms, 0)} /><Stat label="Public replies" value={c.reduce((s, x) => s + x.successful_public_replies, 0)} /><Stat label="Failed" value={c.reduce((s, x) => s + x.failed_actions, 0)} /><Stat label="Active" value={c.filter(x => x.status === 'active').length} /><Stat label="Paused" value={c.filter(x => x.status === 'paused').length} /></div>
    <Card><h2 className="font-semibold mb-3">Per-campaign</h2>{c.map(x => <div key={x.id} className="flex justify-between border-t py-2 text-sm"><span>{x.name}</span><span>💬 {x.total_comments} · ✉️ {x.successful_dms} · 💬 {x.successful_public_replies} · ❌ {x.failed_actions}</span></div>)}</Card>
    <Card><p className="text-sm text-zinc-500">In live mode these numbers come from <code>automation_logs</code> in Supabase, updated in real time via Supabase Realtime. Demo figures above are seed data.</p></Card></div>;
}
