# Codebase Concerns

**Analysis Date:** 2026-06-07

## Tech Debt

**Schema management (TypeORM synchronize):**
- Issue: `synchronize: true` auto-applies entity changes to the live database; no versioned migrations exist.
- Files: `src/data-source.ts`, `AGENTS.md`
- Impact: Production deploys can drop/alter columns unpredictably; no rollback path; multi-instance startups risk race conditions on DDL.
- Fix approach: Add TypeORM migrations (or equivalent), set `synchronize: false` outside local dev, document migration run in CI/CD.

**Environment loading:**
- Issue: `dotenv` is a dependency but no `import "dotenv/config"` (or equivalent) in application entry; local dev relies on shell-exported vars or Bun auto-loading `.env` behavior.
- Files: `package.json`, `src/index.ts`, `src/data-source.ts`
- Impact: Confusing “works on my machine” failures when `DATABASE_URL` is unset; Docker path works because compose injects env.
- Fix approach: Explicitly load `.env` in `src/index.ts` before `AppDataSource.initialize()`; document required vars in README.

**Duplicate email enforcement:**
- Issue: Uniqueness is enforced only in `UserService.createUser` via a read-then-insert; `User.email` has no DB unique constraint/index.
- Files: `src/entities/User.ts`, `src/services/UserService.ts`
- Impact: Race conditions can create duplicate emails; behavior may differ between Postgres and MSSQL under concurrency.
- Fix approach: `@Column({ unique: true })` on `email` plus migration; handle DB constraint errors in API layer.

**Dialect helpers unused in data path:**
- Issue: `formatDate` / `getLimitClause` in `src/dialect/helpers.ts` are not used by repositories or routes; portability story is mostly theoretical today.
- Files: `src/dialect/helpers.ts`
- Impact: Future raw SQL may diverge silently; dead code obscures real portability gaps.
- Fix approach: Use helpers where needed or remove until required; add contract tests if raw SQL is introduced.

## Known Bugs

**Invalid `PATCH /users/:id` input:**
- Symptoms: `parseInt` on non-numeric `:id` yields `NaN`; update may no-op or behave inconsistently without a clear 400 response.
- Files: `src/index.ts`
- Trigger: `PATCH /users/not-a-number` with JSON body.
- Workaround: None documented; clients must send numeric ids.

**Unvalidated `POST /users` body:**
- Symptoms: Missing or non-string `email` can persist empty/undefined values depending on TypeORM coercion; no structured validation errors.
- Files: `src/index.ts`, `src/services/UserService.ts`
- Trigger: `POST /users` with `{}` or `{ "email": null }`.
- Workaround: Application-level duplicate check only when `email` is truthy.

## Security Considerations

**Hardcoded credentials in Docker Compose:**
- Risk: Postgres (`user`/`pass`) and MSSQL SA password (`YourStrongPass123`) are committed in plain text; healthcheck embeds SA password.
- Files: `docker-compose.yml`
- Current mitigation: Intended for local/demo only; not suitable for shared or production networks.
- Recommendations: Use `.env` / Docker secrets for compose; never expose MSSQL/Postgres ports publicly in prod; rotate defaults in docs.

**No authentication or authorization:**
- Risk: All user CRUD and list endpoints are public; anyone with network access can read/modify data.
- Files: `src/index.ts`
- Current mitigation: None.
- Recommendations: Add auth middleware, rate limiting, and TLS termination before any non-demo deployment.

**MSSQL `trustServerCertificate: true`:**
- Risk: Disables strict TLS certificate validation for SQL Server connections.
- Files: `src/data-source.ts`, `docker-compose.yml` (connection string)
- Current mitigation: Acceptable for local Docker demo.
- Recommendations: Use proper CA-signed certs and set `trustServerCertificate: false` in production.

**Error message leakage:**
- Risk: `POST /users` returns raw `(error as Error).message` to clients (e.g. internal duplicate message).
- Files: `src/index.ts`
- Current mitigation: Limited surface area in demo.
- Recommendations: Map known errors to stable API codes; log details server-side only.

## Performance Bottlenecks

**TypeORM SQL logging always on:**
- Problem: `logging: true` emits all queries regardless of environment.
- Files: `src/data-source.ts`
- Cause: No `NODE_ENV` or env-flag guard.
- Improvement path: `logging: process.env.NODE_ENV !== "production"` or explicit `DB_LOGGING=true` for debug.

**Unbounded `GET /users`:**
- Problem: `findAll()` loads entire `user` table with no pagination.
- Files: `src/repositories/UserRepository.ts`, `src/index.ts`
- Cause: Demo API simplicity.
- Improvement path: Pagination query params; use `getLimitClause` if raw SQL is added.

