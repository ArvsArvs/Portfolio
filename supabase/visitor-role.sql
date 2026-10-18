-- ============================================================
-- Visitor role, kitten (supporter) upgrade, and contact inbox
-- Run once in the Supabase SQL editor, AFTER author-role.sql.
--
-- Roles after this:
--   author     you: posts, comments, likes, reads the inbox
--   supporter  a "kitten": comments and likes
--   visitor    new sign-ups: likes and reads comments, can't comment yet
-- Existing accounts keep the role they have now.
-- ============================================================

-- 1. Add the visitor role; new sign-ups start as visitors
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check check (role in ('author', 'supporter', 'visitor'));
alter table public.profiles alter column role set default 'visitor';

-- 2. Helper: can the signed-in user comment? (authors and supporters)
create or replace function public.can_comment()
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('author', 'supporter')
  );
$$;

-- 3. Only authors and supporters can write comments (everyone can still read them)
drop policy if exists "authenticated users can comment" on comments;
drop policy if exists "supporters and authors can comment" on comments;
create policy "supporters and authors can comment" on comments for insert
  with check (auth.uid() = author_id and public.can_comment());

-- 4. "Become a kitten": lets a visitor upgrade ONLY themselves to supporter
create or replace function public.become_supporter()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles
  set role = 'supporter'
  where id = auth.uid() and role = 'visitor';
end;
$$;
revoke all on function public.become_supporter() from public, anon;
grant execute on function public.become_supporter() to authenticated;

-- 5. Contact inbox: only the author can read and delete messages
--    (anyone can still send one, from the earlier schema)
drop policy if exists "authors can read contact messages" on contact_messages;
create policy "authors can read contact messages" on contact_messages for select
  using (public.is_author());

drop policy if exists "authors can delete contact messages" on contact_messages;
create policy "authors can delete contact messages" on contact_messages for delete
  using (public.is_author());

-- 6. Check: your account should be author, the rest supporter or visitor
select username, role from public.profiles order by role, username;
