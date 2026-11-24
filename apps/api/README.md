# @acenz/api

Express + TypeORM API.

## Architecture

**Read this before adding or changing anything under `src/`.** Five layers, one direction. A
request flows down the chain; no layer ever calls upwards, and no layer may be skipped.

```
HTTP request
   │
   ├─▶ routes/         paths and verbs. Attach middleware, delegate to one controller handler.
   │                   No logic, no validation, no data access.
   ├─▶ middlewares/    cross-cutting concerns: auth guard, body parsing, error mapping.
   │                   The only place besides routes that knows about `next()`.
   ├─▶ controllers/    the HTTP boundary. Validate input with a Zod schema from
   │                   `@acenz/shared`, call exactly one service, map its result to a
   │                   status code and a DTO. No business rules, no database.
   ├─▶ services/       the business rules. Plain TypeScript: no `req`/`res`, no express
   │                   types, no TypeORM. Receives its data access as injected functions.
   ├─▶ repositories/   the only place TypeORM queries are written. Returns plain objects or
   │                   narrow entity subsets, never a query builder or a live entity graph.
   └─▶ db/entities/    table mappings. Imported by repositories and `data-source` only.
```

### Folder map

```
apps/api/src/
├── routes/            <feature>.routes.ts          → createXRouter(controller)
├── middlewares/       <name>.middleware.ts         → createXMiddleware(deps)
├── controllers/       <feature>.controller.ts      → createXController(services)
├── services/          <feature>.service.ts         → createXService(deps)
├── repositories/      <name>.repository.ts         → createFindX(dataSource, ...)
├── db/
│   ├── entities/      <Name>.ts                    TypeORM entities (PascalCase)
│   ├── migrations/    <timestamp>-<Name>.ts
│   └── data-source.ts  create-data-source.ts  check-db.ts  ensure-initialized.ts
├── utils/             pure, reusable functions
├── constants/         API-internal constant values
├── config/            env.ts - Zod-validated environment
├── app.ts             mounts middleware + routers; takes all deps as arguments
├── server.ts          listen() helper
└── index.ts           composition root: builds every dependency, starts the server
```

`utils/`, `constants/`, `config/` and `db/` are **support folders, not layers**. They sit beside
the chain and are imported into it; they never import from it.

### Import rules

The chain is enforced by what each file is allowed to import. This table is the contract:

| Layer           | May import                                                              | Must never import                        |
| --------------- | ----------------------------------------------------------------------- | ---------------------------------------- |
| `routes/`       | `middlewares/`, `controllers/`, express                                 | services, repositories, entities         |
| `middlewares/`  | `services/`, `utils/`, `constants/`, express                            | repositories, entities, typeorm          |
| `controllers/`  | `services/`, `utils/`, `constants/`, `@acenz/shared`, express **types** | repositories, entities, typeorm          |
| `services/`     | `utils/`, `constants/`, `@acenz/shared`, repository **types** only      | express, typeorm, entities (as values)   |
| `repositories/` | `db/entities/`, typeorm, `utils/`, `constants/`                         | express, controllers, services           |
| `db/entities/`  | typeorm                                                                 | everything else in `src/`                |
| `utils/`        | `constants/` and nothing else from `src/`                               | services, repositories, entities, config |
| `constants/`    | nothing                                                                 | everything                               |

Two rules carry most of the weight:

- **A service must stay runnable without a database.** It takes `findUserByEmail`-style
  functions, never a `DataSource` or a repository object. That is what lets
  `services/*.test.ts` run with plain fakes and no Postgres.
- **A controller must stay runnable without a database.** `createApp` takes its dependencies as
  arguments, so route tests use `supertest` against fake services.

### `utils/` - pure functions

Deterministic helpers with no business rules, no database access and no environment reads.
Given the same input they return the same output.

One deliberate exception: a util whose entire job is shaping an HTTP response may import express
_types_ (`send-error.ts`). Anything that makes a decision belongs in a service instead.

### `constants/` - API-internal values only

Frozen values shared by more than one file: bcrypt cost, a dummy hash, default page sizes,
table names.

**If a constant is part of the HTTP contract, it does not go here - it goes in
`packages/shared`.** Error codes and their status maps (`AUTH_ERROR`, `AUTH_ERROR_STATUS`) are
read by the web app too, so `packages/shared` owns them. `src/constants/` is for values that
never leave the API.

### Naming and tests

