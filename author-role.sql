-- ============================================================
-- Author / supporter roles
-- Run once in the Supabase SQL editor, AFTER schema.sql and AFTER you
-- have registered your own account.
--
-- Before running: replace YOUR-USERNAME in step 5 with your username.
-- ============================================================

-- 1. Everyone who signs up is a supporter by default
alter table public.profiles
  add column if not exists role text not null default 'supporter'
  check (role in ('author', 'supporter'));

-- 2. Stop people from changing their own role: signed-in users may only
--    update these profile columns (the Edit profile form uses the last three)
revoke update on public.profiles from authenticated;
grant update (username, display_name, bio, avatar_url) on public.profiles to authenticated;

-- 3. Helper: is the signed-in user an author?
create or replace function public.is_author()
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'author'
  );
$$;

-- 4. Only authors can create posts, create hashtags and upload post media.
--    (Also removes the earlier open or owner-ID versions of these rules.)
drop policy if exists "authenticated users can create posts" on posts;
drop policy if exists "only the owner can create posts" on posts;
create policy "only authors can create posts" on posts for insert
  with check (auth.uid() = author_id and public.is_author());

drop policy if exists "anyone authenticated can create hashtags" on hashtags;
drop policy if exists "only the owner can create hashtags" on hashtags;
create policy "only authors can create hashtags" on hashtags for insert
  with check (public.is_author());

drop policy if exists "authenticated users can upload media" on storage.objects;
drop policy if exists "only the owner can upload media" on storage.objects;
create policy "only authors can upload media" on storage.objects for insert
  with check (bucket_id = 'media' and public.is_author());

-- 5. Make YOUR account the author
update public.profiles set role = 'author' where username = 'YOUR-USERNAME';

-- 6. Check: your username should say author, everyone else supporter
select username, role from public.profiles order by role, username;
