// Demo-mode in-memory store + the live Supabase-backed helpers share one
// tiny interface so routes work identically in both modes. Live mode uses
// Supabase tables; demo mode uses this store and NEVER calls Meta.
const demo = require('./demoData');
const { supabase, configured } = require('./supabase');
function isLive() { return configured; }
// Idempotency guard used by automation: returns true if this (comment,action)
// was already recorded.
const seen = new Set();
function alreadyLogged(commentId, action) {
  const k = `${commentId}:${action}`;
  if (seen.has(k)) return true;
  seen.add(k); return false;
}
module.exports = { demo, supabase, configured, isLive, alreadyLogged };
