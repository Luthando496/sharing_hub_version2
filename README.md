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

### 3. Configure sign-in (Supabase dashboard -> Authentication)

- **URL Configuration:** set the Site URL to your site (`http://localhost:3000` for local dev) and add `http://localhost:3000/auth/callback` (and your production URL's `/auth/callback`) to the Redirect URLs.
- **Providers:** email/password works out of the box. For the Google and GitHub buttons, enable each provider and paste in its client ID and secret.
- Optional: turn off "Confirm email" while developing if you don't want to click a link after every sign-up.

### 4. Run it

```bash
npm install
npm run dev     # http://localhost:3000
npm run build
npm run lint
```

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

## Cleanup after the Firebase migration

These files are no longer used and can be deleted: `firebase.js`, `actions/upload.js`, the `firebase/` folder, `store/store.js`, and `app/Content.jsx`. You can also remove the `NEXT_PUBLIC_FIREBASE_*` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` lines from `.env`.
