# Coding Conventions

**Analysis Date:** 2026-06-07

## Naming Patterns

**Files:**
- PascalCase for class-centric modules: `User.ts`, `UserRepository.ts`, `UserService.ts`, `UserService.test.ts`
- camelCase for config/util modules: `data-source.ts`, `index.ts`, `helpers.ts`
- Layer folders: `entities/`, `repositories/`, `services/`, `dialect/`, `__tests__/`

**Functions:**
- camelCase for functions and methods: `getUserByEmail`, `findAll`, `getDatabaseType`, `getLimitClause`
- `get*` prefix for accessors and lazy singleton getters: `getRepo()`, `getConnectionString()`

**Variables:**
- camelCase: `userService`, `existingUser`, `DB_TYPE`
- Module-level lazy singletons use `_repo` with leading underscore and nullable type

**Types:**
- PascalCase for classes and entities: `User`, `UserRepository`, `UserService`
- `Partial<User>` for create/update payloads
- Explicit return types on public async methods: `Promise<User | null>`, `Promise<boolean>`

## Code Style

**Formatting:**
- **Indentation:** tabs (observed in `src/index.ts`, `src/services/UserService.ts`, `src/__tests__/UserService.test.ts`)
- No `biome.json`, `.prettierrc`, or ESLint config in repo
- **Pre-commit (prek):** `prek.toml` — trailing whitespace, end-of-file fixer, large files, YAML check; local `typecheck` (`bun run typecheck`) on commit; `bun test` on manual/pre-push only

**Linting:**
- TypeScript compiler strict mode (`tsconfig.json`: `"strict": true`)
- No separate linter; rely on `bun run typecheck` / prek `typecheck` hook

## Import Organization

**Order:**
1. Side-effect / runtime setup (`import "reflect-metadata"` in `src/data-source.ts` before TypeORM)
2. External packages (`hono`, `typeorm`, `@hono/node-server`, `bun:test`)
3. Relative project imports (`./data-source`, `../entities/User`)

**Path Aliases:**
- None configured in `tsconfig.json`; use relative paths only (`../repositories/UserRepository`)

**Type-only imports:**
- Use `import type { User } from "../entities/User"` when types are not needed at runtime (`UserService.ts`)

## Error Handling

**Patterns:**
- **Domain / service layer:** throw `new Error("...")` with a clear message (e.g. duplicate email in `UserService.createUser`)
- **HTTP layer (`src/index.ts`):** `try/catch` on POST; respond with `c.json({ error: (error as Error).message }, 400)`; missing resources return `404` with `{ error: "User not found" }`
- **Startup:** `AppDataSource.initialize().catch((err) => console.error(err))` — log and fail without custom error type

## Logging

**Framework:** `console` only (no dedicated logger module)

**Patterns:**
- `console.log` for successful DB connect and server start (`src/index.ts`)
- `console.error` for DataSource initialization failures
- TypeORM `logging: true` on `AppDataSource` (`src/data-source.ts`) for query-level output in dev

## Comments

**When to Comment:**
- Minimal inline comments in application code; behavior is expressed through naming and small functions

**JSDoc/TSDoc:**
- Not used on public APIs in current `src/` files

## Function Design

**Size:** Small methods delegating to repository; route handlers are short async wrappers

**Parameters:** IDs as `number`, emails as `string`, partial entity for writes (`Partial<User>`)

**Return Values:** Nullable entities (`User | null`) for lookups; `boolean` for delete success; arrays for list endpoints

## Module Design

**Exports:** Named exports for classes (`export class UserService`), named const for `AppDataSource`

**Barrel Files:** Not used; import concrete files per layer

**Lazy initialization:** Repeated pattern — module-level `_repo` + `getRepo()` to defer `AppDataSource.getRepository` / `new UserRepository()` until first use

---

*Convention analysis: 2026-06-07*