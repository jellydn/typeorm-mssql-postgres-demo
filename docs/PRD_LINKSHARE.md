# Draft PRD: LinkShare

## Stack

- Bun
- Hono
- TypeScript
- TypeORM
- PostgreSQL
- Drizzle/TypeORM comparison section

## Goal

A lightweight link sharing platform.

Features:
- User authentication
- Collections
- Tags
- Public/private links
- Search
- Analytics
- OpenGraph preview

## Architecture

Hono API
  -> Service Layer
  -> Repository Layer
  -> TypeORM
  -> PostgreSQL

## Why TypeORM

Demonstrate single codebase portability.

Future support:
- PostgreSQL
- MSSQL
- SQLite

without duplicating repositories.

## MVP

- Register/Login
- Create Link
- Edit Link
- Delete Link
- Collections
- Tags
- Search
- Share URL

## API

POST /api/links
GET /api/links
GET /api/links/:id
PATCH /api/links/:id
DELETE /api/links/:id

## Future

- AI tagging
- Browser extension
- RSS import
- Team workspace
