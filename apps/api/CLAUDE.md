# CLAUDE.md — @acenz/api

## Read the architecture first

**Before writing or changing any file under `apps/api/src/`, read the "Architecture" section of
[`apps/api/README.md`](README.md).** It is the first section of that file. Do this before
planning, before creating a file and before editing an existing one — not afterwards as a check.

If a change you are about to make does not fit that architecture, stop and say so instead of
inventing a variation.

## The layer chain

```
routes/ → middlewares/ → controllers/ → services/ → repositories/ → db/entities/
```

One direction only. No layer calls upwards, no layer is skipped.

| Folder          | Holds                                                   | Suffix                       |
| --------------- | ------------------------------------------------------- | ---------------------------- |
| `routes/`       | paths, verbs, middleware wiring. No logic.              | `auth.routes.ts`             |
| `middlewares/`  | cross-cutting: auth guard, body parsing, error mapping  | `require-auth.middleware.ts` |
| `controllers/`  | validate (Zod from `@acenz/shared`) → one service → DTO | `auth.controller.ts`         |
| `services/`     | business rules. No express, no TypeORM.                 | `auth.service.ts`            |
| `repositories/` | the only place TypeORM queries are written              | `user.repository.ts`         |
| `db/entities/`  | TypeORM table mappings                                  | `User.ts` (PascalCase)       |
| `utils/`        | pure functions: no business rules, no DB, no env reads  | `password.ts`                |
| `constants/`    | API-internal constant values only                       | `auth.constants.ts`          |

## Hard rules

- **A controller must never import a repository, an entity, or `typeorm`.** It calls a service.
- **A service must never import express, `typeorm`, or an entity as a value.** It receives data
  access as injected functions (`findUserByEmail`), so its tests run with fakes and no Postgres.
- **A route must never import a service or repository.** It wires middleware to a controller.
- **TypeORM queries exist only in `repositories/`.** Nowhere else calls `getRepository`.
- **Entities stay in `apps/api/src/db/entities`** and are never imported from `shared` or `web`.
- **Every layer file exports a `create*` factory** that takes its dependencies. No module-level
  singletons; `index.ts` is the only composition root.
- **HTTP-contract constants go in `packages/shared`, not `src/constants/`.** If the web app
  reads it (error codes, status maps), `shared` owns it. `src/constants/` is API-internal only.
- **A new endpoint follows the 8 steps** in README "Adding an endpoint", in that order, and
  lands with a service unit test plus a `supertest` route test.

## Known exceptions

The login chain follows the architecture; copy it. These older pieces do not, so do not copy their
shape: `db/check-db.ts` (a TypeORM query outside `repositories/`, and an import from
`routes/health.ts`) and `routes/health.ts` (handler inline in the route, no controller). Copy the
README architecture instead.
