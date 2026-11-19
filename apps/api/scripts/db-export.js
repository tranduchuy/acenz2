#!/usr/bin/env node
// Export a PostgreSQL database from a docker container to a local file.
//
//   pnpm --filter @acenz/api db:export -c <container> [--out backups/my.dump] [--db hcl] [--plain]
//
// Default format is pg_dump custom (-Fc, compressed, restore with db:import).
// --plain writes a plain .sql file instead.
"use strict";
const { spawn } = require("node:child_process");
const { createWriteStream, mkdirSync, rmSync, statSync } = require("node:fs");
const { dirname, resolve } = require("node:path");
const {
  PG_DB,
  PG_USER,
  assertContainerRunning,
  dockerExecArgs,
  parse,
  run,
} = require("./db-common");

const HELP = `Usage: db:export [options]

  -c, --container <name>  Docker container name (required)
  -d, --db <name>         Database (default: $PG_DB or container's POSTGRES_DB)
  -U, --user <name>       Postgres user (default: $PG_USER or container's POSTGRES_USER)
  -o, --out <file>        Output file (default: backups/<timestamp>.dump|.sql)
      --plain             Plain SQL instead of custom format
  -h, --help
`;

async function main() {
  const { values } = parse({
    out: { type: "string", short: "o" },
    plain: { type: "boolean" },
  });
  if (values.help) {
    console.log(HELP);
    return;
  }

  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const ext = values.plain ? "sql" : "dump";
  const out = resolve(values.out ?? resolve(__dirname, "..", "backups", `${stamp}.${ext}`));

  const { container, args } = dockerExecArgs(values);
  await assertContainerRunning(container);

  const format = values.plain ? "" : "-Fc";
  const script = `pg_dump -U "${PG_USER}" -d "${PG_DB}" ${format} --no-owner --no-acl`;

  mkdirSync(dirname(out), { recursive: true });
  const file = createWriteStream(out);
  console.error(`Exporting from ${container} -> ${out}`);

  const child = spawn("docker", [...args, "sh", "-c", script], {
    stdio: ["ignore", "pipe", "inherit"],
  });
  child.stdout.pipe(file);

  const code = await new Promise((res, rej) => {
    child.on("error", rej);
    child.on("close", (c) => res(c ?? 1));
  });
  await new Promise((res) => file.end(res));

  if (code !== 0) {
    rmSync(out, { force: true });
    console.error(`pg_dump failed (exit ${code}); partial file removed.`);
    process.exit(code);
  }
  console.error(`Done: ${out} (${(statSync(out).size / 1024).toFixed(1)} KiB)`);
}

run(main);