- One suffix per layer: `auth.routes.ts`, `auth.controller.ts`, `auth.service.ts`,
  `user.repository.ts`, `require-auth.middleware.ts`. Entities are PascalCase: `User.ts`.
- Every layer file exports a `create*` factory that takes its dependencies and returns the
  handler, router or function. No module-level singletons, no top-level `new DataSource()`.
- Tests sit next to their source as `<file>.test.ts` (vitest matches `src/**/*.test.ts`).
  Services get unit tests with fakes; routes get `supertest` tests with fake services.

### Adding an endpoint

1. **Contract** - DTO and Zod schema in `packages/shared/src/<feature>/`, exported from its
   `index.ts`. Both sides parse with the same schema.
2. **Schema** - entity in `db/entities/` plus a migration, if a new table is involved.
3. **Repository** - a named query function in `repositories/<name>.repository.ts`, exported
   with its own type (`export type FindX = ...`).
4. **Service** - business rules in `services/<feature>.service.ts`, taking that type as a dep.
5. **Controller** - validate, call the service, map the result, in
   `controllers/<feature>.controller.ts`.
6. **Route** - path, middleware and controller in `routes/<feature>.routes.ts`.
7. **Wire** - mount the router in `app.ts`; build the real dependencies in `index.ts`.
8. **Test** - a service unit test and a route `supertest` test, at minimum.

### Why this shape, and what it is not

Layer-first folders were chosen over feature modules (`modules/auth/...`) because the folder
tree is then the architecture diagram, and because the root `CLAUDE.md` already pins entities to
`db/entities/` - feature modules would split every feature across the tree anyway.

Deliberate non-goals:

- **No DI container.** Factories are hand-wired in `index.ts`. If that wiring grows past about
  40 lines, it moves to a single `src/composition.ts` - not to a library.
- **No generic validation middleware for endpoints with typed errors.** Auth's Zod issue
  messages _are_ `AuthErrorCode`s, so the controller parses and maps them. A generic
  `validateBody(schema)` middleware may be added for endpoints that only ever need a plain 400.
- **No repository base class or generic CRUD layer.** Repositories are named functions for the
  queries the app actually makes.
- **No ORM abstraction.** TypeORM is used directly, inside `repositories/` only.
- **Entities never leave the API.** Importing them from `shared` or `web` would pull TypeORM
  and its decorators into the browser bundle.

### Status

The layer folders above are the target for all new code. `src/auth/` still holds the older
layout (`login-service.ts`, `user-repository.ts`, `token.ts`, `password.ts`) and is scheduled to
be converted; until it is, treat this section - not that folder - as the pattern to copy.

## First-time setup

Requirements: Node >= 24, pnpm, Docker. Run everything from the repo root.

```bash
# 1. Environment + database (Postgres 18, data stored in ./pg-data)
cp .env.example .env
docker compose up -d db        # wait until `docker compose ps` shows "healthy"

# 2. Dependencies and workspace packages
pnpm install
pnpm build                     # builds @acenz/shared etc.; the API imports them from dist/

# 3. Create the schema (runs the InitialSchema migration; tables are empty)
pnpm --filter @acenz/api migration:run

# 4. Start everything (API on :3000, web on :5173)
pnpm dev
```

Check `http://localhost:3000/api/health`: it reports `degraded` until the API connects to the DB.

**Optional: load existing data.** Ask a teammate for a `.dump` made by `db:export` and put it in
`apps/api/backups/` (git-ignored). With the schema already created in step 3, restore only the rows:

```bash
pnpm --filter @acenz/api db:import backups/<file>.dump -c acenz2-db-1 --data-only
```

The container name is `acenz2-db-1` when the repo folder is called `acenz2`; check with
`docker compose ps`. `--data-only` fits a dump taken after the InitialSchema migration, and it needs
the schema to exist first (otherwise `pg_restore` fails on missing tables).

Notes:

- **Do not run `migration:run` on a database that already has these tables** (for example after a
  full schema + data import): the migration fails with `relation ... already exists`. On a fresh
  database always use `migration:run` followed by `--data-only`.
- **Start over from an empty database:** `docker compose down`, delete `./pg-data`,
  `docker compose up -d db`, then repeat step 3. This destroys all local data, so export first.
- Later schema changes go through migrations only (`synchronize` is off):
  `migration:generate src/db/migrations/<Name>`, `migration:run`, `migration:revert`.

## Database export / import (Docker)

