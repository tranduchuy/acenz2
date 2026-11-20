# Acenz2

Turborepo monorepo: React (Vite) + Express + PostgreSQL, with DTOs shared between frontend and backend through Zod.

## Layout

```
apps/
  web/            React + Vite (http://localhost:5173)
  api/            Express + TypeORM (http://localhost:3000)
packages/
  shared/         Zod schemas (DTOs), inferred types, utils — no Node/DOM deps
  tsconfig/       Shared tsconfig presets (base, node, react, library)
docker-compose.yml   Postgres 18 for local development
```

## Prerequisites

- Node 24+ (`.nvmrc`)
- pnpm
- Docker (for local Postgres)
- [GitHub CLI](https://cli.github.com) (`gh`), authenticated with `gh auth login`
- Atlassian MCP server connected to Claude Code, with access to the Jira site
- [uv](https://docs.astral.sh/uv/) (Python package manager)

`gh` and the Atlassian MCP are used by the `ticket-to-pr` skill (`.claude/skills/ticket-to-pr`) to read Jira tickets and open pull requests.

## Getting started

```bash
cp .env.example .env
docker compose up -d db
pnpm install
pnpm dev
```

Open http://localhost:5173. It calls `GET /api/health` (through the Vite proxy) and validates the response with the same schema the API uses to build it.

## Scripts

| Command          | What it does                                             |
| ---------------- | -------------------------------------------------------- |
| `pnpm dev`       | Runs shared (tsup watch), api (tsc watch) and web (Vite) |
| `pnpm build`     | Builds all packages in dependency order                  |
| `pnpm test`      | Runs Vitest in every package                             |
| `pnpm lint`      | ESLint in every package                                  |
| `pnpm typecheck` | `tsc --noEmit` in every package                          |
| `pnpm format`    | Prettier over the whole repo                             |

## Database migrations

Run from the repo root with `--filter`, or inside `apps/api`:

```bash
pnpm --filter @acenz/api migration:generate src/db/migrations/<Name>
pnpm --filter @acenz/api migration:run
pnpm --filter @acenz/api migration:revert
```

`synchronize` is off; schema changes go through migrations only.

## Conventions

- **DTOs live in `packages/shared`** as Zod schemas; types come from `z.infer`. The API validates with them, the web app parses responses with them. Define a DTO once.
- **TypeORM entities live only in `apps/api`** (`src/db/entities`). Never import them from `shared` or `web` — decorators would pull TypeORM into the browser bundle. The API maps entities to DTOs.
- The API is built with `tsc` (not esbuild/tsx) because TypeORM needs `emitDecoratorMetadata`.
- TypeScript is pinned to 6.x until `tsup` (d.ts generation) and `typescript-eslint` support TypeScript 7.
