import { demo } from './demo';
const API = import.meta.env.VITE_API_URL as string | undefined;
const DEMO = import.meta.env.VITE_DEMO_MODE !== 'false';
export const isDemo = !API || DEMO;
async function get<T>(path: string, fallback: T): Promise<T> {
  if (isDemo) return fallback;
  try { const r = await fetch(`${API}${path}`); if (!r.ok) throw new Error(String(r.status)); return await r.json(); } catch { return fallback; }
}
async function send(path: string, method: string, body?: unknown) {
  if (isDemo) return { ok: true, demo: true };
  const r = await fetch(`${API}${path}`, { method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  return r.json().catch(() => ({ ok: r.ok }));
}
export const api = {
  status: () => get('/api/status', { mode: 'demo', supabase: false, metaConfigured: false, webhookConfigured: false, setup: { supabase: false, meta: false, webhook: false } }),
  account: () => get('/api/instagram/account', { account: demo.account }),
  media: () => get('/api/instagram/media', { media: demo.media }),
  campaigns: () => get('/api/campaigns', { campaigns: demo.campaigns }),
  createCampaign: (b: unknown) => send('/api/campaigns', 'POST', b),
  patchCampaign: (id: string, b: unknown) => send(`/api/campaigns/${id}`, 'PATCH', b),
  deleteCampaign: (id: string) => send(`/api/campaigns/${id}`, 'DELETE'),
  duplicateCampaign: (id: string) => send(`/api/campaigns/${id}/duplicate`, 'POST'),
  dmTemplates: () => get('/api/templates/dm', { templates: demo.dmTemplates }),
  publicTemplates: () => get('/api/templates/public', { templates: demo.publicTemplates }),
  comments: (q = '', media_id = '') => get(`/api/comments?q=${encodeURIComponent(q)}&media_id=${media_id}`, { comments: demo.comments.filter(c => (!q || (c.text + c.username).toLowerCase().includes(q.toLowerCase())) && (!media_id || c.media_id === media_id)) }),
  activity: () => get('/api/activity', { activity: demo.activity }),
  simulate: (b: unknown) => send('/api/simulate-comment', 'POST', b),
};
export { demo };
