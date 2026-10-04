# Resource Sharing Hub

A site where students share study material: sign in, upload documents (PDF, Word, images, text), browse and filter them, and download them. Downloads are counted.

**Stack:** Next.js 15 (App Router), React 19, Tailwind CSS 4, Firebase (Auth, Firestore, Storage), Zustand, react-hot-toast.

## Getting started

Create `.env` with your Firebase web config:

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=   # currently read as the Firebase appId in firebase.js
```

```bash
npm install
npm run dev     # http://localhost:3000
npm run build
npm run lint
```

## Layout

| Path | Purpose |
| --- | --- |
| `app/` | Pages: landing, `login`, `signup`, `resources` (+ `[id]`), `upload-resources`, `profile` (+ `edit`), `about` |
| `app/Header.jsx` | Client nav bar that follows Firebase auth state |
| `actions/resources.js` | Server actions that read `student_posts` |
| `actions/upload.js` | Server action that uploads a file to Storage and writes the post |
| `app/api/increment-download` | Increments a post's download counter |
| `store/store.js` | Zustand store persisted to localStorage |
| `firebase/` | Draft security rules and Firestore indexes (not deployed) |

## Known limitation: server-side writes are unauthenticated

`uploadDocument` and `/api/increment-download` use the Firebase **client** SDK on the server, so they run without a signed-in user and trust a client-supplied `authorId`. They only work while Firestore/Storage rules are open.

The rules in `firebase/` are the target state. Before deploying them, move uploads and download counting to either client-side writes by the signed-in user, or `firebase-admin` with ID-token verification. Deploying them as-is will break uploads and the download counter.

Deploy indexes with `firebase deploy --only firestore:indexes` (the profile page needs the `authorId` + `uploadDate` index).
