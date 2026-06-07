# Codebase Structure

**Analysis Date:** 2026-06-07

## Directory Layout

```
typeorm-mssql-postgres-demo/
├── src/                    # Application source (TypeScript, ESM)
│   ├── __tests__/          # Bun test specs
│   ├── dialect/            # DB-type helpers (not full providers)
│   ├── entities/           # TypeORM entity definitions
│   ├── repositories/       # Data access
│   ├── services/           # Business logic
│   ├── data-source.ts      # TypeORM DataSource
│   └── index.ts            # Hono app + server entry
├── docs/                   # Product/planning notes (not runtime)
├── .planning/codebase/     # Codebase analysis artifacts
├── docker-compose.yml      # Postgres, MSSQL, optional API profiles
├── Dockerfile              # Container image for API services
├── package.json            # Bun scripts and dependencies
├── tsconfig.json           # TS + decorator settings
├── README.md               # Setup, API table, architecture summary
├── AGENTS.md               # Agent-oriented project notes
└── .env.example / presets  # DB_TYPE, DATABASE_URL (not committed secrets)
```

## Directory Purposes

**`src/`:**
- Purpose: All runtime application code
- Contains: Layered TS modules (entity → repository → service → HTTP)
- Key files: `index.ts`, `data-source.ts`, `entities/User.ts`, `repositories/UserRepository.ts`, `services/UserService.ts`, `dialect/helpers.ts`

**`src/entities/`:**
- Purpose: Database-agnostic ORM models
- Contains: One entity per file, decorator-based
- Key files: `User.ts`

**`src/repositories/`:**
- Purpose: TypeORM repository wrappers per aggregate/table
- Contains: Class with async CRUD methods
- Key files: `UserRepository.ts`

**`src/services/`:**
- Purpose: Rules that should not live in HTTP or SQL layer
- Contains: Service classes composing repositories
- Key files: `UserService.ts`

**`src/dialect/`:**
- Purpose: Small DB-specific helpers when SQL or formatting differs
- Contains: Env-based checks and string helpers
- Key files: `helpers.ts`

**`src/__tests__/`:**
- Purpose: Integration-style tests against real DB
- Contains: `describe`/`it` blocks using Bun test API
- Key files: `UserService.test.ts`

**`docs/`:**
- Purpose: Forward-looking PRD (LinkShare); independent of current User API demo
- Contains: Markdown PRD
- Key files: `PRD_LINKSHARE.md`

## Key File Locations

**Entry Points:**
- `src/index.ts`: HTTP server and route registration
- `src/data-source.ts`: Imported first for ORM config (`reflect-metadata` in data-source)

**Configuration:**
- `package.json`: `dev`, `dev:postgres`, `dev:mssql`, `test:*`, dependencies
- `tsconfig.json`: `experimentalDecorators`, `emitDecoratorMetadata`, strict mode
- `.env` / `.env.postgres` / `.env.mssql`: `DB_TYPE`, `DATABASE_URL` (see `README.md`)
- `docker-compose.yml`: DB ports, healthchecks, `app` / `app-mssql` profiles

**Core Logic:**
- `src/services/UserService.ts`: User domain operations
- `src/repositories/UserRepository.ts`: Persistence for `User`
- `src/entities/User.ts`: Schema mapping

**Testing:**
- `src/__tests__/UserService.test.ts`: Full CRUD + duplicate email contract

## Naming Conventions

**Files:**
- PascalCase for domain types: `User.ts`, `UserRepository.ts`, `UserService.ts`
- kebab-case not used in `src/`; root config uses conventional names (`data-source.ts`, `docker-compose.yml`)
- Tests: `*.test.ts` beside or under `__tests__/`

**Directories:**
- Plural layer folders: `entities/`, `repositories/`, `services/`
- Singular feature subdirs not used yet (flat one-file-per-layer for User)

**Classes:**
- Match file name: `User`, `UserRepository`, `UserService`

## Where to Add New Code

**New Feature (e.g. another resource):**
- Primary code: `src/entities/<Name>.ts`, `src/repositories/<Name>Repository.ts`, `src/services/<Name>Service.ts`, routes in `src/index.ts`
- Tests: `src/__tests__/<Name>Service.test.ts`
- Register entity in `src/data-source.ts` `entities` array

**New Component/Module:**
- Implementation: Same layered paths under `src/`; avoid `providers/mssql` vs `providers/pg` duplication per `README.md` principle

**Utilities:**
- Shared helpers: `src/dialect/helpers.ts` for DB-specific SQL/formatting only when TypeORM cannot abstract it
- Cross-cutting HTTP middleware: add in `src/index.ts` or future `src/middleware/` if the app grows

## Special Directories

**`node_modules/`:**
- Purpose: Installed dependencies
- Generated: Yes (package manager)
- Committed: No

**`dist/`:**
- Purpose: `tsc` / build output (`outDir` in `tsconfig.json`)
- Generated: Yes when building
- Committed: Typically no

**`.planning/codebase/`:**
- Purpose: Architecture and structure documentation for tooling/planning
- Generated: By analysis agents
- Committed: Project-dependent

**Docker volumes (`postgres-data`, `mssql-data`):**
- Purpose: Persistent DB data in Compose
- Generated: Yes at runtime
- Committed: No

---

*Structure analysis: 2026-06-07*