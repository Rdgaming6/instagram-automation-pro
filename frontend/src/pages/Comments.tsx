import { useEffect, useState } from 'react';
import { api, demo } from '../lib/api';
import { Card, Field, inputCls, Badge } from '../components/ui';
export default function Comments() {
  const [q, setQ] = useState(''); const [mediaId, setMediaId] = useState(''); const [list, setList] = useState<any[]>(demo.comments);
  useEffect(() => { const t = setTimeout(() => api.comments(q, mediaId).then(d => setList(d.comments)), 200); return () => clearTimeout(t); }, [q, mediaId]);
  return <div className="space-y-6"><h1 className="text-2xl font-bold">Comments</h1>
    <Card><div className="flex flex-wrap gap-4"><Field label="Search"><input className={inputCls} value={q} onChange={e => setQ(e.target.value)} placeholder="Search text or username" /></Field>
    <Field label="Post / Reel"><select className={inputCls} value={mediaId} onChange={e => setMediaId(e.target.value)}><option value="">All posts</option>{demo.media.map(m => <option key={m.id} value={m.id}>{m.caption}</option>)}</select></Field></div></Card>
    <Card><table className="w-full text-sm"><thead><tr className="text-left text-zinc-500"><th className="py-2">Comment</th><th>User</th><th>Triggered</th><th>DM</th><th>Public reply</th></tr></thead><tbody>
      {list.map(c => <tr key={c.id} className="border-t border-zinc-100 dark:border-zinc-800"><td className="py-2">{c.text}<span className="block text-xs text-zinc-400">{new Date(c.timestamp).toLocaleString()}</span></td><td>@{c.username}</td><td>{c.triggered_rule ? <Badge tone="pink">{c.triggered_rule}</Badge> : <Badge>No match</Badge>}</td><td>{c.dm_sent ? '✅ Sent' : '—'}</td><td>{c.public_reply_sent ? '✅ Sent' : '—'}</td></tr>)}
    </tbody></table>{!list.length && <p className="text-sm text-zinc-500 py-4">No comments match.</p>}</Card></div>;
}
