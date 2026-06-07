# Technology Stack

**Analysis Date:** 2026-06-07

## Languages

**Primary:**
- TypeScript 5.6.x (`^5.6.2` in `package.json`) — all application code under `src/` (`src/index.ts`, `src/data-source.ts`, `src/entities/User.ts`, `src/repositories/UserRepository.ts`, `src/services/UserService.ts`, `src/dialect/helpers.ts`)

**Secondary:**
- TOML — `prek.toml` (pre-commit hook configuration)
- YAML — `docker-compose.yml` (local database and optional API services)
- Dockerfile — container image definition (`Dockerfile`)
- Justfile — task runner recipes (`justfile`)

## Runtime

**Environment:**
- Bun 1.x — dev, test, and production container runtime (`package.json` scripts use `bun run` / `bun test`; `Dockerfile` uses `oven/bun:1-alpine`; `devDependencies` include `@types/bun`)

**Package Manager:**
- Bun — lockfile present at `bun.lock` (`Dockerfile` runs `bun install --frozen-lockfile`)

## Frameworks

**Core:**
- Hono `^4.6.0` — HTTP API and routing (`src/index.ts`)
- `@hono/node-server` `^1.13.0` — Node-compatible server adapter for Hono (`src/index.ts` `serve()`)
- TypeORM `^0.3.21` — ORM, `DataSource`, entities (`src/data-source.ts`, `src/entities/User.ts`)

**Testing:**
- Bun built-in test runner — `bun test` / `test:postgres` / `test:mssql` in `package.json`; optional manual/pre-push hook in `prek.toml`

**Build/Dev:**
- TypeScript compiler (`tsc --noEmit`) — `package.json` `typecheck` script; options in `tsconfig.json` (`experimentalDecorators`, `emitDecoratorMetadata` for TypeORM)
- `bun build` — `package.json` `build` script (no separate bundler config file)
- prek — git hooks (`prek.toml`; `justfile` `prek-install`, `prek`)
- just — command shortcuts (`justfile`)
- Docker Compose — PostgreSQL/MSSQL and optional API profiles (`docker-compose.yml`)

## Key Dependencies

**Critical:**
- `typeorm` `^0.3.21` — database abstraction and entity mapping (`src/data-source.ts`)
- `reflect-metadata` `^0.2.2` — required for TypeORM decorators (imported first in `src/data-source.ts`)
- `pg` `^8.13.1` — PostgreSQL driver (used when `DB_TYPE=postgres` in `src/data-source.ts`)
- `mssql` `^11.0.1` — Microsoft SQL Server driver (used when `DB_TYPE=mssql` in `src/data-source.ts`)
- `hono` / `@hono/node-server` — HTTP layer (`src/index.ts`)
- `dotenv` `^16.4.5` — listed in `package.json` for env loading; runtime reads `process.env` in `src/data-source.ts` and `src/dialect/helpers.ts` (no direct `dotenv` import in `src/`)

**Infrastructure:**
- `postgres:16-alpine` — local PostgreSQL (`docker-compose.yml` `postgres` service)
- `mcr.microsoft.com/mssql/server:2022-latest` — local MSSQL (`docker-compose.yml` `mssql` service)

## Configuration

**Environment:**
- Process environment variables: `DB_TYPE` (`postgres` | `mssql`, default `postgres` in `src/data-source.ts`), `DATABASE_URL` (connection string in `src/data-source.ts`)
- Example and profile files: `.env.example`, `.env.postgres`, `.env.mssql`
- Docker API services set `DB_TYPE` and `DATABASE_URL` inline (`docker-compose.yml` `api`, `api-mssql`)
- Optional host port override: `API_PORT` for mapped API port (`docker-compose.yml`)

**Build:**
- `tsconfig.json` — `target` ES2022, `module` ESNext, `strict`, decorator metadata
- `package.json` — ESM (`"type": "module"`), scripts for dev/test per database
- `Dockerfile` — multi-stage-style single stage: install, copy `src`, `CMD` `bun run src/index.ts`, `HEALTHCHECK` against `/health`
- `prek.toml` — trailing whitespace, EOF, YAML checks; local `typecheck` and manual `test` hooks

## Platform Requirements

**Development:**
- Bun installed locally (`AGENTS.md`, `package.json` scripts)
- Docker (optional) for databases via `docker compose up -d` (`docker-compose.yml`, `justfile` `db-up`)
- TypeORM `synchronize: true` in `src/data-source.ts` (schema auto-sync; no migration tooling in repo)

**Production:**
- Container image built from `Dockerfile` (`oven/bun:1-alpine`), exposes port 3000
- Compose profiles `app` (PostgreSQL) or `app-mssql` (MSSQL) for full stack (`docker-compose.yml`)
- Application listens on port 3000 hardcoded in `src/index.ts` (`serve({ fetch: app.fetch, port: 3000 })`)

---

*Stack analysis: 2026-06-07*