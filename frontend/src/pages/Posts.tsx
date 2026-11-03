import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, demo } from '../lib/api';
import { Card, Btn, Badge } from '../components/ui';
export default function Posts() {
  const [media, setMedia] = useState<any[]>(demo.media);
  useEffect(() => { api.media().then(d => setMedia(d.media)); }, []);
  return <div className="space-y-6"><h1 className="text-2xl font-bold">Posts &amp; Reels</h1><p className="text-sm text-zinc-500">Fetched from the Instagram Graph API in live mode. Automation status is per-media.</p>
  <div className="grid md:grid-cols-3 gap-4">{media.map(m => {
    const automated = demo.campaigns.some(c => c.media_id === m.id && c.status === 'active');
    return <Card key={m.id}><div className="h-32 rounded-xl bg-gradient-to-br from-pink-400 via-rose-300 to-amber-200 flex items-center justify-center text-4xl">{m.media_type === 'REEL' ? '🎬' : '🖼️'}</div>
      <p className="font-medium mt-3">{m.caption}</p><p className="text-xs text-zinc-500">{m.media_type} · {new Date(m.timestamp).toLocaleDateString()} · 💬 {m.comments_count} · ❤️ {m.like_count}</p>
      <div className="flex gap-2 mt-3 items-center"><Badge tone={automated ? 'green' : 'zinc'}>{automated ? 'Automated' : 'No automation'}</Badge><Link to="/create"><Btn variant="outline">Create automation</Btn></Link></div></Card>; })}
  </div></div>;
}
