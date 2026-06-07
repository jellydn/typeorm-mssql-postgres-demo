# AGENTS.md

## Project Overview

TypeORM demo with PostgreSQL/MSSQL support using Bun + Hono. Demonstrates single codebase portability across databases without duplicating providers.

## Commands

- `bun run dev` — start dev server (defaults to postgres)
- `bun run dev:postgres` — start with PostgreSQL
- `bun run dev:mssql` — start with MSSQL
- `bun run build` — build with bun
- `bun run test` — run tests (uses current DB_TYPE)
- `bun run test:postgres` — run tests against PostgreSQL
- `bun run test:mssql` — run tests against MSSQL

## Setup

1. Copy `.env.example` to `.env` or use `.env.postgres` / `.env.mssql`
2. Start database: `docker compose up -d`
3. Run: `bun run dev`

## Key Facts

- **Runtime**: Bun (not Node) — use `bun` commands, not `npm`
- **ESM only**: `"type": "module"` in package.json
- **TypeORM decorators required**: `experimentalDecorators` and `emitDecoratorMetadata` enabled in tsconfig
- **Auto-sync**: `synchronize: true` in data-source.ts creates tables automatically
- **Database switch**: Set `DB_TYPE=postgres` or `DB_TYPE=mssql` in `.env`
- **Port**: 3000 (hardcoded in src/index.ts)

## Architecture

```
src/
├── entities/          — TypeORM entities (shared across databases)
│   └── User.ts
├── repositories/      — Data access layer (shared across databases)
│   └── UserRepository.ts
├── services/          — Business logic layer
│   └── UserService.ts
├── dialect/           — Database-specific helpers (if needed)
│   └── helpers.ts
├── data-source.ts     — TypeORM DataSource config
└── index.ts           — Hono routes + server startup
```

## Gotchas

- TypeORM `reflect-metadata` import required before any entity usage
- MSSQL requires `trustServerCertificate: true` (handled in data-source.ts)
- No migration system — relies on synchronize for schema changes
- For database-specific SQL, use helpers in `src/dialect/helpers.ts`
- Contract tests run same tests against both databases

## Testing

Tests are in `src/__tests__/` and use bun's built-in test runner. Run against specific database with `bun run test:postgres` or `bun run test:mssql`.
