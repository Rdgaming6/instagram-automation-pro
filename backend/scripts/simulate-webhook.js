// Simulate a signed Instagram comment webhook (demo, no Meta needed).
// Usage: node scripts/simulate-webhook.js [comment text]
const crypto = require('crypto');
const text = process.argv[2] || 'I want kurti';
const secret = process.env.META_APP_SECRET || 'demo-secret';
const payload = JSON.stringify({ object: 'instagram', entry: [{ id: 'demo_media_1', changes: [{ field: 'comments', value: { id: 'sim_' + Date.now(), media_id: 'demo_media_1', text, from: { id: '999', username: 'test.user' } } }] }] });
const sig = 'sha256=' + crypto.createHmac('sha256', secret).update(payload).digest('hex');
fetch('http://localhost:3001/webhook/instagram', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Hub-Signature-256': sig }, body: payload }).then(r => console.log('webhook status:', r.status, '(200 = accepted; check backend log for the automation steps)')).catch(e => console.error('Is the backend running on :3001?', e.message));
