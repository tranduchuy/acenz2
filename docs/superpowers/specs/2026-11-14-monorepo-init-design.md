# Acenz2 — Monorepo Init Design

Date: 2026-11-14 · Size: small (project skeleton only)

## Intent
Set up an empty project skeleton with no business logic yet. The main goal is for FE and BE to **share types, utils and DTOs** through Turborepo, so features added later reuse one definition.

## Goals / Non-goals
- **Goals:** a Turborepo monorepo with React (FE), Express (BE) and Postgres. A shared package of Zod DTOs. One small end-to-end example that proves sharing works.
- **Non-goals:** business logic, auth, real entities, deploy/CI, Dockerfiles for the apps.
- **Anti-goals:** FE bundling TypeORM or other server code. DTOs defined twice and drifting apart.

## Approaches (decided)
- **A. Zod schema as the single source (chosen):** DTOs live in `packages/shared`. Types come from `z.infer`. BE validates requests with them; FE uses them for forms and response checks.
- B. Plain TS interfaces: rejected. Types vanish at runtime, so validation has to be written separately.
- C. OpenAPI + codegen: rejected. Too heavy for an internal monorepo.
- **ORM: TypeORM** (user's choice).

## Structure
```
apps/
  web/        React + Vite + TS
  api/        Express + TS + TypeORM (entities, migrations, data-source)
packages/
  shared/     Zod schemas/DTOs, inferred types, utils (no Node/DOM deps)
  tsconfig/   tsconfig base / react / node
docker-compose.yml   Postgres 18 (`postgres:18-alpine`, local dev only)
turbo.json, pnpm-workspace.yaml, .env.example
```

## Decisions
- **pnpm workspaces + Turborepo**, TypeScript across the repo. Turbo tasks: `dev`, `build`, `lint`, `typecheck`, `test`.
- **TypeORM entities stay in `apps/api`** and are not shared, because decorators would pull TypeORM into the FE. DTOs in `shared` are written separately from entities; the API maps between them.
- **TypeORM needs `experimentalDecorators` + `emitDecoratorMetadata`.** esbuild/tsx do not emit metadata, so *(my call)* the API builds with `tsc` and runs dev with `tsc --watch` + `node --watch`.
- **API is CommonJS** *(my call)*, because TypeORM CLI/migrations are most stable that way. `packages/shared` is built with **tsup** to ESM + CJS + `.d.ts`, so both Vite and the API consume it fine.
- **Migrations:** TypeORM CLI via `data-source.ts`, `synchronize: false`. Scripts `migration:generate` / `migration:run`. The migrations folder starts empty.
- **Env:** `.env` validated with Zod when the API starts. `.env.example` is committed.
- **Example slice:** `GET /api/health` → `HealthResponseSchema` (from `shared`) includes DB status (`SELECT 1`). The web page calls it through the Vite proxy, parses it with that same schema, and shows the result.
- **Quality:** ESLint (flat config) + Prettier at the root. Vitest with one sample test in `shared` and one in `api` *(my call)*.

## Left to the builder
Exact library versions (current stable), folder layout inside `api` (routes/controllers/services) and `web`, ports (proposal: web 5173, api 3000, db 5432).
