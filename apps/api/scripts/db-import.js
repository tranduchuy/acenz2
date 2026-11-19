#!/usr/bin/env node
// Import a dump file (made by db:export) into a PostgreSQL database in a docker container.
//
//   pnpm --filter @acenz/api db:import backups/my.dump -c <container> [--db hcl] [--clean] [--yes]
//
// *.sql  -> psql (plain SQL)
// other  -> pg_restore (custom/tar format)
// --clean drops existing objects before restoring (DESTRUCTIVE; asks to confirm).
"use strict";
const { spawn } = require("node:child_process");
const { createReadStream, existsSync } = require("node:fs");
const { resolve } = require("node:path");
const { createInterface } = require("node:readline/promises");
const {
  PG_DB,
  PG_USER,
  assertContainerRunning,
  dockerExecArgs,
  parse,
  run,
  runDocker,
} = require("./db-common");

const HELP = `Usage: db:import <file> [options]

  -c, --container <name>  Docker container name (required)
  -d, --db <name>         Target database (default: $PG_DB or container's POSTGRES_DB)
  -U, --user <name>       Postgres user (default: $PG_USER or container's POSTGRES_USER)
  -f, --file <file>       Dump file (or pass as first argument)
      --create            Create the target database first if it does not exist
      --clean             Drop existing objects before restoring (destructive)
  -y, --yes               Skip the confirmation prompt
  -h, --help
`;

async function main() {
  const { values, positionals } = parse({
    file: { type: "string", short: "f" },
    create: { type: "boolean" },
    clean: { type: "boolean" },
    yes: { type: "boolean", short: "y" },
  });
  if (values.help) {
    console.log(HELP);
    return;
  }

  const fileArg = values.file ?? positionals[0];
  if (!fileArg) {
    console.error(HELP);
    process.exit(2);
  }
  const file = resolve(fileArg);
  if (!existsSync(file)) {
    console.error(`File not found: ${file}`);
    process.exit(2);
  }

  const { container, args } = dockerExecArgs(values, { interactive: true });
  await assertContainerRunning(container);

  const dbLabel = values.db ?? process.env.PG_DB ?? "(container's POSTGRES_DB)";
  if (values.clean && !values.yes) {
    const rl = createInterface({ input: process.stdin, output: process.stderr });
    const answer = await rl.question(
      `--clean will DROP existing objects in "${dbLabel}" on ${container}. Type "yes" to continue: `,
    );
    rl.close();
    if (answer.trim().toLowerCase() !== "yes") {
      console.error("Aborted.");
      process.exit(1);
    }
  }

  if (values.create) {
    const create = `createdb -U "${PG_USER}" "${PG_DB}" 2>&1 | grep -v 'already exists' || true`;
    const code = await runDocker([...args, "sh", "-c", create], ["ignore", "inherit", "inherit"]);
    if (code !== 0) process.exit(code);
  }

  const isSql = file.toLowerCase().endsWith(".sql");
  const script = isSql
    ? `psql -U "${PG_USER}" -d "${PG_DB}" -v ON_ERROR_STOP=1 -q`
    : `pg_restore -U "${PG_USER}" -d "${PG_DB}" --no-owner --no-acl --exit-on-error${
        values.clean ? " --clean --if-exists" : ""
      }`;

  console.error(`Importing ${file} -> ${container}/${dbLabel}`);
  const child = spawn("docker", [...args, "sh", "-c", script], {
    stdio: ["pipe", "inherit", "inherit"],
  });
  createReadStream(file).pipe(child.stdin);
  // Ignore EPIPE if the restore exits early; the exit code reports the failure.
  child.stdin.on("error", () => {});

  const code = await new Promise((res, rej) => {
    child.on("error", rej);
    child.on("close", (c) => res(c ?? 1));
  });
  if (code !== 0) {
    console.error(`Import failed (exit ${code}).`);
    process.exit(code);
  }
  console.error("Import completed.");
}

run(main);
