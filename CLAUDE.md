# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Turborepo + pnpm monorepo (Node >= 24, pnpm 12). Root scripts fan out through `turbo run`:

```bash
cp .env.example .env && docker compose up -d db   # first-time setup (Postgres 18, data in ./pg-data)
pnpm install
pnpm dev          # shared/core/tokens/ui in tsup watch + api (tsc watch + node --watch) + web (Vite :5173)
pnpm build | lint | typecheck | test | format
```

Single package / single test (Vitest, `include: src/**/*.test.ts`, node environment):

```bash
pnpm --filter @acenz/api test                                          # one package
pnpm --filter @acenz/api exec vitest run src/routes/health.test.ts     # one file
pnpm --filter @acenz/api exec vitest run -t "degraded"                 # by test name
pnpm --filter @acenz/web lint
```

- `test` and `typecheck` depend on `^build` in `turbo.json`, but a bare `vitest`/`tsc` inside a package does **not** build its workspace deps. Workspace packages are consumed from `dist/`, so run `pnpm build` (or keep `pnpm dev` running) first, or imports of `@acenz/*` fail.
- `@acenz/ui` and `@acenz/tokens` have no `test` script; `@acenz/web` tests only match `*.test.ts` in a node environment (no component/DOM tests).
- Migrations (run from root with `--filter`): `pnpm --filter @acenz/api migration:generate src/db/migrations/<Name>` / `migration:run` / `migration:revert`. Each rebuilds the API first because the TypeORM CLI reads the compiled `dist/db/data-source.js`.
- `pnpm --filter @acenz/api db:export|db:import -c <container>`: the container name is required, there is no default. `--clean` is destructive. Details in `apps/api/README.md`.

## Architecture

```
tokens.json ─► @acenz/tokens ─► tokens.css / tailwind.css ─┐
@acenz/core (pure TS, no DOM) ─► @acenz/ui (React, Tailwind v4) ─► apps/web
@acenz/shared (Zod DTOs) ─────────────────────────────────────► apps/web  and  apps/api
apps/api (Express 5 + TypeORM + Postgres)      @acenz/tsconfig = shared tsconfig presets
```

`README.md` lists only `web`, `api`, `shared` and `tsconfig`; `core`, `tokens` and `ui` also exist (see `docs/design-system.md`, written in Vietnamese).

**`apps/api` has a mandatory layered architecture: `routes/ → middlewares/ → controllers/ → services/ → repositories/ → db/entities/`, plus `utils/` (pure functions) and `constants/` (API-internal values). Read the "Architecture" section of `apps/api/README.md` BEFORE planning or writing anything under `apps/api/src/`, and the hard rules in `apps/api/CLAUDE.md`. One direction only: a controller never touches a repository, entity or `typeorm`; a service never touches express or `typeorm`; TypeORM queries exist only in `repositories/`. If a change does not fit, stop and say so rather than inventing a variation.**

**Cross-package rules that need several files to see:**

- **DTOs are defined once, in `packages/shared`, as Zod schemas**; types come from `z.infer`. The API builds/validates responses with them and the web app parses responses with the same schema (see `/api/health`).
- **TypeORM entities live only in `apps/api/src/db/entities`.** Never import them from `shared` or `web` (decorators would pull TypeORM into the browser bundle). The API maps entities to DTOs.
- **`apps/api` is CommonJS compiled with plain `tsc`** (not esbuild/tsx) because TypeORM needs `emitDecoratorMetadata`. `data-source.ts` globs compiled `.js` entities/migrations from `dist`, so schema work always needs a build. `synchronize` is off; schema changes go through migrations only.
- **API wiring is dependency-injected:** `createApp({ checkDb })` in `src/app.ts` takes its dependencies so route tests use `supertest` without a database. `index.ts` deliberately does not block startup on the DB; `/api/health` reports `degraded` until it connects.
- API env is validated by a Zod schema in `src/config/env.ts` and loaded from the **root** `.env` via `node --env-file-if-exists=../../.env`. The web dev server proxies `/api` to `localhost:3000`.
- `shared`, `core`, `tokens`, `ui` are built with `tsup` (dual ESM/CJS + d.ts). TypeScript is pinned to 6.x until `tsup` d.ts generation and `typescript-eslint` support TS 7.

## UI layer (`packages/ui`, `packages/tokens`, `apps/web`)

- Tailwind v4 is compiled **only in the app**. `@acenz/ui` writes utility classes in TSX but ships no compiled CSS for them, so an app using it needs `@import "@acenz/tokens/tailwind.css"`, `@import "@acenz/ui/styles.css"` and `@source "../../../packages/ui/src"` (already in `apps/web/src/index.css`).
- ACENZ tokens **replace** Tailwind's default palette, type scale, radii, shadows and breakpoints: `bg-blue-500` or `text-lg` do not exist. Use `bg-brand`, `text-ink`, `text-body`, `rounded-md`, etc. Never hard-code colors (`#hex`, `text-[#...]`); add a token instead. Dark theme is `data-theme="dark"` on `<html>`, and `dark:` follows it.
- Join classes with `cx()` from `@acenz/ui` (wraps `tailwind-merge`): a passed `className` overrides defaults. Business logic (band rounding, assignment status, dates) belongs in `@acenz/core`, not in components.
- Components are mid-migration from legacy `ic-*` CSS (`packages/ui/src/styles.css`) to utilities in TSX. Migrated groups follow one-component-per-file under `packages/ui/src/<group>/` with an `index.ts` re-export (see `src/forms/`); unmigrated groups are still single files (`feedback.tsx`, `layout.tsx`, `data.tsx`, `ielts.tsx`). The migration status table, the steps for migrating a component, and which legacy rules must stay are in `docs/design-system.md` section 4. Read it before touching `styles.css`.
- Source of truth: `packages/tokens/src/tokens.json` and `packages/ui/src/styles.css` mirror an external design system. Change them here, then re-sync with `/design-sync`. After editing `tokens.json`, run `pnpm --filter @acenz/tokens build` (regenerates `tokens.css`/`tailwind.css`). Renaming a token is breaking: grep and replace every utility using the old name in the same change.
- UI copy is Vietnamese, with short sentences and verb-first buttons. Band scores show one decimal (`7.0`). The UI PR checklist is in `docs/design-system.md` section 8.

## Repo conventions

- Conventional commits with a scope (`feat(api):`, `refactor(ui):`, `chore(tokens):`, `chore(docker):`).
- `.claude/skills/` is tracked in git. Skills listed in `skills-lock.json` are installed from upstream repos (do not hand-edit them); `ticket-to-pr` is local to this repo and is the workflow to follow when given a Jira ticket. `docs/superpowers/` and `.superpowers/` are git-ignored, so plans and specs there are local only.
- `.mcp.json` wires a Postgres MCP server in `--access-mode=unrestricted` against the local dev DB (`DATABASE_URI` from `.claude/settings.local.json`). It can write; do not point it at anything other than the local container.
