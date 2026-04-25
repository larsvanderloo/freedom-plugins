---
description: Pre-deploy audit + deploy flow for a web app. Audits env vars, secrets, build config, database migrations, error tracking; checks that the target (Vercel / Fly / Railway / self-hosted) is correctly configured; produces a go/no-go checklist. Then runs the actual deploy. Use when shipping to production. Not for local dev.
---

# Deploy

Production deploys break in specific ways — missing env var, forgotten migration, a dev-only config leaking through, secrets in code. This skill runs the checks before the deploy, then deploys.

## Pre-flight audit

```markdown
# Pre-deploy audit — <app> v<version>

## Environment
- [ ] `.env.example` up to date with all required vars
- [ ] Production env has all required vars set (verified via target's dashboard)
- [ ] No dev-only env vars leaking (e.g., `VITE_DEBUG_MODE=true`)
- [ ] Secrets are set via target's secret store, NOT in code or committed .env files

## Database
- [ ] Latest migration runs on a staging/preview DB first
- [ ] Migration is reversible OR explicit "not reversible" is documented
- [ ] Production DB backed up immediately before migration
- [ ] Migration runner runs as part of deploy (or manually before)
- [ ] No `DROP` / `TRUNCATE` in the migration without explicit user confirmation

## Build
- [ ] Production build succeeds (`pnpm build` / equivalent)
- [ ] Bundle size hasn't regressed >10% (Vite / Next.js bundle analyser check)
- [ ] No `console.log` in production bundle (build should strip)
- [ ] Source maps: either included (for error tracking) or excluded (to not leak code)

## Secrets
- [ ] No API keys / tokens / DB URIs committed to git (verify: `git grep -iE 'sk_|api_key=|postgres://'`)
- [ ] OAuth client secrets set in target's secret store
- [ ] JWT signing key rotated if this is a major version or security-sensitive

## Observability
- [ ] Error tracking (Sentry / equivalent) configured with production DSN
- [ ] Logs go somewhere persistent (target's native logs OR a log aggregator)
- [ ] Healthcheck endpoint responds correctly
- [ ] Uptime monitor (UptimeRobot / BetterStack / Pingdom) configured against healthcheck

## Auth
- [ ] Session timeout configured for production (not dev's 7-day)
- [ ] CORS origins production-only (no localhost leak)
- [ ] CSP headers set if serving a frontend
- [ ] Cookie settings: `Secure`, `HttpOnly`, `SameSite` set appropriately

## Performance
- [ ] DB connection pool size configured for target concurrency
- [ ] Rate limiting enabled on public endpoints
- [ ] Caching headers on static assets (CDN cache, browser cache)
- [ ] Large dependencies are `lazy-loaded` if not needed on first page

## Rollback plan
- [ ] Previous tag is known and deployable
- [ ] Rollback procedure documented (`target rollback v<prev>` or manual steps)
- [ ] Time-to-rollback < 5 minutes
```

## Deploy targets

### Vercel
- `vercel --prod` after audit passes
- Env vars via Vercel dashboard or `vercel env add`
- Preview deploys for every PR; production deploy for `main` push
- Automatic rollback via Vercel dashboard

### Fly.io
- `fly deploy` runs the build + deploy
- Env vars via `fly secrets set`
- DB migrations run in a release command: `fly.toml: [deploy] release_command = "pnpm db:migrate"`
- Rollback: `fly releases rollback`

### Railway
- `railway up` from CLI, or auto-deploy on push
- Env vars via dashboard or `railway variables set`
- Similar release-command pattern for migrations

### Self-hosted / VPS
- Build locally or in CI
- `scp` / `rsync` artefacts, or Docker image via registry
- Migration runs as part of deploy script
- Rollback = keep the previous build directory, swap a symlink

## Deploy flow

1. Run the pre-flight audit. User reviews. Any unchecked BLOCKER items → abort.
2. Run tests one more time.
3. Tag the git commit: `git tag -a v<x.y.z> -m "<CHANGELOG headline>"`
4. Deploy to target.
5. Verify: hit the production URL's healthcheck. Hit a known-working page. Sign in as a real user.
6. Monitor error rate for the next 10 minutes. Revert if error rate spikes.
7. Post-deploy: update CHANGELOG with deploy timestamp + target URL.

## If something goes wrong

Invoke `/studio:rollback-release` — this is exactly what it's for. A failed deploy becomes a numbered rollback release, not a silent `git revert`.

## Anti-patterns

- ❌ Skipping the audit "just this once"
- ❌ Running migration in production before testing on staging
- ❌ Deploying without a rollback plan
- ❌ Pushing secrets to code to "test quickly" — they end up in git history
- ❌ Deploying on a Friday at 5pm (unless it's a hotfix with a known-safe change)
