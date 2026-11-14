# Acenz2 Monorepo Init Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Set up a Turborepo monorepo (React + Express + Postgres) where FE and BE share Zod DTOs/types/utils, proven by a `/api/health` slice.

**Architecture:** pnpm workspaces + Turborepo. `packages/shared` (Zod, built with tsup to ESM+CJS) is consumed by `apps/web` (Vite) and `apps/api` (Express, CommonJS, `tsc`, TypeORM). Postgres 18 runs in Docker Compose for local dev only.

**Tech Stack:** Node 24, pnpm, Turborepo, TypeScript, React + Vite, Express, TypeORM + `pg`, Zod, tsup, Vitest, supertest, ESLint (flat) + Prettier, Docker Compose (`postgres:18-alpine`).

**Spec:** `docs/superpowers/specs/2026-11-14-monorepo-init-design.md`

## Global Constraints

- Use the latest stable version of every library at install time; pin through `pnpm-lock.yaml`.
- TypeScript everywhere, `strict: true`.
- Postgres image: `postgres:18-alpine`, local dev only.
- TypeORM entities live only in `apps/api`; `packages/shared` must not depend on TypeORM, Express, Node APIs or DOM.
- `apps/api`: CommonJS, `experimentalDecorators` + `emitDecoratorMetadata`, built with `tsc`. Do not run it with tsx/esbuild.
- TypeORM `synchronize: false`. Schema changes go through migrations only.
- Ports: web 5173, api 3000, db 5432.
- No auth, business entities, CI or app Dockerfiles.
- Root `.env` is git-ignored; root `.env.example` is committed.

## Review Focus

1. DB unreachable at startup or at runtime → API still starts and listens; `/api/health` returns 503 `{status:"degraded", db:"down"}` instead of crashing. (Task 4 test `returns 503 when db check fails` and `returns 503 when db check throws`)
2. Missing or invalid env → API exits on startup with a message naming the bad keys. (Task 4 test `loadEnv throws listing missing keys`)
3. API returns a body that doesn't match the schema → web shows an error state, not a blank/crashed page. (Task 5 test `fetchHealth rejects on schema mismatch`)
4. API down / network error → web shows an error message. (Task 5 test `fetchHealth rejects on network error`)
5. Editing `packages/shared` while `pnpm dev` runs → web and api pick up the change without a restart (tsup `--watch`). (Task 6 manual verification step)

---

### Task 1: Root workspace & tooling

