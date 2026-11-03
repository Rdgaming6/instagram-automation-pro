const express = require('express');
const router = express.Router();
const { demo, isLive } = require('../lib/store');
// Demo-mode API (live mode: same shapes, backed by Supabase queries in
// src/routes/live.js — the frontend only ever sees these shapes).
router.get('/status', (_req, res) => res.json({
  mode: isLive() ? 'live' : 'demo',
  supabase: isLive(), metaConfigured: Boolean(process.env.META_APP_ID && process.env.META_APP_SECRET),
  webhookConfigured: Boolean(process.env.META_WEBHOOK_VERIFY_TOKEN),
  tokenExpiresAt: isLive() ? null : 'demo',
  setup: { supabase: isLive(), meta: Boolean(process.env.META_APP_ID), webhook: Boolean(process.env.META_WEBHOOK_VERIFY_TOKEN) },
}));
router.get('/instagram/account', (_req, res) => res.json({ account: demo.account, mode: isLive() ? 'live' : 'demo' }));
router.get('/instagram/media', (_req, res) => res.json({ media: demo.media }));
router.get('/campaigns', (_req, res) => res.json({ campaigns: demo.campaigns }));
router.post('/campaigns', express.json(), (req, res) => {
  const c = { id: 'camp_' + Date.now(), status: 'active', total_comments: 0, successful_dms: 0, successful_public_replies: 0, failed_actions: 0, created_at: new Date().toISOString(), ...req.body };
  demo.campaigns.push(c); res.status(201).json({ campaign: c });
});
router.patch('/campaigns/:id', express.json(), (req, res) => {
  const c = demo.campaigns.find(x => x.id === req.params.id);
  if (!c) return res.status(404).json({ error: 'Campaign not found' });
  Object.assign(c, req.body); res.json({ campaign: c });
});
router.delete('/campaigns/:id', (req, res) => {
  const i = demo.campaigns.findIndex(x => x.id === req.params.id);
  if (i < 0) return res.status(404).json({ error: 'Campaign not found' });
  demo.campaigns.splice(i, 1); res.json({ ok: true });
});
router.post('/campaigns/:id/duplicate', (req, res) => {
  const c = demo.campaigns.find(x => x.id === req.params.id);
  if (!c) return res.status(404).json({ error: 'Campaign not found' });
  const copy = { ...c, id: 'camp_' + Date.now(), name: c.name + ' (copy)', status: 'paused', total_comments: 0, successful_dms: 0, successful_public_replies: 0, failed_actions: 0, created_at: new Date().toISOString() };
  demo.campaigns.push(copy); res.status(201).json({ campaign: copy });
});
router.get('/templates/dm', (_req, res) => res.json({ templates: demo.dmTemplates }));
router.get('/templates/public', (_req, res) => res.json({ templates: demo.publicTemplates }));
router.post('/templates/dm', express.json(), (req, res) => { const t = { id: 'dm_' + Date.now(), ...req.body }; demo.dmTemplates.push(t); res.status(201).json({ template: t }); });
router.post('/templates/public', express.json(), (req, res) => { const t = { id: 'pr_' + Date.now(), ...req.body }; demo.publicTemplates.push(t); res.status(201).json({ template: t }); });
router.get('/comments', (req, res) => {
  let list = demo.comments;
  const { q, media_id } = req.query;
  if (media_id) list = list.filter(c => c.media_id === media_id);
  if (q) list = list.filter(c => (c.text + c.username).toLowerCase().includes(String(q).toLowerCase()));
  res.json({ comments: list });
});
router.get('/activity', (_req, res) => res.json({ activity: demo.activity }));
router.post('/simulate-comment', express.json(), async (req, res) => {
  // Test hook (demo only): simulate a comment hitting the automation engine.
  const { processComment } = require('../services/automation');
  const comment = { id: 'sim_' + Date.now(), media_id: req.body.media_id || 'demo_media_1', text: req.body.text || 'KURTI', username: req.body.username || 'test.user', timestamp: new Date().toISOString() };
  const result = await processComment(comment, demo.campaigns, null);
  res.json({ comment, ...result });
});
// OAuth stubs: in live mode these redirect to Meta; in demo they explain setup.
router.get('/auth/instagram/login', (_req, res) => {
  if (!process.env.META_APP_ID) return res.status(503).json({ error: 'Setup required: META_APP_ID / META_APP_SECRET not configured. See docs/META_SETUP.md.' });
  const params = new URLSearchParams({ client_id: process.env.META_APP_ID, redirect_uri: process.env.META_REDIRECT_URI, scope: 'instagram_basic,instagram_manage_comments,instagram_manage_messages,pages_read_engagement', response_type: 'code' });
  res.redirect(`https://www.facebook.com/v21.0/dialog/oauth?${params}`);
});
router.get('/auth/instagram/callback', (_req, res) => res.json({ ok: false, note: 'Live OAuth exchange happens here in live mode (code -> short-lived -> long-lived token, stored server-side). Configure META_APP_ID first.' }));
router.post('/instagram/disconnect', (_req, res) => res.json({ ok: true, note: 'Demo mode: no token to revoke. Live mode deletes the token row and revokes it at Meta.' }));
module.exports = router;
