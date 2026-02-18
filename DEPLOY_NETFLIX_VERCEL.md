# Deploy Netflix Clone (Vercel + Render)

## 1. Deploy backend (`netflix-clone-backend`) on Render

1. Push this repo to GitHub.
2. In Render, create a new **Blueprint** service from the repo.
3. Set root to `netflix-clone-backend` if prompted.
4. Fill required backend env vars:
   - `DB_URL`
   - `DB_USERNAME`
   - `DB_PASSWORD`
   - `REDIS_HOST`
   - `REDIS_PASSWORD`
   - `SESSION_COOKIE_DOMAIN` (backend domain, for example `your-api.onrender.com`)
   - `CORS_ALLOWED_ORIGIN_PATTERNS` (for example `https://your-ui.vercel.app,https://*.vercel.app`)
5. Keep:
   - `SESSION_COOKIE_SAMESITE=None`
   - `SESSION_COOKIE_SECURE=true`
6. Deploy and note backend URL, for example `https://your-api.onrender.com`.

## 2. Deploy UI (`netflix-clone-ui`) on Vercel

1. Import this repo in Vercel.
2. Set **Root Directory** to `netflix-clone-ui`.
3. Add env var:
   - `VITE_NETFLIX_AUTH_BASE_URL=https://your-api.onrender.com`
4. Deploy.

## 3. Final backend update after Vercel URL is live

1. Copy your final Vercel URL, for example `https://your-ui.vercel.app`.
2. In Render backend env vars, set:
   - `CORS_ALLOWED_ORIGIN_PATTERNS=https://your-ui.vercel.app,https://*.vercel.app`
3. Redeploy backend.

## 4. Verify

1. Open Vercel app and test register/login.
2. Confirm `/api/movies/home` works from UI.
3. If cookies fail, check browser devtools:
   - response contains `Set-Cookie`
   - request contains cookie on next call