**Files:**
- Create: `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `.gitignore`, `.gitattributes`, `.nvmrc` (`24`), `.prettierrc`, `.prettierignore`, `eslint.config.mjs`
- Create: `packages/tsconfig/package.json` (name `@acenz/tsconfig`), `base.json`, `node.json`, `react.json`, `library.json`

**Interfaces:**
- Produces: workspace globs `apps/*`, `packages/*`; scope `@acenz/*`; tsconfig presets extended as `@acenz/tsconfig/<preset>.json`; root scripts `dev`, `build`, `lint`, `typecheck`, `test`, `format`.

- [ ] **Step 1:** Root `package.json`: `private: true`, `packageManager: "pnpm@<installed version>"`, `engines.node: ">=24"`; scripts call `turbo run <task>`, `format` = `prettier --write .`. Dev deps: `turbo`, `typescript`, `prettier`, `eslint`, `typescript-eslint`, `@eslint/js`, `eslint-config-prettier`.
- [ ] **Step 2:** `turbo.json` tasks: `build` (`dependsOn: ["^build"]`, `outputs: ["dist/**"]`), `dev` (`dependsOn: ["^build"]`, `cache: false`, `persistent: true`), `typecheck` (`dependsOn: ["^build"]`), `lint`, `test` (`dependsOn: ["^build"]`).
- [ ] **Step 3:** tsconfig presets: `base` (strict, `skipLibCheck`, `isolatedModules`, `esModuleInterop`, `resolveJsonModule`); `node` (extends base, `module`/`moduleResolution: "node16"`, `target: "ES2023"`, `experimentalDecorators`, `emitDecoratorMetadata`, `strictPropertyInitialization: false`, `outDir: "dist"`); `react` (extends base, `module: "ESNext"`, `moduleResolution: "bundler"`, `jsx: "react-jsx"`, `lib: ["ES2023","DOM","DOM.Iterable"]`, `noEmit`); `library` (extends base, `moduleResolution: "bundler"`, `module: "ESNext"`).
- [ ] **Step 4:** `.gitignore`: `node_modules`, `dist`, `.turbo`, `.env`, `coverage`. `.gitattributes`: `* text=auto eol=lf`.
- [ ] **Step 5:** `eslint.config.mjs`: `@eslint/js` recommended + `typescript-eslint` recommended + `eslint-config-prettier`; ignores `**/dist/**`.
- [ ] **Step 6: Verify** `pnpm install` succeeds; `pnpm turbo run build` exits 0 (no tasks yet is fine).
- [ ] **Step 7: Commit** `chore: scaffold turborepo workspace and shared tooling`

### Task 2: `packages/shared` — DTOs and utils

**Files:**
- Create: `packages/shared/package.json` (name `@acenz/shared`), `tsconfig.json` (extends library), `tsup.config.ts`, `vitest.config.ts`
- Create: `src/index.ts`, `src/dto/health.ts`, `src/utils/parse.ts`
- Test: `src/dto/health.test.ts`, `src/utils/parse.test.ts`

**Interfaces:**
- Produces:
  - `HealthResponseSchema = z.object({ status: z.enum(["ok","degraded"]), db: z.enum(["up","down"]), timestamp: z.iso.datetime() })` (use `z.string().datetime()` if the installed Zod lacks `z.iso`)
  - `type HealthResponse = z.infer<typeof HealthResponseSchema>`
  - `class SchemaValidationError extends Error { issues: z.core.$ZodIssue[] | z.ZodIssue[] }`
  - `parseOrThrow<S extends z.ZodType>(schema: S, data: unknown): z.infer<S>` — throws `SchemaValidationError`
  - All of the above re-exported from `@acenz/shared`.
- Package exports: `"."` → `types: ./dist/index.d.ts`, `import: ./dist/index.js`, `require: ./dist/index.cjs`. Scripts: `build: tsup`, `dev: tsup --watch`, `test: vitest run`, `typecheck: tsc --noEmit`, `lint: eslint src`. `zod` is a `dependency`.

- [ ] **Step 1: Write failing tests**
  - `health.test.ts`: `accepts valid payload` (`{status:"ok", db:"up", timestamp: new Date().toISOString()}` parses); `rejects unknown status` (`status:"broken"` → `success === false`); `rejects non-ISO timestamp` (`"yesterday"` → fails).
  - `parse.test.ts`: `parseOrThrow returns typed data` (valid input returns an equal object); `parseOrThrow throws SchemaValidationError with issues` (`expect(() => parseOrThrow(HealthResponseSchema, {})).toThrow(SchemaValidationError)` and `issues.length > 0`).
- [ ] **Step 2:** `pnpm --filter @acenz/shared test` → FAIL (modules missing).
- [ ] **Step 3:** Implement the interfaces above. `tsup.config.ts`: `entry: ["src/index.ts"]`, `format: ["esm","cjs"]`, `dts: true`, `clean: true`, `sourcemap: true`.
- [ ] **Step 4:** `pnpm --filter @acenz/shared test` → PASS; `pnpm --filter @acenz/shared build` produces `dist/index.js`, `dist/index.cjs`, `dist/index.d.ts`.
- [ ] **Step 5: Commit** `feat(shared): add health DTO schema and parseOrThrow util`

### Task 3: Local Postgres & env

**Files:**
- Create: `docker-compose.yml`, `.env.example`

**Interfaces:**
- Produces env keys (consumed by Task 4): `POSTGRES_USER=acenz`, `POSTGRES_PASSWORD=acenz`, `POSTGRES_DB=acenz`, `POSTGRES_PORT=5432`, `DATABASE_URL=postgres://acenz:acenz@localhost:5432/acenz`, `API_PORT=3000`, `NODE_ENV=development`.

- [ ] **Step 1:** `docker-compose.yml`: service `db`, image `postgres:18-alpine`, env from `.env` (`POSTGRES_USER/PASSWORD/DB`), port `${POSTGRES_PORT:-5432}:5432`, named volume `pgdata` mounted at `/var/lib/postgresql` (the Postgres 18 image's data path), healthcheck `pg_isready -U $${POSTGRES_USER} -d $${POSTGRES_DB}`.
- [ ] **Step 2:** `.env.example` with the keys above. Copy to `.env` locally (not committed).
- [ ] **Step 3: Verify** `docker compose up -d db` → `docker compose ps` shows `healthy`; `docker compose exec db psql -U acenz -d acenz -c "select version();"` prints PostgreSQL 18.x.
- [ ] **Step 4: Commit** `chore: add postgres 18 docker compose and env example`

### Task 4: `apps/api` — Express + TypeORM

**Files:**
- Create: `apps/api/package.json` (name `@acenz/api`, `"type": "commonjs"`), `tsconfig.json` (extends node, `rootDir: src`), `tsconfig.build.json` (excludes `**/*.test.ts`), `vitest.config.ts`
- Create: `src/config/env.ts`, `src/db/data-source.ts`, `src/db/migrations/.gitkeep`, `src/db/entities/.gitkeep`, `src/app.ts`, `src/routes/health.ts`, `src/index.ts`
- Test: `src/config/env.test.ts`, `src/routes/health.test.ts`

**Interfaces:**
- Consumes: `HealthResponseSchema`, `HealthResponse`, `parseOrThrow` from `@acenz/shared`; env keys from Task 3.
- Produces:
  - `loadEnv(source: Record<string, string | undefined>): Env` where `Env = { DATABASE_URL: string; API_PORT: number; NODE_ENV: "development" | "test" | "production" }`. `API_PORT` is coerced with default `3000`; `NODE_ENV` defaults to `"development"`. Throws `Error` whose message lists every invalid key.
  - `createDataSource(env: Env): DataSource` — `type: "postgres"`, `url: env.DATABASE_URL`, `synchronize: false`, `entities: [__dirname + "/entities/*.js"]`, `migrations: [__dirname + "/migrations/*.js"]`. `data-source.ts` also has `export default createDataSource(loadEnv(process.env))` for the TypeORM CLI.
  - `type DbCheck = () => Promise<boolean>`
  - `createApp(deps: { checkDb: DbCheck }): express.Express` — mounts `GET /api/health`, JSON body parser, a final error handler returning `{ message }` with 500.
  - Health handler: `checkDb()` true → 200 `{status:"ok", db:"up", timestamp}`; false or throws → 503 `{status:"degraded", db:"down", timestamp}`. Validates the body with `parseOrThrow(HealthResponseSchema, body)` before sending.
- Scripts: `build: tsc -p tsconfig.build.json`, `dev: tsc -p tsconfig.build.json && concurrently "tsc -p tsconfig.build.json --watch --preserveWatchOutput" "node --watch --env-file-if-exists=../../.env dist/index.js"`, `start: node --env-file-if-exists=../../.env dist/index.js`, `test: vitest run`, `typecheck: tsc --noEmit`, `lint: eslint src`, `migration:generate: pnpm build && typeorm -d dist/db/data-source.js migration:generate`, `migration:run: pnpm build && typeorm -d dist/db/data-source.js migration:run`, `migration:revert: pnpm build && typeorm -d dist/db/data-source.js migration:revert`. Deps: `express`, `typeorm`, `pg`, `reflect-metadata`, `@acenz/shared: workspace:*`. Dev deps: `@types/express`, `@types/node`, `vitest`, `supertest`, `@types/supertest`, `concurrently`.

- [ ] **Step 1: Write failing tests**
  - `env.test.ts`: `loadEnv parses valid env` (`DATABASE_URL` set, `API_PORT: "4000"` → `API_PORT === 4000`); `loadEnv applies defaults` (only `DATABASE_URL` → `API_PORT === 3000`, `NODE_ENV === "development"`); `loadEnv throws listing missing keys` (`{}` → throws matching `/DATABASE_URL/`).
  - `health.test.ts` (supertest against `createApp({ checkDb })`): `returns 200 ok when db is up` (status 200, body passes `HealthResponseSchema`, `db === "up"`); `returns 503 when db check fails` (`checkDb` resolves false → 503, `status === "degraded"`); `returns 503 when db check throws` (`checkDb` rejects → 503, not 500).
  - Tests must not import `data-source.ts` or entities (Vitest/esbuild doesn't emit decorator metadata).
- [ ] **Step 2:** `pnpm --filter @acenz/api test` → FAIL.
- [ ] **Step 3:** Implement `env.ts`, `data-source.ts`, `app.ts`, `routes/health.ts`.
- [ ] **Step 4:** Implement `index.ts`: `import "reflect-metadata"`; `loadEnv(process.env)` (on error: `console.error` the message, `process.exit(1)`); build the data source; call `initialize()` without blocking `listen` — on failure log the error and keep running; `checkDb` = `ds.isInitialized ? ds.query("SELECT 1").then(() => true) : ds.initialize().then(() => true)` with failures resolving `false`; `listen(env.API_PORT)` and log the URL.
- [ ] **Step 5:** `pnpm --filter @acenz/api test` → PASS; `pnpm --filter @acenz/api build` → exit 0.
- [ ] **Step 6: Verify manually** with the db up: `pnpm --filter @acenz/api start` then `curl -i localhost:3000/api/health` → 200 `db:"up"`. Run `docker compose stop db` and curl again → 503 `db:"down"`, and the process is still alive. Then `docker compose start db`. Running `pnpm --filter @acenz/api migration:run` → "No migrations are pending".
- [ ] **Step 7: Commit** `feat(api): express app with typeorm data source and health endpoint`

### Task 5: `apps/web` — React + Vite

**Files:**
- Create: `apps/web/` via the Vite `react-ts` template, then trim it: `package.json` (name `@acenz/web`), `tsconfig.json` (extends react), `vite.config.ts`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/api/health.ts`
- Test: `src/api/health.test.ts`

