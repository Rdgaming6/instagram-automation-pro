// Automation engine: webhook comment -> match -> private reply -> public reply.
// Idempotent: a (comment_id, action) is processed once (DB unique constraint
// in live mode; in-memory Set in demo mode). Demo mode NEVER calls Meta —
// it logs what *would* be sent.
const { pickTrigger } = require('../lib/matching');
const meta = require('../lib/meta');
const { demo, alreadyLogged, isLive } = require('../lib/store');

async function withRetry(fn, attempts = 3) {
  let last;
  for (let i = 0; i < attempts; i++) {
    try { return await fn(); } catch (e) {
      last = e;
      if (!meta.isRetryable(e)) throw e;
      const wait = e.status === 429 && e.retryAfter ? Number(e.retryAfter) * 1000 : [5000, 30000, 300000][i];
      await new Promise(r => setTimeout(r, wait));
    }
  }
  throw last;
}

// comment: {id, media_id, text, username, timestamp}
// campaigns: active campaigns for this media (or apply_to_all_media)
// token: decrypted long-lived token (live only)
async function processComment(comment, campaigns, token) {
  const logs = [];
  const log = (action, status, message, error) => { logs.push({ comment_id: comment.id, action, status, message, error: error || null }); return logs[logs.length - 1]; };
  log('comment_received', 'success', `"${comment.text}" from @${comment.username} on ${comment.media_id}`);
  const eligible = (campaigns || []).filter(c => c.status === 'active' && (c.apply_to_all_media || c.media_id === comment.media_id));
  if (!eligible.length) { log('no_match', 'skipped', 'No active campaign for this media.'); return { logs, sent: false }; }
  for (const campaign of eligible) {
    const picked = pickTrigger(comment.text, campaign.triggers || [], campaign);
    if (!picked) { log('no_match', 'skipped', `No keyword matched in campaign "${campaign.name}".`); continue; }
    log(picked.kind, 'success', picked.kind === 'keyword_match' ? `Keyword ${picked.matchedKeywords.join(', ')} matched.` : 'Any Comment triggered.');
    const dmMessage = picked.trigger.dm_message || campaign.dm_message;
    // Duplicate guard — one private reply per comment, ever.
    if (alreadyLogged(comment.id, 'private_reply_sent')) { log('duplicate_ignored', 'skipped', 'Private reply already sent for this comment.'); continue; }
    if (!isLive()) {
      log('private_reply_sent', 'success', `[DEMO] Would send DM: ${String(dmMessage).slice(0, 80)}… (no real Instagram send in demo mode)`);
      if (campaign.public_reply_enabled !== false && picked.trigger.public_reply_message) log('public_reply_sent', 'success', `[DEMO] Would post public reply: ${picked.trigger.public_reply_message}`);
      return { logs, sent: false, demo: true, trigger: picked };
    }
    try {
      await withRetry(() => meta.sendPrivateReply(comment.id, dmMessage, token));
      log('private_reply_sent', 'success', 'Private reply sent.');
    } catch (e) {
      log('failed', 'failed', 'Private reply failed.', e.message);
      return { logs, sent: false, error: e.message };
    }
    if (campaign.public_reply_enabled && picked.trigger.public_reply_message) {
      if (campaign.manual_review) { log('pending_review', 'pending', 'Public reply held for manual review.'); }
      else {
        const delay = (campaign.public_reply_delay_seconds || 0) * 1000;
        if (delay) await new Promise(r => setTimeout(r, delay));
        try { await withRetry(() => meta.sendPublicReply(comment.id, picked.trigger.public_reply_message, token)); log('public_reply_sent', 'success', 'Public comment reply sent.'); }
        catch (e) { log('failed', 'failed', 'Public reply failed.', e.message); }
      }
    }
    return { logs, sent: true, trigger: picked };
  }
  return { logs, sent: false };
}
module.exports = { processComment, withRetry };
