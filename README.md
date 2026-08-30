# LMdb

A personal Diary. Search films, log reviews,
build a watchlist and custom lists, and share your reviews as images. All your
data is stored **locally in your browser** (localStorage) — nothing is sent to a
backend except the movie metadata requests to [OMDb](https://www.omdbapi.com).

## Features

- Search movies via the OMDb API
- Log reviews with star ratings, tags, and watched dates
- Diary, Watchlist, and custom Lists
- Share a review as a downloadable / shareable image
- Dark / light theme
- Local backup & restore (`/backup`)
- 100% client-side; deploys as a static site (Vercel functions proxy OMDb so
  there are no CORS issues)

## Prerequisites

- [Node.js](https://nodejs.org/) 18 or newer
- A free **OMDb API key** — get one at <https://www.omdbapi.com/apikey.aspx>
  (free tier: 1000 requests/day)

## Run locally

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server (opens http://localhost:5173)
npm run dev
```

Then:

1. Open <http://localhost:5173>
2. Go to **Settings** and paste your OMDb API key
3. Click **Test key** to verify it works, then **Save settings**
4. Use **Search** to find a film and start logging reviews

### Other scripts

```bash
npm run build      # type-check + production build into dist/
npm run preview    # preview the production build locally (http://localhost:4173)
npm run typecheck  # type-check only
```

> The dev/preview servers proxy OMDb and poster images through the local Vite
> server, so you don't need to worry about CORS while developing.

## Deploy to Vercel

This app is a static front-end plus two tiny serverless functions (`/api/omdb`
and `/api/img`) that proxy OMDb and poster images in production.

### One-click / dashboard

1. Push this repo to GitHub/GitLab/Bitbucket.
2. In [Vercel](https://vercel.com), click **Add New → Project** and import the repo.
3. Vercel auto-detects Vite. The `vercel.json` already sets:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Rewrites:** SPA fallback to `index.html`
4. Click **Deploy**.

### CLI

```bash
npm i -g vercel
vercel login
vercel            # deploy (follow prompts)
vercel --prod     # promote to production
```

No environment variables are required — users enter their own OMDb key inside
the app (stored only in their browser). The `/api/*` functions simply forward
requests, so the browser never calls OMDb directly and there are no CORS errors
in production.

## Notes

- Your reviews, watchlist, and lists live only in the browser's localStorage.
  Use the **Backup** page to export/import them if you switch devices.
- OMDb's free tier is limited to 1000 requests/day per key.