**Interfaces:**
- Consumes: `HealthResponseSchema`, `HealthResponse`, `parseOrThrow` from `@acenz/shared`.
- Produces: `fetchHealth(fetchImpl?: typeof fetch): Promise<HealthResponse>` — GETs `/api/health` and accepts 200 **and** 503 bodies (both are valid DTOs). Parses with `parseOrThrow`. Network errors and schema mismatches reject.
- `vite.config.ts`: `server.port: 5173`, `server.proxy: { "/api": "http://localhost:3000" }`, Vitest `environment: "node"`.
- Scripts: `dev: vite`, `build: tsc --noEmit && vite build`, `test: vitest run`, `typecheck: tsc --noEmit`, `lint: eslint src`.

- [ ] **Step 1: Write failing tests** (`fetchImpl` stub returning `new Response(JSON.stringify(body), { status })`)
  - `fetchHealth returns parsed body on 200`
  - `fetchHealth returns degraded body on 503` (`db === "down"`)
  - `fetchHealth rejects on schema mismatch` (body `{foo:1}` → rejects with `SchemaValidationError`)
  - `fetchHealth rejects on network error` (stub throws `TypeError` → rejects)
- [ ] **Step 2:** `pnpm --filter @acenz/web test` → FAIL.
- [ ] **Step 3:** Implement `fetchHealth`. `App.tsx` calls it on mount and renders three states: loading ("Checking API…"), success (shows `status`, `db`, `timestamp`), error (shows the error message). Remove the template's demo assets and CSS.
- [ ] **Step 4:** `pnpm --filter @acenz/web test` → PASS; `pnpm --filter @acenz/web build` → exit 0.
- [ ] **Step 5: Commit** `feat(web): react app showing api health via shared schema`

### Task 6: End-to-end wiring & README

**Files:**
- Create: `README.md` (prerequisites, `cp .env.example .env`, `docker compose up -d db`, `pnpm install`, `pnpm dev`, migration commands, layout overview, "entities in api only / DTOs in shared" rule)

- [ ] **Step 1: Verify** from the root: `pnpm lint && pnpm typecheck && pnpm test && pnpm build` all exit 0.
- [ ] **Step 2: Verify** `pnpm dev` starts shared (tsup watch), api and web. Open `http://localhost:5173`: it shows `status: ok, db: up`. Stop the db, reload: it shows `degraded / down`. Start the db again.
- [ ] **Step 3: Verify** shared hot reload (Review Focus 5): while `pnpm dev` runs, add a temporary optional field to `HealthResponseSchema` and confirm `apps/api` restarts and `apps/web` reloads without manual restarts. Then revert the change.
- [ ] **Step 4:** Write `README.md`.
- [ ] **Step 5: Commit** `docs: add README with setup and dev workflow`
