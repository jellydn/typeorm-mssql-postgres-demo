# Testing Patterns

**Analysis Date:** 2026-06-07

## Test Framework

**Runner:**
- Bun built-in test runner (`bun test`)
- Config: no separate vitest/jest config; TypeScript via project `tsconfig.json` and `@types/bun`

**Assertion Library:**
- `expect` from `bun:test` (Jest-compatible API)

**Run Commands:**
```bash
bun test                    # Uses DB_TYPE / DATABASE_URL from environment
bun run test:postgres       # DB_TYPE=postgres bun test
bun run test:mssql          # DB_TYPE=mssql bun test
just test                   # Same as bun test (see justfile)
just test-postgres          # bun run test:postgres
just test-mssql             # bun run test:mssql
just check                  # typecheck + test
prek run test               # Manual/pre-push hook only; needs running DB
```

**Prerequisites:** Start databases before tests — `just db-up` or `docker compose up -d postgres mssql`; set `DATABASE_URL` (e.g. `.env.postgres` / `.env.mssql`).

## Test File Organization

**Location:**
- Dedicated folder: `src/__tests__/` (not co-located next to source files)

**Naming:**
- `*.test.ts` suffix: `UserService.test.ts`

**Structure:**
```
src/
├── __tests__/
│   └── UserService.test.ts
├── services/
│   └── UserService.ts
└── data-source.ts
```

## Test Structure

**Suite Organization:**
```typescript
import { afterAll, afterEach, beforeAll, describe, expect, it } from "bun:test";
import { AppDataSource } from "../data-source";
import { UserService } from "../services/UserService";

const userService = new UserService();

describe("UserService", () => {
	beforeAll(async () => {
		await AppDataSource.initialize();
	});

	afterAll(async () => {
		await AppDataSource.destroy();
	});

	afterEach(async () => {
		const users = await userService.getAllUsers();
		for (const user of users) {
			await userService.deleteUser(user.id);
		}
	});

	it("should create a user", async () => {
		const user = await userService.createUser({ email: "test@example.com" });
		expect(user).toBeDefined();
		expect(user.email).toBe("test@example.com");
	});
});
```

**Patterns:**
- **Setup:** `beforeAll` initializes real `AppDataSource` (TypeORM + DB)
- **Teardown:** `afterAll` destroys connection; `afterEach` deletes all users for isolation
- **Assertions:** `expect(...).toBe`, `.toBeDefined`, `.toBeNull`, `.rejects.toThrow` for async errors
- **Instance:** Single module-level `UserService` shared across tests in the file

## Mocking

**Framework:** None — no `mock`, `spyOn`, or test doubles in the codebase

**Patterns:**
- Tests hit the real database through TypeORM (`synchronize: true` on data source)

**What to Mock:**
- Not used in current tests; if adding unit tests without DB, mock `UserRepository` at the service boundary

**What NOT to Mock:**
- Current contract tests intentionally use real Postgres/MSSQL to prove portability; keep the same test file runnable under `test:postgres` and `test:mssql`

## Fixtures and Factories

**Test Data:**
- Inline literals per test: unique emails per scenario (`test@example.com`, `find@example.com`, etc.)
- No shared factory helpers or fixture files

**Location:**
- Data created inside each `it` block; cleanup in `afterEach`

## Coverage

**Requirements:** None enforced (no coverage script in `package.json`)

**View Coverage:**
```bash
# Not configured; Bun supports coverage flags if added later, e.g. bun test --coverage
```

## Test Types

**Unit Tests:**
- Not present as isolated units; service methods are tested directly but with a live DB (integration-style)

**Integration Tests:**
- Primary approach: `UserService` + `AppDataSource` against whichever DB `DB_TYPE` selects
- Validates CRUD, duplicate-email rule, and list behavior end-to-end through TypeORM

**E2E Tests:**
- Not used (no HTTP-level tests with Hono `app.fetch` or supertest)

## Common Patterns

**Async Testing:**
```typescript
it("should find user by email", async () => {
	await userService.createUser({ email: "find@example.com" });
	const user = await userService.getUserByEmail("find@example.com");
	expect(user?.email).toBe("find@example.com");
});
```

**Error Testing:**
```typescript
it("should not create duplicate emails", async () => {
	await userService.createUser({ email: "duplicate@example.com" });
	await expect(
		userService.createUser({ email: "duplicate@example.com" }),
	).rejects.toThrow("User with this email already exists");
});
```

**Multi-database contract testing:**
- Run the same `src/__tests__/UserService.test.ts` twice via npm scripts / just recipes with different `DB_TYPE` values

---

*Testing analysis: 2026-06-07*