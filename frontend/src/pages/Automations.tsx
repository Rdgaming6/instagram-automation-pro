import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, demo } from '../lib/api';
import { Card, Btn, Badge } from '../components/ui';
export default function Automations() {
  const [list, setList] = useState<any[]>(demo.campaigns);
  const refresh = () => api.campaigns().then(d => setList(d.campaigns));
  useEffect(() => { refresh(); }, []);
  return <div className="space-y-6"><div className="flex justify-between items-center"><h1 className="text-2xl font-bold">Automations</h1><Link to="/create"><Btn>Create automation</Btn></Link></div>
  {list.map(c => <Card key={c.id}><div className="flex flex-wrap gap-4 justify-between">
    <div><p className="font-semibold">{c.name}</p><p className="text-sm text-zinc-500">{c.media_caption} · {c.trigger_type === 'any_comment' ? 'Any Comment' : `Keyword · ${c.match_mode} · ${c.keyword_logic}`} · {c.triggers?.map((t: any) => t.keywords?.join(', ') || 'any').join(' | ')}</p>
    <p className="text-xs text-zinc-500 mt-1">Created {new Date(c.created_at).toLocaleDateString()} · 💬 {c.total_comments} · ✉️ {c.successful_dms} DMs · 💬 {c.successful_public_replies} replies · ❌ {c.failed_actions} failed</p></div>
    <div className="flex gap-2 items-start"><Badge tone={c.status === 'active' ? 'green' : 'amber'}>{c.status}</Badge>
      <Btn variant="outline" onClick={() => api.patchCampaign(c.id, { status: c.status === 'active' ? 'paused' : 'active' }).then(refresh)}>{c.status === 'active' ? 'Pause' : 'Resume'}</Btn>
      <Btn variant="outline" onClick={() => api.duplicateCampaign(c.id).then(refresh)}>Duplicate</Btn>
      <Btn variant="danger" onClick={() => { if (confirm('Delete this campaign?')) api.deleteCampaign(c.id).then(refresh); }}>Delete</Btn></div>
  </div></Card>)}
  {!list.length && <Card>No campaigns yet. <Link className="underline" to="/create">Create your first automation</Link>.</Card>}</div>;
}
