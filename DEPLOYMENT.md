# Deployment Engineering Decisions

This document explains every decision made for the production deployment setup (Option 3: Railway backend + Vercel frontend), including the engineering concept behind each one.

---

## Architecture: Split Deployment (Backend + Frontend Separate)

### Decision
Backend on **Railway** (Node.js + PostgreSQL), frontend on **Vercel** (static CDN).

### Why not host everything on one server?
A single server hosting both the API and static files creates unnecessary coupling. The frontend is a **static artifact** (just HTML, CSS, JS files produced by `vite build`) — it doesn't need a running Node.js process. Serving it from a CDN is faster, cheaper, and more reliable.

Separating concerns means:
- Frontend can be re-deployed independently (CSS change = no backend restart)
- Frontend is served from Vercel's global edge network (~30+ locations) — latency is ~10-50ms globally
- Backend only handles API traffic, not serving static assets

---

## `postinstall: "prisma generate"` in server/package.json

### Decision
Added a `postinstall` npm lifecycle script that runs `prisma generate` automatically after `npm install`.

### Engineering concept: npm lifecycle scripts
npm has built-in lifecycle hooks that run automatically at specific points:
- `preinstall` → before installing packages
- `postinstall` → **immediately after** `npm install` completes

`prisma generate` produces the TypeScript Prisma Client from `schema.prisma` into `src/generated/`. This file is in `.gitignore` — it's never committed. On a fresh server (like Railway), it doesn't exist. If the app starts without it, it crashes with `Cannot find module '../generated/prisma/client'`.

By using `postinstall`, Prisma Client is always regenerated after every `npm install`, on any machine, without any manual step.

---

## `start: "npx prisma migrate deploy && node dist/index.js"`

### Decision
Run `prisma migrate deploy` as part of the start command, before booting the server.

### Why not run migrations separately?
In production CI/CD, the deployment pipeline is: **install → build → start**. There's no separate "migration" step. By chaining `migrate deploy &&` before the server starts, migrations always run on every deploy — atomically. The `&&` operator ensures the server only starts if migrations succeed. If migration fails, the old server instance keeps running (Railway's restart policy) rather than starting a broken new one.

### `migrate deploy` vs `migrate dev`
- `migrate dev` — for local development. Creates new migrations, prompts interactively, resets DB if schema drift detected. **Never run in production.**
- `migrate deploy` — for production. Applies only pending migrations from `prisma/migrations/`. Non-interactive, safe, idempotent (skips already-applied migrations).

---

## CORS: `env.CORS_ORIGIN ?? '*'`

### Decision
CORS origin is controlled by an environment variable, defaulting to `'*'` when not set.

### What is CORS?
CORS (Cross-Origin Resource Sharing) is a browser security mechanism. When a Vue app on `https://myapp.vercel.app` makes a fetch/axios request to `https://myapi.railway.app`, the browser first sends a preflight `OPTIONS` request asking: "is this origin allowed?". The backend must respond with the correct `Access-Control-Allow-Origin` header or the browser blocks the response.

### Why `'*'` in development?
In local development there's no fixed origin — developers may use different ports, IPs, or tools like Postman. `'*'` (allow all) is safe here because it's not accessible from the internet.

### Why a specific origin in production?
`'*'` in production would allow any website on the internet to make authenticated API calls on behalf of your users. By setting `CORS_ORIGIN=https://your-app.vercel.app` on Railway, only that exact domain is allowed. This is the **principle of least privilege** applied to HTTP.

### Why an environment variable instead of hardcoding?
The Vercel URL isn't known until after deployment. Using an env var decouples the backend config from the frontend URL — you set it once in Railway's dashboard after Vercel gives you the URL.

---

## `VITE_API_BASE_URL` in client/src/api/tickets.ts

### Decision
```typescript
baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api'
```

### Why not hardcode the Railway URL?
The Railway URL is environment-specific. Hardcoding it would break local development (no Railway server running locally) and require a code change every time the backend URL changes.

### How Vite env vars work
Vite uses a build-time variable injection system. Variables prefixed with `VITE_` are replaced with their literal values at **build time** (not runtime). When Vercel builds the frontend, it reads `VITE_API_BASE_URL` from its environment variable settings and injects the value directly into the compiled JS bundle.

