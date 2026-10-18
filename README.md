# Portfolio Social

A personal portfolio site with an Instagram-style feed: real accounts, posts with
multi-media carousels, heart reactions, comments, hashtags, sorting, and sharing.

**Stack:** React (Vite) + Tailwind CSS + Supabase (Postgres, Auth, Storage).
Supabase was chosen so you don't have to write or host a separate backend server —
auth, database, and file storage are all managed for you, with a generous free tier.

## 1. Create your Supabase project

1. Go to https://supabase.com, create a free project.
2. In **Project Settings → API**, copy the **Project URL** and **anon public key**.
3. In **Project Settings → Authentication → Providers**, Email is on by default.
   For local development you may want to turn off "Confirm email" so sign-up logs
   you in immediately (Authentication → Providers → Email → toggle).

## 2. Set up the database

1. Open the **SQL Editor** in Supabase.
2. Paste in the contents of `supabase/schema.sql` and run it.
   This creates all tables, the auto-profile trigger, row-level security
   policies, and the `media` / `avatars` storage buckets.

## 3. Configure the app

```bash
cp .env.example .env
```

Fill in `.env` with your Project URL and anon key from step 1.

## 4. Install and run

```bash
npm install
npm run dev
```

Visit the printed local URL. Register an account, then post something with a
photo to see the whole flow (auth → post → media upload → like → comment → share).

## 5. Populate the static sections (optional)

`What's New` reads from the `updates` table, and `My Kittens` can also show
extra people you add to the `supporters` table. Add rows directly in the
Supabase Table Editor — there's no public write access to these tables on
purpose, since they're meant to be curated by you.

## 6. Deploy

- **Frontend:** push this folder to a GitHub repo and import it into
  [Vercel](https://vercel.com) or [Netlify](https://netlify.com). Add the same
  two env vars (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) in the host's
  dashboard, build command `npm run build`, output directory `dist`.
- **Backend:** nothing to deploy — Supabase is already hosted.

## Project structure

```
src/
  lib/supabaseClient.js      Supabase client
  context/AuthContext.jsx    session + profile state, sign up/in/out
  components/
    Navbar.jsx
    PostCard.jsx             card layout for a single post
    MediaCarousel.jsx        swipeable image/video carousel
    LikeButton.jsx           heart reaction + counter
    CommentSection.jsx       comments, incl. delete-own-comment
    ShareButton.jsx          native share sheet / copy link
    HashtagPill.jsx
    SortBar.jsx              newest / oldest / most liked
    CreatePostModal.jsx      caption + hashtags + media upload
    FilePicker.jsx           styled file chooser (click or drop, previews, remove)
    PostGrid.jsx             3-column thumbnail grid for the author's profile
    MediaThumb.jsx           square cover for a post (photo, video frame or caption)
    PostModal.jsx            pop-up view of one post
    ProfileComments.jsx      comment list on kitten/visitor profiles
  pages/
    Landing.jsx
    Feed.jsx                 the post feed (sort, filter, create)
    Profile.jsx              author: thumbnail grid; kittens/visitors: their comments
    Contact.jsx
    WhatsNew.jsx
    MyKittens.jsx            supporter ("kitten") wall
    Inbox.jsx                contact messages (author only)
    Login.jsx / Register.jsx
supabase/schema.sql           tables, RLS policies, storage buckets
supabase/author-role.sql      author-only posting
supabase/visitor-role.sql     visitor role, become-a-kitten, inbox access
supabase/author-moderation.sql  author can delete any comment
```

## Notes & next steps

- Feed queries fetch all posts client-side and sort/filter in the browser —
  fine at portfolio scale; if it grows large, move sorting/filtering into the
  Supabase query (`.order()`, a Postgres view, or pagination with `.range()`).
- Roles: `author` (you) posts, comments and reads the Inbox; `supporter`
  ("kitten") comments and likes; `visitor` (every new sign-up) likes and reads
  comments, and can click "Become a kitten (supporter)" to start commenting.
  Run `supabase/author-role.sql` first (after registering your own account, with
  your username filled in), then `supabase/visitor-role.sql`. To change anyone's
  role by hand, edit `role` in the Supabase Table Editor (`profiles` table).
- Moderation: as author you can delete any comment (feed or a kitten's
  profile). Run `supabase/author-moderation.sql` after `visitor-role.sql` to let
  the database allow it. Profiles of accounts that can't post (kittens,
  visitors) list their comments, each linking to its post (`/feed?post=<id>`,
  the same link the Share button copies).
- The author's profile shows posts as a 3-column grid of thumbnails (hover for
  likes and comments); clicking one opens the full post in a pop-up (close with
  ✕, Escape, or a click outside). The post is re-loaded each time it opens.
- Contact form messages are saved in the `contact_messages` table. As the
  author you read and delete them on the **Inbox** page (nav bar); they are not
  emailed anywhere. The Contact page and nav link are hidden for the author,
  who is the recipient.
- After logging in (or signing up with email confirmation off) people land on
  the Feed; after signing out they land on the Landing page.
- **My Kittens** lists every account with the `supporter` role, plus anything
  you add by hand to the `supporters` table.
- Post authors see a "Delete post" button on their own posts; deleting also
  removes the post's likes, comments and uploaded photos/videos.
- Visual design uses a small custom Tailwind palette (`tailwind.config.js`) —
  tweak `ink` / `paper` / `cobalt` / `rose` / `moss` / `sand` to restyle
  everything at once.
