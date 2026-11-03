# Testing

## 1. Unit tests (backend, no credentials)
```bash
cd backend && npm test
```
Covers the keyword engine: exact / contains / case-insensitive /
any-of / all-of / any-comment, KURTI examples from the brief
("kurti", "I want kurti", "Send me kurti link"), duplicate guards,
and webhook signature verification (HMAC-SHA256).

## 2. Webhook simulation (no Meta account needed)
```bash
cd backend && npm run dev
# In another terminal:
node scripts/simulate-webhook.js   # sends a signed test comment event
# Expect: 200, an automation_logs row, and (demo mode) a logged
# “would send” private reply — never a real Instagram send in demo mode.
```
Also try the same comment twice: the second delivery must be logged as
`duplicate_ignored`, with no second DM.

## 3. Frontend (demo mode)
```bash
cd frontend && npm install && npm run build && npm run dev
```
Checklist: Dashboard stats match seed data; Create Automation toggles
between [ Specific Keyword ] and [ Any Comment ] (keyword fields hide in
Any Comment mode); saving a campaign appears in Automations with correct
trigger label; Templates preview renders line breaks + emojis; Settings
shows “Setup required” for Meta/Supabase until configured.

## 4. End-to-end (live, needs Meta test user)
1. Connect Instagram in Development mode (you, as test user).
2. Create a campaign on a test Reel: keyword `TESTKURTI`, DM template
   “Test — check your DM 💗”, public reply “Check your DM! 💗”.
3. From a second (test-user) account, comment `TESTKURTI` on that Reel.
4. Expect within ~1 min: activity feed shows keyword match → private
   reply sent → public reply sent; the commenter receives exactly one DM.
5. Comment again with the same text on a *different* comment → second DM
   is fine (different comment_id). Re-send the same webhook → no duplicate.
6. Comment `hello` (no keyword) → no DM, logged as `no_match`.
7. Pause the campaign → comment → logged as `campaign_paused`, nothing sent.
8. Disconnect → Settings shows disconnected; reconnect restores it.
