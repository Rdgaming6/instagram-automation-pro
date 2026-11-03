-- Demo seed only. Replace the owner uuid with your auth user id, or use the
-- frontend Demo mode (which ships this data in code) instead of seeding live.
-- Demo account: @rajas.style (Creator), 3 media, 2 campaigns, sample comments/logs.
-- NOTE: ids below are demo placeholders, not real Meta ids.
insert into public.instagram_media (id, owner_id, media_type, caption, thumbnail_url, timestamp, comments_count, like_count)
values
 ('demo_media_1','00000000-0000-0000-0000-000000000001','REEL','New kurti drop 💗 Comment KURTI for the link!','',now()-interval '2 days',48,312),
 ('demo_media_2','00000000-0000-0000-0000-000000000001','REEL','Price reveal + styling tips ✨ Comment PRICE','',now()-interval '5 days',31,208),
 ('demo_media_3','00000000-0000-0000-0000-000000000001','IMAGE','Sunday outfit check 🤍','',now()-interval '8 days',12,96)
on conflict (id) do nothing;
