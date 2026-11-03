const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const { processComment } = require('../services/automation');
const { demo, isLive } = require('../lib/store');

// GET verification: Meta sends hub.mode=subscribe, hub.verify_token, hub.challenge
router.get('/instagram', (req, res) => {
  const mode = req.query['hub.mode'], token = req.query['hub.verify_token'], challenge = req.query['hub.challenge'];
  if (mode === 'subscribe' && token === process.env.META_WEBHOOK_VERIFY_TOKEN) return res.status(200).send(challenge);
  return res.sendStatus(403);
});
function verifySignature(req) {
  const sig = req.headers['x-hub-signature-256'];
  if (!sig || !process.env.META_APP_SECRET) return false;
  const expected = 'sha256=' + crypto.createHmac('sha256', process.env.META_APP_SECRET).update(req.rawBody || '').digest('hex');
  try { return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected)); } catch { return false; }
}
// POST events. Respond 200 fast; process async (Meta retries on timeout).
router.post('/instagram', express.json({ verify: (req, _res, buf) => { req.rawBody = buf; } }), async (req, res) => {
  res.sendStatus(200);
  if (process.env.META_APP_SECRET && !verifySignature(req)) { console.warn('[webhook] invalid signature'); return; }
  for (const entry of req.body.entry || []) {
    for (const change of entry.changes || []) {
      if (change.field !== 'comments') continue;
      const v = change.value || {};
      if (v.parent_id) continue; // replies to comments: log only, no auto-DM (loop guard)
      const comment = { id: String(v.id), media_id: String(v.media_id || entry.id), text: v.text || '', username: v.from?.username || 'unknown', timestamp: v.timestamp || new Date().toISOString() };
      // Demo mode: use demo campaigns; live mode would load campaigns from Supabase here.
      const campaigns = demo.campaigns;
      const result = await processComment(comment, campaigns, null);
      console.log('[webhook]', comment.id, result.logs.map(l => l.action).join(','));
    }
  }
});
module.exports = router;
