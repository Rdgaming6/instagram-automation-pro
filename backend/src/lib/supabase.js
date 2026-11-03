// Supabase client (backend, service-role). Returns null in demo mode
// (env missing) — callers must handle demo mode explicitly and never fake
// a live Instagram send.
const { createClient } = require('@supabase/supabase-js');
const configured = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
let client = null;
if (configured) client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
module.exports = { supabase: client, configured };
