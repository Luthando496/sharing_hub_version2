# Resource Sharing Hub

A site where students share study material: sign up, upload documents (PDF, Word, images, text), browse and filter them, and download them. Downloads are counted.

**Stack:** Next.js 15 (App Router), React 19, Tailwind CSS 4, Supabase (Auth + Postgres), ImageKit (file storage), react-hot-toast.

## Setup

### 1. Environment variables (`.env`)

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=

IMAGEKIT_PUBLIC_KEY=
IMAGEKIT_PRIVATE_KEY=
IMAGEKIT_URL_ENDPOINT=
```

### 2. Create the database tables

Open the Supabase dashboard, go to **SQL Editor**, paste the contents of [`supabase/schema.sql`](supabase/schema.sql) and run it. It creates:

| Table | Purpose |
| --- | --- |
| `profiles` | One row per user (name, avatar, module, bio). Created automatically on sign-up. |
| `resources` | Uploaded study material. Stores the ImageKit file and thumbnail URLs. |
| `posts` | Blog posts, for the upcoming blog feature. |

It also adds row-level security (anyone can read, users can only change their own rows) and an `increment_download` function used by the download counter.

### 3. Add the blog (run after step 2)

Run [`supabase/blog.sql`](supabase/blog.sql) the same way. It adds roles, the post subtitle and cover rules, and the permissions that let only authors write.

**Making someone an author** (SRC members, class reps): in the SQL Editor run

```sql
update public.profiles
   set role = 'author'
 where id = (select id from auth.users where email = 'src.member@school.edu');
```

They must have signed up first. Use `'admin'` for yourself (admins can also edit or delete anyone's post) and `'student'` to take access away. Nobody can change a role from the website.

**Optional sample posts:** after at least one account has signed up, run [`supabase/seed-blog.sql`](supabase/seed-blog.sql) to add 8 sample posts from different faculties. Remove them later with `delete from public.posts where slug like '%-sample';`.

### 4. Configure sign-in (Supabase dashboard -> Authentication)

- **URL Configuration:** set the Site URL to your site (`http://localhost:3000` for local dev) and add `http://localhost:3000/auth/callback` (and your production URL's `/auth/callback`) to the Redirect URLs.
- **Providers:** email/password works out of the box. For the Google and GitHub buttons, enable each provider and paste in its client ID and secret.
- Optional: turn off "Confirm email" while developing if you don't want to click a link after every sign-up.

### 5. Run it

```bash
npm install
npm run dev     # http://localhost:3000
npm run build
npm run lint
```

## The blog

- `/blog` lists posts, `/blog/<slug>` is the reader, `/blog/new` and `/blog/<slug>/edit` are the editor (authors only).
- Every post has a title, subtitle, **required** cover image, optional images inside the text, the author, and published and updated dates.
- Posts can be drafts (visible only to their author). Text uses simple formatting: a blank line starts a new paragraph, with toolbar buttons for bold, italic, headings, lists, quotes and links, a Preview tab, and an "Add image" button that uploads to ImageKit.

## How uploads work

1. The browser asks `/api/imagekit-auth` for a signature. The route only answers signed-in users and keeps the ImageKit private key on the server.
2. The browser uploads the file (and optional thumbnail) straight to ImageKit and receives the URLs.
3. The browser inserts a row into `resources` with those URLs. Row-level security guarantees `author_id` is the signed-in user.

## Layout

| Path | Purpose |
| --- | --- |
| `app/` | Pages: landing, `login`, `signup`, `resources` (+ `[id]`), `upload-resources`, `profile` (+ `edit`), `about` |
| `app/components/` | Header (sticky nav), theme toggle, footer, shared UI |
| `app/auth/callback` | Finishes Google / GitHub / email-confirmation sign-in |
| `app/api/imagekit-auth` | Signs ImageKit uploads for signed-in users |
| `app/api/increment-download` | Bumps a resource's download count via `increment_download` |
| `actions/resources.js` | Server actions that read `resources` |
| `lib/supabase/` | Browser client, server client and the `useUser` hook |
| `middleware.js` | Keeps the Supabase session cookie fresh |
| `supabase/schema.sql` | Database schema and security policies |
| `supabase/blog.sql` | Blog migration: roles, post rules, author-only permissions |
| `app/blog/` | Blog list, reader and editor |

## Testing

```bash
npm test              # run every test once
npm run test:watch    # re-run automatically while you edit code
```

Tests live in `tests/` and use [Vitest](https://vitest.dev) with React Testing Library. Supabase and ImageKit are replaced with fakes, so tests never touch your real data and need no internet or `.env`.

| Folder | What it covers |
| --- | --- |
| `tests/lib` | Data mapping, download links, the ImageKit upload helper, blog helpers, editor text tools |
| `tests/api` | Signing route (login required, correct signature), download counter validation, OAuth callback redirect safety |
| `tests/actions` | Reading resources from the database |
| `tests/components` | Theme switcher, header and mobile menu, image fallback, blog renderer (safety) and post editor rules |
| `tests/pages` | Browse page (search, filters, downloads), login and signup |

When you add a feature, add a `*.test.js(x)` file in the matching folder.

## Cleanup after the Firebase migration

These files are no longer used and can be deleted: `firebase.js`, `actions/upload.js`, the `firebase/` folder, `store/store.js`, and `app/Content.jsx`. You can also remove the `NEXT_PUBLIC_FIREBASE_*` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` lines from `.env`.
