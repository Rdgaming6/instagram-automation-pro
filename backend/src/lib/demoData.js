// Demo data shared by backend demo mode and (mirrored in) the frontend.
// Realistic seed: @rajas.style, 3 media, campaigns for KURTI / PRICE / LINK,
// any-comment fallback, comments + activity log.
module.exports = {
  account: { username: 'rajas.style', ig_user_id: '17841400000000000', account_type: 'CREATOR', status: 'connected', profile_picture_url: '', followers: 12480 },
  media: [
    { id: 'demo_media_1', media_type: 'REEL', caption: 'New kurti drop 💗 Comment KURTI for the link!', timestamp: '2026-11-01T10:00:00Z', comments_count: 48, like_count: 312, permalink: 'https://instagram.com/reel/demo1' },
    { id: 'demo_media_2', media_type: 'REEL', caption: 'Price reveal + styling tips ✨ Comment PRICE', timestamp: '2026-10-29T10:00:00Z', comments_count: 31, like_count: 208, permalink: 'https://instagram.com/reel/demo2' },
    { id: 'demo_media_3', media_type: 'IMAGE', caption: 'Sunday outfit check 🤍', timestamp: '2026-10-26T10:00:00Z', comments_count: 12, like_count: 96, permalink: 'https://instagram.com/p/demo3' },
  ],
  campaigns: [
    { id: 'camp_1', name: 'Kurti Drop — Comment to DM', media_id: 'demo_media_1', media_caption: 'New kurti drop 💗', trigger_type: 'specific_keyword', match_mode: 'contains', keyword_logic: 'any', case_insensitive: true, status: 'active', created_at: '2026-11-01T09:00:00Z', total_comments: 48, successful_dms: 32, successful_public_replies: 30, failed_actions: 1,
      triggers: [
        { id: 'tr_1', priority: 0, trigger_type: 'specific_keyword', keywords: ['KURTI'], dm_message: 'Hey girl! 💗\n\nThank you for your interest in this beautiful outfit!\n\nHere is your shopping link:\nhttps://example.com/kurti\n\nHappy shopping! ✨', public_reply_message: 'Check your DM, girl! 💗', enabled: true },
        { id: 'tr_2', priority: 1, trigger_type: 'specific_keyword', keywords: ['PRICE'], dm_message: 'Hey! 💗 The kurti is ₹1,499 (MRP ₹2,499). Link: https://example.com/kurti', public_reply_message: "I've sent you the details in DM! ✨", enabled: true },
        { id: 'tr_3', priority: 2, trigger_type: 'any_comment', keywords: [], dm_message: 'Hey! 💗 Thanks for commenting — here is the collection link: https://example.com/shop', public_reply_message: 'Check your DM! 💗', enabled: true },
      ] },
    { id: 'camp_2', name: 'Price Reveal — Any Comment', media_id: 'demo_media_2', media_caption: 'Price reveal + styling tips ✨', trigger_type: 'any_comment', match_mode: 'contains', keyword_logic: 'any', case_insensitive: true, status: 'active', created_at: '2026-10-29T09:00:00Z', total_comments: 31, successful_dms: 18, successful_public_replies: 18, failed_actions: 0,
      triggers: [{ id: 'tr_4', priority: 0, trigger_type: 'any_comment', keywords: [], dm_message: 'Hey! ✨ Price details sent — check your DM.', public_reply_message: 'Sent you the details in DM! ✨', enabled: true }] },
    { id: 'camp_3', name: 'Sunday Outfit (paused)', media_id: 'demo_media_3', media_caption: 'Sunday outfit check 🤍', trigger_type: 'specific_keyword', match_mode: 'contains', keyword_logic: 'any', case_insensitive: true, status: 'paused', created_at: '2026-10-26T09:00:00Z', total_comments: 12, successful_dms: 5, successful_public_replies: 5, failed_actions: 0,
      triggers: [{ id: 'tr_5', priority: 0, trigger_type: 'specific_keyword', keywords: ['LINK'], dm_message: 'Here is the link 💗 https://example.com/shop', public_reply_message: 'Check your DM! 💗', enabled: true }] },
  ],
  dmTemplates: [
    { id: 'dm_1', name: 'Kurti shopping link', body: 'Hey girl! 💗\n\nThank you for your interest in this beautiful outfit!\n\nHere is your shopping link:\nhttps://example.com/kurti\n\nHappy shopping! ✨', is_default: true },
    { id: 'dm_2', name: 'Price info', body: 'Hey! 💗 The price is ₹1,499. Link: https://example.com/kurti', is_default: false },
  ],
  publicTemplates: [
    { id: 'pr_1', name: 'Check your DM', body: 'Check your DM, girl! 💗', is_default: true },
    { id: 'pr_2', name: 'Details sent', body: "I've sent you the details in DM! ✨", is_default: false },
  ],
  comments: [
    { id: 'c_1', media_id: 'demo_media_1', username: 'aisha.shops', text: 'KURTI', timestamp: '2026-11-02T08:12:00Z', triggered_rule: 'KURTI', dm_sent: true, public_reply_sent: true },
    { id: 'c_2', media_id: 'demo_media_1', username: 'meera_22', text: 'I want kurti', timestamp: '2026-11-02T08:20:00Z', triggered_rule: 'KURTI', dm_sent: true, public_reply_sent: true },
    { id: 'c_3', media_id: 'demo_media_1', username: 'priya.k', text: 'Send me kurti link please', timestamp: '2026-11-02T09:01:00Z', triggered_rule: 'KURTI', dm_sent: true, public_reply_sent: true },
    { id: 'c_4', media_id: 'demo_media_1', username: 'sanaaa', text: 'Beautiful 😍', timestamp: '2026-11-02T09:40:00Z', triggered_rule: 'Any Comment', dm_sent: true, public_reply_sent: true },
    { id: 'c_5', media_id: 'demo_media_2', username: 'riya.m', text: 'Price?', timestamp: '2026-11-01T11:00:00Z', triggered_rule: 'Any Comment', dm_sent: true, public_reply_sent: true },
    { id: 'c_6', media_id: 'demo_media_1', username: 'kavya', text: 'Wow', timestamp: '2026-11-02T10:05:00Z', triggered_rule: 'Any Comment', dm_sent: false, public_reply_sent: false },
  ],
  activity: [
    { id: 'a_1', action: 'private_reply_sent', status: 'success', message: 'Someone commented "KURTI" on Reel #1 — keyword KURTI matched, private reply sent.', created_at: '2026-11-02T08:12:00Z' },
    { id: 'a_2', action: 'public_reply_sent', status: 'success', message: 'Public comment reply sent: "Check your DM, girl! 💗"', created_at: '2026-11-02T08:12:30Z' },
    { id: 'a_3', action: 'keyword_match', status: 'success', message: '"I want kurti" matched KURTI (contains, case-insensitive).', created_at: '2026-11-02T08:20:00Z' },
    { id: 'a_4', action: 'any_comment_trigger', status: 'success', message: '"Beautiful 😍" triggered Any Comment on Reel #1.', created_at: '2026-11-02T09:40:00Z' },
    { id: 'a_5', action: 'failed', status: 'failed', message: 'Private reply failed for comment c_9: comment deleted by user.', error: 'Meta error 100: comment not found', created_at: '2026-11-02T10:02:00Z' },
  ],
};
