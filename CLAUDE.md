# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

HotHost is a lightweight server/HTTP monitoring tool made of three independent pieces:

- `server/` — Node.js + Express backend (ESM, `"type": "module"`). Entry point: `server/src/index.js`.
- `server/frontend/` — React 18 + Vite + Tailwind SPA. Built output is served statically by the backend from `server/frontend/dist/`.
- `hothost-agent/` — Standalone Bash agent (`getinfo.sh`) packaged as a Docker image. It runs in a `while` loop, collects host metrics, and POSTs JSON to the server's `/api/data/:secret` and `/api/process/:secret` endpoints.

The published Docker images are `devforth/hothost-web` (server) and `devforth/hothost-agent` (agent).

## Development commands

Backend (from `server/`):
```bash
npm ci
npm start          # cross-env ENV=local nodemon src/index.js  — listens on :8007
npm test           # same as start, but with --inspect for the Node debugger
```

Frontend (from `server/frontend/`):
```bash
npm ci
npm run dev        # vite dev server on :5173, talks to backend :8007
npm run build      # produces server/frontend/dist/ which the backend serves
```

Default local admin credentials (only in `ENV=local`): `admin` / `123456` (see `server/src/env.js`).

Docker image builds: `server/build.sh` and `hothost-agent/build.sh` build and push to Docker Hub. The version is hardcoded at the top of each script — bump it there when releasing.

There is no test suite and no linter configured.

## Architecture notes

### Backend request flow (`server/src/index.js`)
1. `database.read()` — lowdb JSON file at `${DATA_PATH}/hothost.json` (`./data/` in local, `/var/lib/hothost/data/` in prod). Holds `users`, `monitoringData`, `httpMonitoringData`, `settings`, `pluginSettings`.
2. `PluginManager().loadPlugins()` — loads notification plugins (see below).
3. `startScheduler()` + periodic `calculateAsyncEvents` + `dbClearScheduler` from `utils.js` drive HTTP monitoring checks, offline detection, and alert debouncing.
4. Express app mounts:
   - `/api/` → `api.js` — **agent-facing** endpoints (`POST /data/:secret`, `POST /process/:secret`). These are unauthenticated; the `:secret` is the host's shared secret.
   - `/api/v2/` and `/v2/` → `apinext.js` — **admin/UI-facing** endpoints (hosts, HTTP monitors, settings, plugin config, auth). This is the large file (~1200 lines) where most UI-driven features live.
5. `authMiddleware` is applied globally; the agent routes under `/api/` bypass auth via path-based checks. When editing auth, check `middleware.js` and `mustBeAuthorizedView` in `utils.js`.
6. SPA fallback: any unmatched GET returns `frontend/dist/index.html`.

There are **two storage layers**, and both matter:
- **lowdb (`database.js`)** — durable configuration and current host state (JSON file).
- **LevelDB (`levelDB.js`)** — time-series process/RAM history used for the "top processes over last 2 days" view, keyed by host id via `db.sublevel(hostId, ...)`.

### Plugin system (`server/src/pluginManager.js`, `server/src/plugins/`)
- Each plugin is a standalone ESM `.js` file exporting a `default` object with `id`, `handleEvent({ eventType, data, settings })`, optional `sendMessage`, `onPluginEnabled`, etc. CommonJS `require` is not supported.
- Built-in plugins live in `server/src/plugins/`: `slack.js`, `telegram.js`, `email.js`, `gmail.js`. Use `slack.js` as the documented Hello-World reference.
- Third-party plugins are auto-loaded from `${DATA_PATH}/plugins/` at boot.
- Some plugins bundle Node modules via webpack — see `server/src/plugins/gmail.src/` for the pattern (source in `*.src/`, built output committed as the `.js` the loader consumes). `.src` directories are explicitly skipped by the loader.
- Events (e.g. `DISK_USED_ABOVE_THRESHOLD`, `HOST_IS_DOWN`, `SSL_EXPIRING`, HTTP monitor events, RSS items) are computed in `utils.js` (`calculateDataEvent`, `calculateAsyncEvents`) and dispatched via `PluginManager.handleEvents()`. Per-host enable/disable of plugins and events is respected there.
- RSS monitoring has its own queue (`rssQueue` + `processRssQueue`) so RSS notifications are rate-limited independently from alert events.

### Thresholds and per-host overrides
Global defaults (`RAM_THRESHOLD`, `DISK_THRESHOLD`, `DAYS_FOR_SSL_EXPIRED`, `HOURS_FOR_NEXT_ALERT`, stabilization counts, etc.) live in `database.data.settings` with defaults seeded in `database.js`. Per-host overrides are resolved via `getEffectiveSettingsForHost` in `utils.js` — prefer that helper rather than reading `database.data.settings` directly when evaluating a specific host.

### Agent ↔ server contract
`hothost-agent/getinfo.sh` builds two JSON payloads each interval:
- `JSON_DATA` → `POST /api/data/:secret` — host info (OS, CPU, RAM/disk totals + usage, public IP, etc.).
- `PROC_DATA` → `POST /api/process/:secret` — top-N processes by RSS plus restart flag.

The agent requires env vars `HOTHOST_SERVER_BASE`, `HOTHOST_AGENT_SECRET`, and optional `HOTHOST_MONITOR_INTERVAL` (default 60s). A custom static `pscommand` binary (see `hothost-agent/Dockerfile`) is used inside the container so `ps` reads `/host/proc` instead of the container's own `/proc`.

## Environment variables (server)

Required in `ENV=production`: `HOTHOST_WEB_ADMIN_USERNAME`, `HOTHOST_WEB_ADMIN_PASSWORD`. Optional: `HOTHOST_WEB_PORT` (default 8007), `HOTHOST_WEB_JWT_SECRET` (auto-generated and persisted to `/var/lib/hothost/jwt` if unset), `HOTHOST_WEB_PUBLIC_VIEW_ENABLED`, `HOTHOST_WEB_BASIC_PUBLIC_USERNAME`/`PASSWORD`. See `server/src/env.js` for the full list and local-mode defaults.

## Things to watch out for

- `api.js` endpoints are public-by-secret — never add logic there that assumes an authenticated session.
- When adding a new event type, wire it in **three** places: detection in `utils.js`, the plugin's `enabledEvents` metadata, and the UI config in `apinext.js` / frontend.
- Bundled plugins (`*.src/`) must be rebuilt manually; editing only the source won't change runtime behavior.
- Frontend dev server runs on `:5173` and CORS is hardcoded to that origin in `server/src/index.js` — changing the dev port requires updating the CORS config.
