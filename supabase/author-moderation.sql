-- ============================================================
-- Author moderation: the author can delete a comment from any role
-- Run once in the Supabase SQL editor, AFTER visitor-role.sql.
-- (People can still delete their own comments, from the earlier schema.)
-- ============================================================

drop policy if exists "authors can delete any comment" on comments;
create policy "authors can delete any comment" on comments for delete
  using (public.is_author());

-- Check: should list both delete policies
select policyname, cmd from pg_policies
where tablename = 'comments' and cmd = 'DELETE'
order by policyname;
