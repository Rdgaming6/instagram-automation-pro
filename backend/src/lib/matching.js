// Keyword matching engine — pure functions, fully unit-tested.
// Rules from the brief: exact / contains, case-insensitive, any-of / all-of,
// any-comment mode. "kurti" must match "kurti", "I want kurti",
// "Send me kurti link" in contains mode.
function normalize(text, caseInsensitive) {
  const t = (text || '').trim();
  return caseInsensitive ? t.toLowerCase() : t;
}
function keywordMatches(commentText, keyword, { matchMode = 'contains', caseInsensitive = true } = {}) {
  const c = normalize(commentText, caseInsensitive);
  const k = normalize(keyword, caseInsensitive);
  if (!k) return false;
  if (matchMode === 'exact') return c === k;
  return c.includes(k); // contains
}
// Returns { matched, matchedKeywords }
function groupMatches(commentText, keywords, opts = {}) {
  const { keywordLogic = 'any' } = opts;
  const list = (keywords || []).map(k => String(k).trim()).filter(Boolean);
  if (list.length === 0) return { matched: false, matchedKeywords: [] };
  const hits = list.filter(k => keywordMatches(commentText, k, opts));
  if (keywordLogic === 'all') return { matched: hits.length === list.length, matchedKeywords: hits };
  return { matched: hits.length > 0, matchedKeywords: hits };
}
// Evaluate ordered trigger groups for one comment.
// Keyword groups first, any-comment last (so KURTI gets the KURTI DM).
// Returns the winning trigger or null.
function pickTrigger(commentText, triggers, campaignOpts = {}) {
  const sorted = [...(triggers || [])].filter(t => t.enabled !== false)
    .sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));
  for (const t of sorted) {
    if (t.trigger_type === 'specific_keyword') {
      const r = groupMatches(commentText, t.keywords || [], { ...campaignOpts, keywordLogic: t.keyword_logic || campaignOpts.keyword_logic || 'any' });
      if (r.matched) return { trigger: t, matchedKeywords: r.matchedKeywords, kind: 'keyword_match' };
    }
  }
  for (const t of sorted) {
    if (t.trigger_type === 'any_comment') return { trigger: t, matchedKeywords: [], kind: 'any_comment_trigger' };
  }
  return null;
}
module.exports = { normalize, keywordMatches, groupMatches, pickTrigger };
