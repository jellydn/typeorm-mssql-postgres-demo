# typeorm-mssql-postgres-demo

A practical demonstration of using one TypeORM codebase to support MSSQL and PostgreSQL without duplicating providers.

## Features

- Single entity model works across databases
- Shared repository layer
- Shared service layer
- Runtime driver selection via environment variables
- Contract tests ensuring behavioral parity

## Quick Start

```bash
# 1. Start databases
docker compose up -d postgres mssql
# or: just db-up

# 2. Choose your database and run
bun run dev:postgres   # or
bun run dev:mssql
```

### Docker (API + database)

```bash
# PostgreSQL stack (API on http://localhost:3000)
docker compose --profile app up --build
# or: just docker-up

# MSSQL stack
docker compose --profile app-mssql up --build
# or: just docker-up-mssql

# Databases only (run API on the host with bun)
docker compose up -d postgres mssql
```

| Compose profile | Services        | Use case                          |
| --------------- | --------------- | --------------------------------- |
| *(default)*     | `postgres`, `mssql` | Local dev / tests on the host |
| `app`           | `postgres` + `api`  | Full stack on PostgreSQL        |
| `app-mssql`     | `mssql` + `api-mssql` | Full stack on MSSQL           |

Set `API_PORT` if port 3000 is taken. MSSQL SA password in Compose is `YourStrongPass123` (must meet SQL Server complexity rules).

## Architecture

```
Application Service (UserService)
        ↓
Repository Layer (UserRepository)
        ↓
TypeORM (with decorators)
        ↓
┌─────────────────┐
│ MSSQL Driver    │
│ PostgreSQL      │
└─────────────────┘
```

Key principle: **Never duplicate entire domain modules**. Database-specific code should only exist in small helpers when absolutely necessary.

## Project Structure

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

## Environment Variables

Copy `.env.example` to `.env` or use the preset files:

```bash
# PostgreSQL
cp .env.postgres .env

# MSSQL
cp .env.mssql .env
```

| Variable       | Description       | Example (PostgreSQL)                       | Example (MSSQL)                                                                        |
| -------------- | ----------------- | ------------------------------------------ | -------------------------------------------------------------------------------------- |
| `DB_TYPE`      | Database type     | `postgres`                                 | `mssql`                                                                                |
| `DATABASE_URL` | Connection string | `postgres://user:pass@localhost:5432/demo` | `Server=localhost,1433;Database=demo;User Id=sa;Password=YourStrongPass123;TrustServerCertificate=true;` |

## API Endpoints

| Method | Endpoint        | Description       |
| ------ | --------------- | ----------------- |
| GET    | `/`             | Health check      |
| GET    | `/users`        | List all users    |
| GET    | `/users/:email` | Get user by email |
| POST   | `/users`        | Create user       |
| PATCH  | `/users/:id`    | Update user       |
| DELETE | `/users/:id`    | Delete user       |

## Testing

Run tests against a specific database:

```bash
# PostgreSQL
bun run test:postgres

# MSSQL
bun run test:mssql
```

## Why This Matters

Many codebases support multiple databases by duplicating domain modules:

```
providers/mssql/user.ts
providers/pg/user.ts
providers/mssql/fiat.ts
providers/pg/fiat.ts
```

This doubles maintenance cost and increases drift risk. This repository demonstrates a better approach.
