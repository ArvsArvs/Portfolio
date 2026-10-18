-- ============================================================
-- Portfolio-Social database schema (Postgres / Supabase)
-- Run this once in the Supabase SQL editor for a new project.
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------- PROFILES ----------
create table profiles (
  id           uuid references auth.users on delete cascade primary key,
  username     text unique not null,
  display_name text,
  bio          text,
  avatar_url   text,
  created_at   timestamptz default now()
);

-- Auto-create a profile row whenever someone signs up.
-- Username comes from the "username" field passed in signUp() metadata.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------- POSTS ----------
create table posts (
  id         uuid primary key default gen_random_uuid(),
  author_id  uuid references profiles(id) on delete cascade not null,
  caption    text,
  created_at timestamptz default now()
);

create table post_media (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid references posts(id) on delete cascade not null,
  media_url  text not null,
  media_type text check (media_type in ('image','video')) not null,
  position   int not null default 0
);

create table hashtags (
  id  uuid primary key default gen_random_uuid(),
  tag text unique not null
);

create table post_hashtags (
  post_id    uuid references posts(id) on delete cascade,
  hashtag_id uuid references hashtags(id) on delete cascade,
  primary key (post_id, hashtag_id)
);

create table likes (
  post_id    uuid references posts(id) on delete cascade,
  user_id    uuid references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (post_id, user_id)
);

create table comments (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid references posts(id) on delete cascade not null,
  author_id  uuid references profiles(id) on delete cascade not null,
  body       text not null,
  created_at timestamptz default now()
);

-- ---------- SITE CONTENT ----------
create table contact_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  message    text not null,
  created_at timestamptz default now()
);

create table supporters (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  message    text,
  avatar_url text,
  tier       text,
  created_at timestamptz default now()
);

create table updates (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  body       text not null,
  created_at timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table profiles          enable row level security;
alter table posts             enable row level security;
alter table post_media        enable row level security;
alter table hashtags          enable row level security;
alter table post_hashtags     enable row level security;
alter table likes             enable row level security;
alter table comments          enable row level security;
alter table contact_messages  enable row level security;
alter table supporters        enable row level security;
alter table updates           enable row level security;

-- Public read access (this is a public portfolio/feed)
create policy "profiles are viewable by everyone" on profiles for select using (true);
create policy "posts are viewable by everyone" on posts for select using (true);
create policy "media is viewable by everyone" on post_media for select using (true);
create policy "hashtags are viewable by everyone" on hashtags for select using (true);
create policy "post_hashtags are viewable by everyone" on post_hashtags for select using (true);
create policy "likes are viewable by everyone" on likes for select using (true);
create policy "comments are viewable by everyone" on comments for select using (true);
create policy "supporters are viewable by everyone" on supporters for select using (true);
create policy "updates are viewable by everyone" on updates for select using (true);

-- Profiles: a user can only edit their own row
create policy "users can update own profile" on profiles for update using (auth.uid() = id);

-- Posts: only the signed-in author can create/delete their own posts
create policy "authenticated users can create posts" on posts for insert with check (auth.uid() = author_id);
create policy "authors can delete own posts" on posts for delete using (auth.uid() = author_id);
create policy "authors can update own posts" on posts for update using (auth.uid() = author_id);

-- Media / hashtag links: only insertable by the post's author
create policy "authors can add media to own posts" on post_media for insert
  with check (auth.uid() = (select author_id from posts where posts.id = post_id));
create policy "authors can delete media from own posts" on post_media for delete
  using (auth.uid() = (select author_id from posts where posts.id = post_id));

create policy "anyone authenticated can create hashtags" on hashtags for insert with check (auth.role() = 'authenticated');
create policy "authors can tag own posts" on post_hashtags for insert
  with check (auth.uid() = (select author_id from posts where posts.id = post_id));
create policy "authors can untag own posts" on post_hashtags for delete
  using (auth.uid() = (select author_id from posts where posts.id = post_id));

-- Likes: any signed-in user can like/unlike, only their own row
create policy "authenticated users can like posts" on likes for insert with check (auth.uid() = user_id);
create policy "users can remove own like" on likes for delete using (auth.uid() = user_id);

-- Comments: any signed-in user can comment; only the COMMENT AUTHOR can delete it
create policy "authenticated users can comment" on comments for insert with check (auth.uid() = author_id);
create policy "comment authors can delete own comments" on comments for delete using (auth.uid() = author_id);

-- Contact form: anyone (incl. anonymous) can submit
create policy "anyone can send a contact message" on contact_messages for insert with check (true);

-- Supporters / updates: managed by you directly in the Supabase table editor
-- (no public insert policy on purpose)

-- ============================================================
-- STORAGE
-- Create two buckets in the Supabase dashboard (Storage tab):
--   "media"   -> public bucket, for post images/videos
--   "avatars" -> public bucket, for profile pictures
-- Then run the policies below (Storage > Policies, or SQL editor).
-- ============================================================
insert into storage.buckets (id, name, public) values ('media', 'media', true) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true) on conflict do nothing;

create policy "media is publicly readable" on storage.objects for select using (bucket_id = 'media');
create policy "authenticated users can upload media" on storage.objects for insert
  with check (bucket_id = 'media' and auth.role() = 'authenticated');
create policy "owners can delete their media" on storage.objects for delete
  using (bucket_id = 'media' and owner = auth.uid());

create policy "avatars are publicly readable" on storage.objects for select using (bucket_id = 'avatars');
create policy "authenticated users can upload their avatar" on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.role() = 'authenticated');
create policy "owners can update their avatar" on storage.objects for update
  using (bucket_id = 'avatars' and owner = auth.uid());
