# External Integrations

**Analysis Date:** 2026-06-07

## APIs & External Services

**HTTP API (this service):**
- REST-style routes on Hono — `GET /`, `GET/POST/PATCH/DELETE /users`, `GET /health` (`src/index.ts`)
- No third-party SaaS APIs, payment providers, or outbound HTTP clients in application `src/`

**Database drivers (via TypeORM):**
- PostgreSQL — `pg` package, URL form in `.env.example` / `.env.postgres`
- Microsoft SQL Server — `mssql` package (transitive Azure identity stack in `bun.lock`), connection string in `.env.mssql` and `docker-compose.yml`

## Data Storage

**Databases:**
- PostgreSQL 16 (Alpine image) — `docker-compose.yml` `postgres` service; credentials `POSTGRES_DB`/`USER`/`PASSWORD` align with sample `DATABASE_URL` in `.env.example`
- Microsoft SQL Server 2022 — `docker-compose.yml` `mssql` service; `MSSQL_SA_PASSWORD` and `TrustServerCertificate` for dev
- Connection: `DATABASE_URL` env var (`src/data-source.ts`, `src/dialect/helpers.ts` `getConnectionString()`)
- Client: TypeORM `DataSource` with `type` from `DB_TYPE` (`src/data-source.ts`); entities e.g. `User` in `src/entities/User.ts`
- MSSQL TLS: `extra: { trustServerCertificate: true }` when `DB_TYPE === "mssql"` (`src/data-source.ts`)

**File Storage:**
- Local filesystem only — no object storage SDKs or upload paths in `src/`

**Caching:**
- None — no Redis/Memcached or in-memory cache layer beyond TypeORM connection pool

## Authentication & Identity

**Auth Provider:**
- None for API consumers — routes in `src/index.ts` are unauthenticated
- Database auth only via connection strings (`DATABASE_URL`); MSSQL uses SQL login (`User Id=sa` in `.env.mssql` / `docker-compose.yml`)

## Monitoring & Observability

**Error Tracking:**
- None — no Sentry, OpenTelemetry, or similar in `package.json` or `src/`

**Logs:**
- `console.log` / `console.error` on startup and TypeORM `logging: true` in `src/data-source.ts`
- Docker `HEALTHCHECK` probes `http://127.0.0.1:3000/health` (`Dockerfile`)

## CI/CD & Deployment

**Hosting:**
- Local Docker Compose for DB and optional API (`docker-compose.yml`, `justfile` `docker-up`, `docker-up-mssql`)
- No cloud provider manifests (no `.github/workflows`, Kubernetes, or Terraform in repo)

**CI Pipeline:**
- None in repository — quality gates via local `prek` (`prek.toml`) and `just check` (`justfile`: typecheck + test)

## Environment Configuration

**Required env vars:**
- `DB_TYPE` — `postgres` or `mssql` (`src/data-source.ts`, `.env.example`)
- `DATABASE_URL` — database connection string (`src/data-source.ts`, `.env.example`, `.env.postgres`, `.env.mssql`)

**Optional env vars:**
- `API_PORT` — host port mapping for API containers (`docker-compose.yml`, default 3000)
- `NODE_ENV=production` — set in `Dockerfile`

**Secrets location:**
- Developer `.env` files (documented in `.env.example`; `.gitignore` excludes env files per project conventions)
- Compose-defined passwords for local Postgres/MSSQL (`docker-compose.yml`) — not suitable for production as-is

## Webhooks & Callbacks

**Incoming:**
- None — no webhook signature verification or dedicated callback routes beyond standard REST in `src/index.ts`

**Outgoing:**
- None — no scheduled jobs or HTTP callbacks to external systems in `src/`

---

*Integration audit: 2026-06-07*