## Fragile Areas

**Application startup / DB coupling:**
- Files: `src/index.ts`, `src/data-source.ts`
- Why fragile: Server only starts after `AppDataSource.initialize()` succeeds; no graceful shutdown hook; port `3000` is hardcoded.
- Safe modification: Add retry/backoff for DB readiness; read `PORT` from env; register `SIGTERM` to destroy DataSource.
- Test coverage: No HTTP/integration tests; startup failure paths untested.

**Shared `AppDataSource` singleton in tests:**
- Files: `src/__tests__/UserService.test.ts`, `src/data-source.ts`
- Why fragile: Tests require a live database matching `DB_TYPE` / `DATABASE_URL`; `afterEach` deletes all users but assumes exclusive DB use; parallel test runs could clash.
- Safe modification: Dedicated test database URL; transactions per test; or testcontainers.
- Test coverage: Service layer only; routes and repository edge cases not covered.

**Lazy repository initialization:**
- Files: `src/repositories/UserRepository.ts`, `src/services/UserService.ts`
- Why fragile: `getRepository` before `initialize()` throws; order of imports and first request matters.
- Safe modification: Inject repository after DataSource is ready; fail fast in composition root.
- Test coverage: Covered indirectly via `beforeAll` initialize.

## Scaling Limits

**Single-process Hono server:**
- Current capacity: One Bun process, one DB connection pool (TypeORM defaults).
- Limit: No horizontal scaling story, no sticky session needs (stateless API) but DB becomes sole bottleneck.
- Scaling path: Container orchestration with health checks (`/health` exists); externalize DB; disable synchronize; connection pool tuning.

**Demo entity model:**
- Current capacity: Single `User` table, no relations.
- Limit: Real apps need migrations, indexes, and dialect-specific types.
- Scaling path: Expand entities with migrations and cross-DB contract tests (`test:postgres` / `test:mssql` scripts already exist).

## Dependencies at Risk

**`@hono/node-server` on Bun runtime:**
- Risk: Project uses Bun (`bun run`, `oven/bun` Docker image) but imports Node adapter for Hono; adapter mismatch or subtle runtime differences possible.
- Impact: Subtle HTTP/server bugs on upgrade.
- Migration plan: Evaluate `Bun.serve` with `app.fetch` or official Bun guidance for Hono.

**TypeORM 0.3.x dual drivers (`pg` + `mssql`):**
- Risk: Two database stacks to security-patch and behavior-test; TypeORM breaking changes affect both.
- Impact: Contract tests must run on both DBs in CI or regressions slip through.
- Migration plan: Keep `test:postgres` and `test:mssql` in CI matrix; pin versions in `bun.lock`.

## Missing Critical Features

**Migration system:**
- Problem: No `migrations` folder, no `migration:run` scripts, documented in `AGENTS.md` as intentional gap.
- Blocks: Safe production schema evolution and reproducible environments.

**Input validation layer:**
- Problem: No zod/valibot or Hono validator on routes; `Partial<User>` accepts arbitrary fields on create/update.
- Blocks: Stable API contracts and protection against mass-assignment style updates.

**Deployment documentation:**
- Problem: No `DEPLOY.md` in repo; Docker profiles exist but production checklist (secrets, synchronize, logging) is not centralized.
- Blocks: Consistent handoff from demo to deployable service.

## Test Coverage Gaps

**HTTP API / Hono routes:**
- What's not tested: Status codes, JSON shapes, `404` paths, malformed ids, CORS (if added).
- Files: `src/index.ts`
- Risk: Route regressions ship while service tests pass.
- Priority: High

**Repository layer in isolation:**
- What's not tested: `delete` affected-count edge cases, `update` with missing row.
- Files: `src/repositories/UserRepository.ts`
- Risk: Silent behavior changes on TypeORM upgrade.
- Priority: Medium

**Cross-database contract beyond UserService:**
- What's not tested: Only `UserService.test.ts` runs per DB; no automated CI evidence in repo for both engines on every change.
- Files: `src/__tests__/UserService.test.ts`, `package.json`
- Risk: MSSQL-specific failures discovered late.
- Priority: High for portability goal

**Production configuration:**
- What's not tested: `logging: false`, `synchronize: false`, env-based `DB_TYPE` switching in Docker `api` / `api-mssql` profiles.
- Files: `src/data-source.ts`, `Dockerfile`, `docker-compose.yml`
- Risk: Production image runs with dev-grade DB settings.
- Priority: High

---

*Concerns audit: 2026-06-07*