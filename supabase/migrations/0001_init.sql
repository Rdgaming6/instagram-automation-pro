-- Instagram Automation Pro — 0001_init
-- Run in Supabase SQL Editor. All tables owner-scoped (owner_id = auth.uid())
-- with RLS. Service-role key (backend only) bypasses RLS.
create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

-- Users mirror Supabase Auth (created by trigger/app on signup)
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  created_at timestamptz not null default now()
);
alter table public.users enable row level security;
create policy "own user row" on public.users for all using (auth.uid() = id);

create table if not exists public.instagram_accounts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  ig_user_id text not null,
  username text not null,
  profile_picture_url text,
  account_type text check (account_type in ('BUSINESS','CREATOR')),
  status text not null default 'connected' check (status in ('connected','token_expired','disconnected','error')),
  page_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(owner_id, ig_user_id)
);
create index idx_ig_accounts_owner on public.instagram_accounts(owner_id);

create table if not exists public.access_tokens (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  instagram_account_id uuid not null references public.instagram_accounts(id) on delete cascade,
  token_encrypted text not null, -- AES-256-GCM ciphertext (backend only); never returned to frontend
  token_type text not null default 'long_lived',
  expires_at timestamptz,
  scopes text[] not null default '{}',
  created_at timestamptz not null default now(),
  unique(instagram_account_id)
);

create table if not exists public.dm_templates (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  body text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.public_reply_templates (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  body text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  instagram_account_id uuid references public.instagram_accounts(id) on delete set null,
  name text not null,
  media_id text, -- null = all eligible media
  apply_to_all_media boolean not null default false,
  trigger_type text not null check (trigger_type in ('specific_keyword','any_comment')),
  match_mode text not null default 'contains' check (match_mode in ('exact','contains')),
  keyword_logic text not null default 'any' check (keyword_logic in ('any','all')),
  case_insensitive boolean not null default true,
  dm_template_id uuid references public.dm_templates(id) on delete set null,
  dm_message text,
  public_reply_enabled boolean not null default false,
  public_reply_template_id uuid references public.public_reply_templates(id) on delete set null,
  public_reply_message text,
  public_reply_delay_seconds int not null default 10 check (public_reply_delay_seconds between 0 and 300),
  manual_review boolean not null default false,
  status text not null default 'active' check (status in ('active','paused','draft')),
  total_comments int not null default 0,
  successful_dms int not null default 0,
  successful_public_replies int not null default 0,
  failed_actions int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_campaigns_owner on public.campaigns(owner_id);
create index idx_campaigns_media on public.campaigns(media_id);

-- Multiple trigger groups per campaign (Option C)
create table if not exists public.campaign_triggers (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  priority int not null default 0,
  trigger_type text not null check (trigger_type in ('specific_keyword','any_comment')),
  dm_template_id uuid references public.dm_templates(id) on delete set null,
  dm_message text,
  public_reply_message text,
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);
create table if not exists public.keyword_rules (
  id uuid primary key default gen_random_uuid(),
  trigger_id uuid not null references public.campaign_triggers(id) on delete cascade,
  keyword text not null,
  created_at timestamptz not null default now(),
  unique(trigger_id, keyword)
);

create table if not exists public.instagram_media (
  id text primary key, -- Meta media id
  owner_id uuid not null references auth.users(id) on delete cascade,
  instagram_account_id uuid references public.instagram_accounts(id) on delete set null,
  media_type text, -- IMAGE, VIDEO, REEL, CAROUSEL_ALBUM
  caption text,
  thumbnail_url text,
  media_url text,
  permalink text,
  timestamp timestamptz,
  comments_count int not null default 0,
  like_count int not null default 0,
  synced_at timestamptz not null default now()
);
create index idx_media_owner on public.instagram_media(owner_id);

create table if not exists public.instagram_comments (
  id text primary key, -- Meta comment id (idempotency key)
  owner_id uuid not null references auth.users(id) on delete cascade,
  media_id text references public.instagram_media(id) on delete set null,
  username text,
  user_id text,
  text text not null,
  timestamp timestamptz,
  parent_id text,
  triggered_rule_id uuid references public.campaign_triggers(id) on delete set null,
  triggered_campaign_id uuid references public.campaigns(id) on delete set null,
  dm_sent boolean not null default false,
  public_reply_sent boolean not null default false,
  processed_at timestamptz,
  created_at timestamptz not null default now()
);
create index idx_comments_owner_media on public.instagram_comments(owner_id, media_id);
create index idx_comments_text_trgm on public.instagram_comments using gin (text gin_trgm_ops);

create table if not exists public.automation_logs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  campaign_id uuid references public.campaigns(id) on delete set null,
  trigger_id uuid references public.campaign_triggers(id) on delete set null,
  comment_id text references public.instagram_comments(id) on delete set null,
  media_id text,
  action text not null check (action in ('comment_received','keyword_match','any_comment_trigger','private_reply_sent','public_reply_sent','no_match','campaign_paused','duplicate_ignored','failed','pending_review')),
  status text not null default 'success' check (status in ('success','failed','skipped','pending')),
  message text,
  error text,
  created_at timestamptz not null default now(),
  unique(comment_id, action) -- idempotency: one private_reply_sent per comment, etc.
);
create index idx_logs_owner_created on public.automation_logs(owner_id, created_at desc);

create table if not exists public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete set null,
  delivery_id text, -- X-Hub / event id when present
  event_type text not null,
  payload jsonb not null,
  signature_valid boolean not null default false,
  processed boolean not null default false,
  created_at timestamptz not null default now(),
  unique(delivery_id, event_type)
);
create index idx_webhook_created on public.webhook_events(created_at desc);

-- RLS: owner-only on every user table (service role bypasses for backend)
alter table public.instagram_accounts enable row level security;
alter table public.access_tokens enable row level security;
alter table public.dm_templates enable row level security;
alter table public.public_reply_templates enable row level security;
alter table public.campaigns enable row level security;
alter table public.campaign_triggers enable row level security;
alter table public.keyword_rules enable row level security;
alter table public.instagram_media enable row level security;
alter table public.instagram_comments enable row level security;
alter table public.automation_logs enable row level security;
alter table public.webhook_events enable row level security;
-- Generic owner policies (access_tokens: no direct frontend access at all —
-- backend uses service role; the policy below still blocks anon/authenticated reads)
create policy "owner all" on public.instagram_accounts for all using (auth.uid() = owner_id);
create policy "owner all" on public.dm_templates for all using (auth.uid() = owner_id);
create policy "owner all" on public.public_reply_templates for all using (auth.uid() = owner_id);
create policy "owner all" on public.campaigns for all using (auth.uid() = owner_id);
create policy "owner all" on public.campaign_triggers for all using (auth.uid() = owner_id);
create policy "owner all" on public.instagram_media for all using (auth.uid() = owner_id);
create policy "owner all" on public.instagram_comments for all using (auth.uid() = owner_id);
create policy "owner all" on public.automation_logs for all using (auth.uid() = owner_id);
create policy "owner all" on public.webhook_events for all using (auth.uid() = owner_id);
-- keyword_rules are reached via their trigger's campaign; keep them owner-scoped
-- through a join-free approach: backend (service role) manages them; frontend
-- reads them via campaigns API. No direct policy = no direct access.
create policy "no direct access" on public.access_tokens for all using (false);
create policy "no direct access" on public.keyword_rules for all using (false);
