import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, demo } from '../lib/api';
import { Card, Btn, Field, inputCls, Badge } from '../components/ui';
// The Create Automation page: deliberately simple. Pick media, pick ONE
// trigger type, write the DM, optionally add a public reply, save.
export default function CreateAutomation() {
  const nav = useNavigate();
  const [name, setName] = useState('Kurti Drop — Comment to DM');
  const [mediaId, setMediaId] = useState(demo.media[0].id);
  const [trigger, setTrigger] = useState<'specific_keyword' | 'any_comment'>('specific_keyword');
  const [keywords, setKeywords] = useState('KURTI, PRICE, LINK');
  const [matchMode, setMatchMode] = useState('contains');
  const [logic, setLogic] = useState('any');
  const [dm, setDm] = useState('Hey girl! 💗\n\nThank you for your interest in this beautiful outfit!\n\nHere is your shopping link:\nhttps://example.com/kurti\n\nHappy shopping! ✨');
  const [publicEnabled, setPublicEnabled] = useState(true);
  const [publicReply, setPublicReply] = useState('Check your DM, girl! 💗');
  const [delay, setDelay] = useState(10);
  const [manualReview, setManualReview] = useState(false);
  const [preview, setPreview] = useState(false);
  const [saved, setSaved] = useState('');
  const save = async () => {
    const triggers = trigger === 'any_comment'
      ? [{ priority: 0, trigger_type: 'any_comment', keywords: [], dm_message: dm, public_reply_message: publicReply, enabled: true }]
      : keywords.split(',').map(k => k.trim()).filter(Boolean).map((k, i) => ({ priority: i, trigger_type: 'specific_keyword', keywords: [k], dm_message: dm, public_reply_message: publicReply, enabled: true }));
    await api.createCampaign({ name, media_id: mediaId, trigger_type: trigger, match_mode: matchMode, keyword_logic: logic, case_insensitive: true, dm_message: dm, public_reply_enabled: publicEnabled, public_reply_message: publicReply, public_reply_delay_seconds: delay, manual_review: manualReview, triggers });
    setSaved('Campaign saved. In demo mode it is stored locally; in live mode it is active on the webhook now.');
    setTimeout(() => nav('/automations'), 800);
  };
  return <div className="space-y-6 max-w-3xl"><h1 className="text-2xl font-bold">Create Automation</h1>
    <Card><div className="space-y-4">
      <Field label="Campaign name"><input className={inputCls} value={name} onChange={e => setName(e.target.value)} /></Field>
      <Field label="Post / Reel"><select className={inputCls} value={mediaId} onChange={e => setMediaId(e.target.value)}>{demo.media.map(m => <option key={m.id} value={m.id}>{m.media_type} — {m.caption}</option>)}</select><p className="text-xs text-zinc-500 mt-1">Only new comments after the webhook is live are delivered by Meta — historical comments are not backfilled.</p></Field>
      <div><p className="text-sm font-medium mb-2">Trigger</p><div className="flex gap-2">
        <button onClick={() => setTrigger('specific_keyword')} className={`px-4 py-3 rounded-xl border text-sm font-medium ${trigger === 'specific_keyword' ? 'border-pink-500 bg-pink-50 dark:bg-pink-950' : 'border-zinc-300 dark:border-zinc-700'}`}>[ Specific Keyword ]</button>
        <button onClick={() => setTrigger('any_comment')} className={`px-4 py-3 rounded-xl border text-sm font-medium ${trigger === 'any_comment' ? 'border-pink-500 bg-pink-50 dark:bg-pink-950' : 'border-zinc-300 dark:border-zinc-700'}`}>[ Any Comment ]</button>
      </div></div>
      {trigger === 'specific_keyword' && <><Field label="Keywords (comma-separated — one rule per keyword, different DMs per keyword are set in Automations → edit)"><input className={inputCls} value={keywords} onChange={e => setKeywords(e.target.value)} placeholder="KURTI, PRICE, LINK" /></Field>
        <div className="grid grid-cols-2 gap-4"><Field label="Matching"><select className={inputCls} value={matchMode} onChange={e => setMatchMode(e.target.value)}><option value="contains">Contains keyword</option><option value="exact">Exact match</option></select></Field>
        <Field label="Multiple keywords"><select className={inputCls} value={logic} onChange={e => setLogic(e.target.value)}><option value="any">Match any one</option><option value="all">Match all</option></select></Field></div>
        <p className="text-xs text-zinc-500">Contains + case-insensitive: “kurti”, “I want kurti” and “Send me kurti link” all trigger KURTI. <Badge tone="pink">Duplicate DMs prevented per comment</Badge></p></>}
      {trigger === 'any_comment' && <p className="text-sm text-zinc-600 dark:text-zinc-400">Any Comment mode: every comment — “Beautiful”, “Price?”, emoji, anything — receives the DM below. No keyword needed.</p>}
      <Field label="Automatic DM message"><textarea rows={6} className={inputCls} value={dm} onChange={e => setDm(e.target.value)} /></Field>
      <div className="flex gap-2"><Btn variant="outline" onClick={() => setPreview(!preview)}>{preview ? 'Hide preview' : 'Preview message (no DM sent)'}</Btn></div>
      {preview && <div className="rounded-xl bg-zinc-100 dark:bg-zinc-800 p-4 whitespace-pre-wrap text-sm">{dm}</div>}
      <label className="flex gap-2 text-sm items-center"><input type="checkbox" checked={publicEnabled} onChange={e => setPublicEnabled(e.target.checked)} /> Also send a public comment reply</label>
      {publicEnabled && <><Field label="Public reply"><input className={inputCls} value={publicReply} onChange={e => setPublicReply(e.target.value)} /></Field>
        <div className="grid grid-cols-2 gap-4"><Field label="Delay (seconds, 0–300)"><input type="number" min={0} max={300} className={inputCls} value={delay} onChange={e => setDelay(Number(e.target.value))} /></Field>
        <label className="flex gap-2 text-sm items-end pb-2"><input type="checkbox" checked={manualReview} onChange={e => setManualReview(e.target.checked)} /> Manual review mode (hold replies)</label></div></>}
      <Btn onClick={save}>Save automation</Btn>{saved && <p className="text-sm text-green-700">{saved}</p>}
    </div></Card></div>;
}
