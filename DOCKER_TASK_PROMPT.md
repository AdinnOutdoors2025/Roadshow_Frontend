# Docker Task Prompt (low-token, paste into a fresh Claude Code session)

```
Role: Senior DevOps engineer. Dockerize this full-stack repo safely. Teach setup in simple Tanglish after implementation.

STACK
- Frontend: Next.js 16 / React 19 / TS. Port 3000. Prod: npm run build && npm run start. Env: NEXT_PUBLIC_API_BASE (must end with "/", baked in at build time — browser-facing, use http://localhost:3001/ unless you prove all calls are server-only).
- Backend: Node 24 / Express 5 / Mongoose 8. Entry VehicleMain.js. Port 3001. No build step: npm start = node VehicleMain.js. DB: existing MongoDB Atlas (external, untouched).

PHASE 1 — ANALYZE ONLY, NO EDITS
Inspect both folders, both CLAUDE.md files, package.json, lockfiles, next.config.*, .gitignore, existing Docker files, upload/storage dirs, env var usage, CORS config, Linux case-sensitive import risks. Report: findings, proposed files, exact changes, risks/blockers, essential questions only. STOP and wait for my explicit approval before touching anything.

HARD RULES (never)
- Never change/expose/move the Mongo Atlas URI, DB, or collections.
- Never edit .env, never bake .env/secrets into images, never print secrets.
- Never git commit/stash/reset/checkout/delete/overwrite files.
- Never run DB migrations/seeds/writes/deletes.
- Never touch app features/API/auth/UI/business logic, unrelated formatting, or next.config.* (esp. output:"standalone") without separate flagged approval.
- Never install unneeded packages or run destructive docker commands (system prune, volume rm, etc).
- Minimal, regression-safe changes only; preserve all existing functionality.

PHASE 2 — AFTER MY APPROVAL
Backend: backend/Dockerfile + .dockerignore. Node24-slim, WORKDIR, npm ci from lockfile, no secrets baked, CMD node VehicleMain.js, EXPOSE 3001, keep upload dirs, non-root user only if it won't break uploads, healthcheck only if a real safe endpoint exists, don't alter the Atlas URL. Build/test backend alone first: container starts, port maps, Atlas connects (existing URI), a safe GET/health endpoint responds, logs clean, NO write/delete endpoints executed.

Frontend: frontend/Dockerfile + .dockerignore. Multi-stage, npm ci, npm run build, npm run start, EXPOSE 3000, small final image, zero code changes. Explain NEXT_PUBLIC_* is compile-time baked. Test only after backend passes: build succeeds, container starts, localhost:3000 loads, browser calls reach localhost:3001/, login/images/uploads/API/pages unaffected, CORS allows localhost:3000.

Root (only if structure supports it): docker-compose.yml, .env.docker.example (var names only, no values), DOCKER_SETUP_TANGLISH.md.
Compose: services backend+frontend only (no Mongo container), ports 3000:3000 / 3001:3001, env_file (no secret values in repo), restart: unless-stopped where sane, depends_on/healthcheck only if reliable, named volume only for genuinely persistent uploads, no source mounts in prod, no real creds anywhere.

DOCUMENTATION (DOCKER_SETUP_TANGLISH.md)
Beginner Tanglish covering: Docker/image/container/Dockerfile/.dockerignore/Compose basics, port mapping, build-time vs runtime env vars, why Atlas stays external, frontend↔backend comms, why frontend needs a browser-reachable API URL, volumes for uploads, logs/start/stop/restart.
Windows setup: check virtualization → enable WSL2 → install Docker Desktop (official site) → WSL2 backend → restart if needed → verify with `docker --version`, `docker compose version`, `docker run hello-world`.
Exact PowerShell commands (backend first, then frontend, then compose): build/run/logs/test/cleanup for backend; build (with API env/build-arg)/run/logs/test for frontend; compose build / up (fg & -d) / logs / ps / restart <svc> / down (no volume delete) / rebuild after code change / rebuild after NEXT_PUBLIC_* change.

VERIFICATION (safe/read-only only)
Dockerfile build validation, backend image build+start+health check, frontend build+image build, `docker compose config` validation, full-stack up, `docker compose ps`/logs, read-only smoke tests only. Report any pre-existing unrelated errors separately — don't silently fix them.

FINAL OUTPUT FORMAT
1. Files created  2. Files modified  3. Why each file exists  4. Backend commands  5. Frontend commands  6. Compose commands  7. Required env var NAMES only (no values)  8. Verification results (actual, not assumed)  9. Remaining warnings  10. Short Tanglish summary.
Do not claim success unless both images actually built and containers were actually verified running.
```
