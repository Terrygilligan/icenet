# IceNet — Session Handover

**Date:** 2026-09-29
**Session scope:** Repo setup, local dev verification, full-app light-theme refactor, Firebase Hosting deploy, GitHub push.

---

## 1. Repository

- Cloned `https://github.com/Terrygilligan/icenet` into `C:\Users\terry\icenet`.
- Branch: `jules-16552742498682091326-a66f93b3` (the repo's only/default branch).
- Latest commit: `a7297e4` — *"feat: Migrate UI to light-mode design system and add Firebase Hosting config"* (pushed to GitHub).

## 2. App architecture (as it actually runs)

- `server/index.js` (entry via `npm start`) is **fully in-memory** — routes use `server/data/db.js` and `server/events/eventBus.js` (a plain Node `EventEmitter`).
- `docker-compose.yml` (Postgres 15 + GCP PubSub emulator) and `server/src/` (TypeScript + Prisma + `@google-cloud/pubsub`) are an **alternate, unused implementation** — nothing in `index.js` imports them. No DB, emulator, or `.env` is required for local dev.
- Client fetches are hardcoded to `http://localhost:5000/api/...` (see Known Issues).

## 3. Local dev — verified working

```bash
npm run start:server   # API on http://localhost:5000  (/api/health -> ok)
npm run start:client   # Vite on http://localhost:5173
```

Environment quirks on this machine:

- Shell is **WSL 2**, but Node is only installed on Windows (`node.exe` v23.11.0 via `/mnt/c/Program Files/nodejs`). WSL `node` is not on PATH; `npm`/`npx` shims work through Windows interop.
- Servers bind to the **Windows** network stack — use `curl.exe` / a browser, not WSL `curl`, to reach `localhost`.
- `docker` is not available in this WSL distro (Docker Desktop WSL integration disabled) — irrelevant anyway since the running app needs no Docker.

## 4. Light-theme refactor (Stitch spec)

Applied a clean light-mode design system across the entire app:

- **Tokens:** bg `#F8FAFC`, white cards + `border-slate-200` + `shadow-sm`, text `slate-900/600/500`, accent ice blue `#00A8E8`, status mint `emerald-500/600`, warnings `amber-50/200/900`.
- **`client/src/index.css`** — body bg `#020617` → `#F8FAFC`, default text color `#0F172A`.
- **`client/src/components/Header.jsx`** — white header, `bg-[#00A8E8]` brand mark, `sky-50` badges, light role-switcher pills (active = ice blue).
- **`AdminDashboard.jsx`** — `sky-50` control-center banner, 4 white KPI cards, light telemetry panel + progress bars, `amber-50` provider-approval alert, light providers table + zones cards, white Add-Zone modal with sky focus rings.
- **`ProviderDashboard.jsx`** — sky-50 banner, white dispatch/route/fleet cards, light status pills, light status stepper (`sky-50` current / `emerald-50` done), white Add-Vehicle modal.
- **`MerchantDashboard.jsx`** — emerald-50 banner, white order wizard, `sky-50` selected temp-tier cards, light price-quote bar, light billing table.
- **`Login.jsx`** — light login card, white inputs, ice-blue sign-in button.

## 5. Admin refinements

- KPI stat values standardized to `text-2xl font-bold text-slate-900` (Telemetry was `text-lg text-emerald-600`).
- Zone cards: `hover:shadow-md hover:border-sky-300 transition-all cursor-pointer`.
- Zone cards: static `15% Peak Solar Discount Active` pill (`bg-emerald-50 text-emerald-700 border-emerald-200`) — **not yet data-driven**.

## 6. Build & deploy

- `cd client && npm run build` — clean (dist: 337 KB JS / 28.5 KB CSS).
- **Firebase Hosting:** live at **https://icenet-bulgaria.web.app** (HTTP 200 verified). New files: `firebase.json` (public dir `client/dist`, SPA rewrite → `/index.html`) and `.firebaserc` (project `icenet-bulgaria`). `.firebase/` added to `.gitignore`.
- **GitHub:** pushed via Windows-side `gh.exe` token (`C:\Program Files\GitHub CLI\gh.exe` is authenticated as `Terrygilligan`). WSL git has **no credential helper**, so plain `git push` hangs on an interactive prompt — reuse this pattern:
  ```bash
  /mnt/c/Program\ Files/GitHub\ CLI/gh.exe auth token > /tmp/gh_tok.txt
  git push "https://x-access-token:$(tr -d '\r\n' < /tmp/gh_tok.txt)@github.com/Terrygilligan/icenet.git" HEAD
  rm /tmp/gh_tok.txt
  ```
- Verification: `npm run lint` (oxlint) → 0 errors, 29 pre-existing warnings (unused imports/vars).

## 7. Deferred: GCP account cleanup (planned, NOT started)

Goal: consolidate the many "Firebase Payment" billing accounts and unused projects under `consolegames2010@hotmail.com`. User wants to reopen/keep a couple of projects — get their keep-list before deleting anything.

Plan:
1. Inventory: `gcloud projects list --format=table(projectId,name,lifecycleState)` + `gcloud billing accounts list`; map projects → billing account via `gcloud billing projects describe <id>`; flag projects with active resources.
2. Confirm keep-list with Terry (must keep `icenet-bulgaria`).
3. Delete unwanted projects: `gcloud projects delete <id>` (30-day soft delete, recoverable via `gcloud projects undelete`).
4. Close redundant billing accounts: `gcloud billing accounts close <id>` — CLOSED accounts can only be reopened via the console UI, not gcloud.
5. Never bulk-delete without explicit confirmation.

## 8. Known issues / next steps

- **Live site is non-functional for data** — client hardcodes `http://localhost:5000`. To fix: parameterize the API base URL (e.g. `import.meta.env.VITE_API_URL`) and deploy `server/` (Cloud Run is natural — `server/Dockerfile` already exists), then rebuild + redeploy.
- `loginAsDemoRole`/`ProtectedRoute` guard `/admin`, `/provider`, `/merchant` — must log in via `/login` first (demo role buttons provided).
- Solar discount badge is static; wire to a zone field if it should be conditional.
- `git` user.name/user.email are unset in WSL — the commit used `-c` flags with `Terrygilligan@users.noreply.github.com`.