Helper scripts in [`scripts/`](scripts/) dump and restore a PostgreSQL database
running in a Docker container. They talk to the container through `docker exec`,
so no Postgres client tools or passwords are needed on the host.

Requirements: Docker running, and the target Postgres container up.

The container name is **required** on every command (`-c, --container <name>`); there is no
default. Find it with `docker ps`. Data is always read from / written to the database inside
the container you name, so double-check you are pointing at the right one (for example this
repo's `docker-compose.yml` creates `acenz2-db-1`, which is a different container from any other
project's Postgres).

Run the commands from `apps/api`, or from the repo root with
`pnpm --filter @acenz/api db:export ...`.

### Export

```bash
# -> backups/<timestamp>.dump
pnpm db:export -c <container>
# custom output path
pnpm db:export -c <container> --out backups/my.dump
# plain .sql instead of custom format
pnpm db:export -c <container> --plain
```

Dumps are written to `apps/api/backups/` (git-ignored). If the export fails, the partial file
is removed.

**What a dump contains**

- Schema and data: `CREATE TABLE`, constraints, indexes, sequences, views, functions, triggers,
  `CREATE EXTENSION`, plus all table data.
- The default format is `pg_dump -Fc` (compressed, binary). It is restored with `pg_restore`.
  To inspect the SQL inside without restoring:
  `docker exec -i <container> pg_restore --schema-only -f - < backups/my.dump`
  (drop `--schema-only` to include the data).
- `--plain` writes human-readable SQL (`CREATE TABLE ...` + `COPY ...`). It is much larger
  than the `.dump` (roughly 4x in our tests).

**What a dump does not contain**

- `CREATE DATABASE`: the target database must already exist (use `--create` on import).
- Roles/users and, because of `--no-owner --no-acl`, object owners and `GRANT`/`REVOKE`.
  This lets the dump be restored under any user; restored objects belong to the user
  running the import.

### Import

```bash
# restore into the container's default DB
pnpm db:import backups/my.dump -c <container>
# create the DB first if it does not exist
pnpm db:import backups/my.dump -c <container> --db other_db --create
# drop existing objects before restoring (asks for confirmation)
pnpm db:import backups/my.dump -c <container> --clean
# same, without the confirmation prompt
pnpm db:import backups/my.dump -c <container> --clean --yes
```

- `--data-only` restores rows only, into a schema you created beforehand with `migration:run`.
  It runs `pg_restore --data-only --disable-triggers`: tables are not loaded in foreign-key order,
  so FK checks are suspended during the load (this needs a superuser, which the container's
  `POSTGRES_USER` is). It works only with `.dump` files, and cannot be combined with `--clean`.
- Files ending in `.sql` are loaded with `psql`; anything else is restored with `pg_restore`.
- The import stops on the first error. Restoring into a database that already contains the same
  objects fails unless you use `--clean`.

### Cleaning the database before import

`--clean` runs `pg_restore --clean --if-exists`: before creating each object in the dump it
drops the object with the same name, if present. It is **destructive** and asks you to type
`yes` unless `--yes` is passed.

Limitations:

- It only drops objects that exist in the dump. Tables/views that exist in the database but not
  in the dump are left untouched, so you may end up with a mix of old and new objects.
- It has no effect on `.sql` files (`--plain` dumps).

For a fully clean database, recreate it (stop apps connected to it first, and take a backup
before running anything destructive):

```bash
# Option 1: drop and recreate the database
docker exec <container> sh -c 'dropdb -U $POSTGRES_USER --force <db> && createdb -U $POSTGRES_USER <db>'
pnpm db:import backups/my.dump -c <container> --db <db>

# Option 2: keep the database, wipe the public schema
docker exec <container> sh -c 'psql -U $POSTGRES_USER -d <db> -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"'
pnpm db:import backups/my.dump -c <container> --db <db>
```

`dropdb --force` disconnects any open connections.

### Options

| Option                   | Env var   | Default                     |
| ------------------------ | --------- | --------------------------- |
| `-c, --container <name>` | -         | **required**                |
| `-d, --db <name>`        | `PG_DB`   | container's `POSTGRES_DB`   |
| `-U, --user <name>`      | `PG_USER` | container's `POSTGRES_USER` |

`db:export` also accepts `-o, --out <file>` and `--plain`;
`db:import` also accepts `-f, --file <file>` (or pass the file as the first argument),
`--create`, `--clean`, `--data-only` and `-y, --yes`. Run either script with `--help` for the full list.
