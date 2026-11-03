// Official Meta Instagram Graph API client (fetch only, no SDK needed).
// Endpoints used: OAuth code exchange, long-lived token, /{ig-user-id},
// /{ig-user-id}/media, /{media-id}/comments, /{comment-id}/private_replies,
// /{comment-id}/replies. No scraping, no browser automation.
const GRAPH = 'https://graph.instagram.com';
const FB_GRAPH = 'https://graph.facebook.com/v21.0';
async function graph(path, { token, method = 'GET', body, base = GRAPH } = {}) {
  const url = `${base}${path}${path.includes('?') ? '&' : '?'}access_token=${encodeURIComponent(token)}`;
  const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error?.message || `Meta API error ${res.status}`);
    err.status = res.status; err.meta = data.error; err.retryAfter = res.headers.get('retry-after');
    throw err;
  }
  return data;
}
const isRetryable = e => e.status === 429 || (e.status >= 500 && e.status < 600);
// Private reply: ONE per comment, only within 7 days, only on own media.
// POST /{comment-id}/private_replies { message } — official endpoint.
async function sendPrivateReply(commentId, message, token) {
  return graph(`/${commentId}/private_replies`, { token, method: 'POST', body: { message } });
}
async function sendPublicReply(commentId, message, token) {
  return graph(`/${commentId}/replies`, { token, method: 'POST', body: { message } });
}
async function listMedia(igUserId, token, limit = 25) {
  return graph(`/${igUserId}/media?fields=id,media_type,caption,thumbnail_url,media_url,permalink,timestamp,comments_count,like_count&limit=${limit}`, { token });
}
async function getAccount(igUserId, token) {
  return graph(`/${igUserId}?fields=id,username,profile_picture_url,account_type,media_count`, { token });
}
module.exports = { graph, isRetryable, sendPrivateReply, sendPublicReply, listMedia, getAccount, GRAPH, FB_GRAPH };
