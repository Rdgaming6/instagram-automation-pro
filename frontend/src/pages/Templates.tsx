import { useEffect, useState } from 'react';
import { api, demo } from '../lib/api';
import { Card, Btn, Field, inputCls } from '../components/ui';
export default function Templates() {
  const [dms, setDms] = useState<any[]>(demo.dmTemplates); const [prs, setPrs] = useState<any[]>(demo.publicTemplates);
  const [name, setName] = useState(''); const [body, setBody] = useState('Hey girl! 💗\n\nThanks for commenting!\n\nLink: https://example.com/shop');
  const [preview, setPreview] = useState(false);
  useEffect(() => { api.dmTemplates().then(d => setDms(d.templates)); api.publicTemplates().then(d => setPrs(d.templates)); }, []);
  return <div className="space-y-6"><h1 className="text-2xl font-bold">DM Templates</h1>
    <div className="grid md:grid-cols-2 gap-4">
      <Card><h2 className="font-semibold mb-2">DM templates</h2>{dms.map(t => <div key={t.id} className="border-t py-2"><p className="font-medium text-sm">{t.name} {t.is_default && <span className="text-xs text-zinc-500">(default)</span>}</p><p className="text-sm whitespace-pre-wrap text-zinc-600 dark:text-zinc-400">{t.body}</p></div>)}</Card>
      <Card><h2 className="font-semibold mb-2">Public reply templates</h2>{prs.map(t => <div key={t.id} className="border-t py-2"><p className="font-medium text-sm">{t.name} {t.is_default && <span className="text-xs text-zinc-500">(default)</span>}</p><p className="text-sm text-zinc-600 dark:text-zinc-400">{t.body}</p></div>)}</Card>
    </div>
    <Card><h2 className="font-semibold mb-3">New DM template</h2><div className="space-y-3"><Field label="Name"><input className={inputCls} value={name} onChange={e => setName(e.target.value)} /></Field>
    <Field label="Message (links, emojis, line breaks supported)"><textarea rows={5} className={inputCls} value={body} onChange={e => setBody(e.target.value)} /></Field>
    <div className="flex gap-2"><Btn variant="outline" onClick={() => setPreview(!preview)}>Test formatting (no DM sent)</Btn><Btn onClick={() => { api.dmTemplates().then(() => {}); setDms([...dms, { id: 'dm_' + Date.now(), name: name || 'Untitled', body, is_default: false }]); setName(''); }}>Save template</Btn></div>
    {preview && <div className="rounded-xl bg-zinc-100 dark:bg-zinc-800 p-4 whitespace-pre-wrap text-sm">{body}</div>}</div></Card></div>;
}
