# typeorm-mssql-postgres-demo — https://just.systems/man/en/

set positional-arguments := true

[private]
default:
    @just --list

# Dev server (default DB from .env)
dev:
    bun run dev

dev-postgres:
    bun run dev:postgres

dev-mssql:
    bun run dev:mssql

build:
    bun run build

typecheck:
    bun run typecheck

# Tests use DB_TYPE from env; start DB with `just db-up` first
test:
    bun test

test-postgres:
    bun run test:postgres

test-mssql:
    bun run test:mssql

check: typecheck test

db-up:
    docker compose up -d postgres mssql

db-down:
    docker compose down

docker-build:
    docker compose --profile app build

# API container against PostgreSQL (starts postgres if needed)
docker-up:
    docker compose --profile app up --build

docker-up-d:
    docker compose --profile app up --build -d

docker-up-mssql:
    docker compose --profile app-mssql up --build

docker-up-mssql-d:
    docker compose --profile app-mssql up --build -d

docker-logs:
    docker compose --profile app logs -f api

docker-down:
    docker compose --profile app --profile app-mssql down

prek-install:
    prek install --refresh

prek *args:
    prek run --all-files {{args}}
