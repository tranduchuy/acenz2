# @acenz/api

Express + TypeORM API.

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
`--create`, `--clean` and `-y, --yes`. Run either script with `--help` for the full list.
