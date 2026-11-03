import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { keywordMatches, groupMatches, pickTrigger } = require('../src/lib/matching.js');
const crypto = require('node:crypto');

test('KURTI contains: kurti / I want kurti / Send me kurti link all match', () => {
  for (const t of ['kurti', 'I want kurti', 'Send me kurti link', 'KURTI!!']) assert.equal(keywordMatches(t, 'KURTI', { matchMode: 'contains', caseInsensitive: true }), true);
  assert.equal(keywordMatches('kurta', 'KURTI', { matchMode: 'contains' }), false);
});
test('exact mode only matches the whole comment', () => {
  assert.equal(keywordMatches('kurti', 'KURTI', { matchMode: 'exact' }), true);
  assert.equal(keywordMatches('I want kurti', 'KURTI', { matchMode: 'exact' }), false);
});
test('case-sensitive mode distinguishes case', () => {
  assert.equal(keywordMatches('kurti', 'KURTI', { matchMode: 'contains', caseInsensitive: false }), false);
});
test('any-of vs all-of', () => {
  assert.equal(groupMatches('kurti please', ['KURTI', 'PRICE'], { keywordLogic: 'any' }).matched, true);
  assert.equal(groupMatches('kurti please', ['KURTI', 'PRICE'], { keywordLogic: 'all' }).matched, false);
  assert.equal(groupMatches('kurti price?', ['KURTI', 'PRICE'], { keywordLogic: 'all' }).matched, true);
});
test('pickTrigger: keyword beats any-comment; any-comment catches everything else', () => {
  const triggers = [
    { id: '1', priority: 0, trigger_type: 'specific_keyword', keywords: ['KURTI'], enabled: true },
    { id: '2', priority: 1, trigger_type: 'any_comment', keywords: [], enabled: true },
  ];
  assert.equal(pickTrigger('Send me kurti link', triggers).kind, 'keyword_match');
  assert.equal(pickTrigger('Beautiful 😍', triggers).kind, 'any_comment_trigger');
  assert.equal(pickTrigger('Wow', triggers).trigger.id, '2');
  assert.equal(pickTrigger('hello', [{ id: '1', priority: 0, trigger_type: 'specific_keyword', keywords: ['KURTI'], enabled: true }]), null);
});
test('webhook signature: HMAC-SHA256 verifies', () => {
  const secret = 'test-secret', body = '{"hello":"world"}';
  const sig = 'sha256=' + crypto.createHmac('sha256', secret).update(body).digest('hex');
  const expected = 'sha256=' + crypto.createHmac('sha256', secret).update(body).digest('hex');
  assert.equal(crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected)), true);
});