### The `?? '/api'` fallback
In local development, `VITE_API_BASE_URL` is not set, so `baseURL` falls back to `/api`. The Vite dev server's proxy config (`vite.config.ts`) intercepts `/api/*` requests and forwards them to `http://localhost:3000`. This means local development works with zero configuration.

In production, `VITE_API_BASE_URL=https://your-api.railway.app/api` is set in Vercel's dashboard — so requests go directly to Railway.

### Why not use the Vite proxy in production?
The Vite proxy is a **dev server feature** — it only runs during `npm run dev`. The production build is static HTML/CSS/JS with no server. There's nothing to proxy through.

---

## `client/vercel.json` — SPA Rewrites

### Decision
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### The problem: History Mode routing
Vue Router uses `createWebHistory` which produces clean URLs like `/tickets/123`. These URLs only exist in JavaScript — there's no actual file at `dist/tickets/123/index.html`. Vercel's CDN serves static files by path. When a user navigates directly to `https://myapp.vercel.app/tickets/123` or refreshes the page, Vercel looks for a file at that path, finds nothing, and returns a **404**.

### The fix: catch-all rewrite
The rewrite rule tells Vercel: "for any URL pattern, serve `index.html`". The browser loads `index.html`, Vue boots up, Vue Router reads the URL path, and renders the correct component. The 404 never happens.

### Why `version: 2`?
Vercel has two config schema versions. Version 2 is the current schema that supports `rewrites`, `redirects`, and `headers` as first-class fields. Version 1 used a different `routes` array syntax that is deprecated.

### `outputDirectory: "dist"`
Vite outputs the production build to `dist/` by default. Vercel needs to know this to serve the correct directory. Without it, Vercel would look in the wrong place.

### `framework: "vue"`
This tells Vercel which framework preset to use — it applies Vue-specific build optimizations and sets sensible defaults for asset caching headers.

---

## `railway.json` — Monorepo Build Config

### Decision
```json
{
  "build": { "buildCommand": "cd server && npm install && npm run build" },
  "deploy": { "startCommand": "cd server && npm start" }
}
```

### The problem: monorepo structure
Railway clones the entire repo root. Our repo has:
```
/
├── server/     ← what Railway needs to run
├── client/     ← irrelevant to Railway
├── package.json (root)
```
Without configuration, Railway would try to use the root `package.json` which has `concurrently` scripts for running both server and client — not what we want on the server.

### The fix: explicit build and start commands
By explicitly setting `buildCommand` to `cd server && ...`, Railway runs everything in the correct subdirectory. The `cd` is required because Railway runs commands from the repo root, not from `server/`.

### `restartPolicyType: "ON_FAILURE"` with 3 retries
This tells Railway to automatically restart the server process if it crashes (e.g., unhandled exception, OOM). Without this, a crash would take down the service permanently until manually restarted. 3 retries prevents an infinite restart loop if the failure is systematic (e.g., bad migration).

### Why NIXPACKS builder?
Railway's default builder, Nixpacks, auto-detects the language and installs the correct runtime (Node.js version from `package.json` `engines` field, or latest LTS). It's zero-config and handles the full build pipeline. The alternative is a custom Dockerfile — more control but more maintenance.

---

## Environment Variables Summary

| Variable | Where set | Purpose |
|---|---|---|
| `DATABASE_URL` | Railway dashboard | PostgreSQL connection string (auto-injected by Railway's Postgres plugin) |
| `GEMINI_API_KEY` | Railway dashboard | Google AI API key |
| `CORS_ORIGIN` | Railway dashboard | Set to your Vercel frontend URL after first deploy |
| `NODE_ENV` | Railway dashboard | Set to `production` |
| `VITE_API_BASE_URL` | Vercel dashboard | Set to your Railway backend URL + `/api` |

---

## Deployment Order

**Must deploy backend first** because:
1. Railway runs `prisma migrate deploy` — needs a live database
2. You need the Railway URL before you can set `VITE_API_BASE_URL` in Vercel
3. You need the Vercel URL before you can set `CORS_ORIGIN` in Railway

So the correct order is:
1. Deploy to Railway → get backend URL
2. Set `VITE_API_BASE_URL` in Vercel env vars
3. Deploy to Vercel → get frontend URL
4. Set `CORS_ORIGIN` in Railway env vars → redeploy Railway (or just save — Railway auto-redeploys on env var changes)
