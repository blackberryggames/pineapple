# Pineapple Games

Live site: https://blackberryggames.github.io/pineapple/

Next.js (static export) + Tailwind + Firebase Auth/Firestore. Deploys to GitHub Pages.

## One-time setup
1. **Push to GitHub** (branch `main`). In the repo: Settings → Pages → Source = **GitHub Actions**.
2. **Firebase console → Authentication**: enable *Google* and *Email/Password*; under Settings → Authorized domains add `<your-user>.github.io`.
3. **Firebase console → Firestore**: create the database, then paste `firestore.rules` into the Rules tab and publish.
4. Sign in on the site with `30copallock@pulaskischools.org` (Google, or email + verify the link). The Admin button appears.

Local dev: `npm install && npm run dev`.
