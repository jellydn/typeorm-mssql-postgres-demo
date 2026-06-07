# Architecture

**Analysis Date:** 2026-06-07

## Pattern Overview

**Overall:** Layered monolith with database portability (single codebase, runtime driver selection)

**Key Characteristics:**
- HTTP API (Hono) sits above a thin service → repository → TypeORM stack
- Domain entities and data access are shared; no per-database provider modules
- `DB_TYPE` and `DATABASE_URL` choose PostgreSQL or MSSQL at runtime
- Schema managed via TypeORM `synchronize: true` (no migration pipeline in this demo)

## Layers

**HTTP / routing:**
- Purpose: Expose REST-style user endpoints and health checks
- Location: `src/index.ts`
- Contains: Hono app, route handlers, server bootstrap after DB init
- Depends on: `UserService`, `AppDataSource`, `getDatabaseType` from `src/dialect/helpers.ts`
- Used by: Clients, Docker `api` / `api-mssql` services

**Service:**
- Purpose: Business rules (e.g. duplicate email on create)
- Location: `src/services/`
- Contains: `UserService` delegating to repository
- Depends on: `UserRepository`, `User` entity type
- Used by: `src/index.ts`, `src/__tests__/UserService.test.ts`

**Repository:**
- Purpose: CRUD and queries against `User` via TypeORM
- Location: `src/repositories/`
- Contains: `UserRepository` with lazy `getRepository(User)` singleton
- Depends on: `AppDataSource`, `src/entities/User.ts`
- Used by: `UserService`

**Persistence / ORM:**
- Purpose: Connection, entity mapping, SQL generation per driver
- Location: `src/data-source.ts`, `src/entities/`
- Contains: `AppDataSource` config, `User` entity decorators
- Depends on: `reflect-metadata`, `typeorm`, env vars, `pg` / `mssql` drivers
- Used by: Repositories, tests (`beforeAll` initialize)

**Dialect helpers:**
- Purpose: Optional DB-specific utilities without duplicating domain layers
- Location: `src/dialect/helpers.ts`
- Contains: `isPostgres`, `isMssql`, `getDatabaseType`, `formatDate`, `getLimitClause`
- Depends on: `process.env.DB_TYPE`
- Used by: `src/index.ts` (`/health`); available for raw SQL or formatting when needed

## Data Flow

**Create user (POST `/users`):**
1. Hono parses JSON body in `src/index.ts`
2. `UserService.createUser` checks email uniqueness via repository
3. `UserRepository.create` → `save` through TypeORM
4. Driver (`postgres` or `mssql`) executes INSERT; JSON response returned

**Read user by email (GET `/users/:email`):**
1. Route param passed to `UserService.getUserByEmail`
2. `UserRepository.findByEmail` → `findOneBy({ email })`
3. 404 JSON if null, else entity serialized to JSON

**Application startup:**
1. `src/index.ts` loads; `AppDataSource.initialize()` from `src/data-source.ts`
2. On success, `@hono/node-server` `serve` binds port 3000
3. Failure logs to `console.error` (process may exit without explicit handler)

**State Management:**
- No in-memory app state for users; persistence is entirely in the database
- Lazy singletons for TypeORM repository (`UserRepository`) and service repo instance (`UserService` internal `getRepo`)
- Connection lifecycle: initialize at server start; tests call `destroy` in `afterAll`

## Key Abstractions

**`User` entity:**
- Purpose: Portable table mapping for both databases
- Examples: `src/entities/User.ts`
- Pattern: TypeORM `@Entity`, `@PrimaryGeneratedColumn`, `@Column`

**`AppDataSource`:**
- Purpose: Single TypeORM entry for connection and entity registration
- Examples: `src/data-source.ts`
- Pattern: Factory via `new DataSource({ type, url, entities, synchronize, extra })`

**`UserRepository` / `UserService`:**
- Purpose: Separate data access from HTTP and business rules
- Examples: `src/repositories/UserRepository.ts`, `src/services/UserService.ts`
- Pattern: Class-based layers with lazy initialization of dependencies

## Entry Points

**HTTP server:**
- Location: `src/index.ts`
- Triggers: `bun run dev`, `bun run dev:postgres`, `bun run dev:mssql`, Docker API services
- Responsibilities: Initialize DB, register routes (`/`, `/users`, `/health`), listen on 3000

**Test runner:**
- Location: `src/__tests__/UserService.test.ts`
- Triggers: `bun test`, `bun run test:postgres`, `bun run test:mssql`
- Responsibilities: Contract-style service tests against live DB per `DB_TYPE`

**Build / typecheck:**
- Location: `package.json` scripts (`build`, `typecheck`)
- Triggers: CI or local verification
- Responsibilities: `bun build`, `tsc --noEmit`

## Error Handling

**Strategy:** Minimal HTTP mapping in routes; business errors as thrown `Error` in service layer

**Patterns:**
- POST `/users`: try/catch → 400 with `{ error: message }` (e.g. duplicate email)
- GET/PATCH/DELETE missing user → 404 `{ error: "User not found" }`
- DB init failure: logged in `.catch` on `AppDataSource.initialize()`; no structured recovery
- Tests use `expect(...).rejects.toThrow` for duplicate email rule

## Cross-Cutting Concerns

**Logging:** TypeORM `logging: true` in `src/data-source.ts`; `console.log` on connect and server start in `src/index.ts`

**Validation:** No schema library; POST/PATCH trust JSON body shape (`Partial<User>`); email uniqueness enforced in `UserService` only

**Authentication:** None in current codebase; `docs/PRD_LINKSHARE.md` describes future auth for a LinkShare product, not implemented here

---

*Architecture analysis: 2026-06-07*