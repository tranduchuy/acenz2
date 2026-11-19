"use strict";
const { spawn } = require("node:child_process");
const { parseArgs } = require("node:util");

// Shell snippets run INSIDE the container: fall back to the container's own
// POSTGRES_USER / POSTGRES_DB when no override is given, so no credentials
// need to be known on the host.
const PG_USER = "${PG_USER_OVERRIDE:-$POSTGRES_USER}";
const PG_DB = "${PG_DB_OVERRIDE:-$POSTGRES_DB}";

function parse(options) {
  // Some pnpm versions forward the `--` separator to the script; drop it so
  // `pnpm db:export -- -c x` and `pnpm db:export -c x` behave the same.
  const argv = process.argv.slice(2);
  if (argv[0] === "--") argv.shift();
  return parseArgs({
    args: argv,
    options: {
      container: { type: "string", short: "c" },
      db: { type: "string", short: "d" },
      user: { type: "string", short: "U" },
      help: { type: "boolean", short: "h" },
      ...options,
    },
    allowPositionals: true,
  });
}

function dockerExecArgs(values, { interactive = false } = {}) {
  const container = values.container;
  if (!container) {
    console.error("Missing required option: --container <name>. List containers with: docker ps");
    process.exit(2);
  }
  const db = values.db ?? process.env.PG_DB;
  const user = values.user ?? process.env.PG_USER;
  const args = ["exec"];
  if (interactive) args.push("-i");
  if (db) args.push("-e", `PG_DB_OVERRIDE=${db}`);
  if (user) args.push("-e", `PG_USER_OVERRIDE=${user}`);
  args.push(container);
  return { container, args };
}

/** Run `docker <args>` wiring the given stdio; resolves with the exit code. */
function runDocker(args, stdio) {
  return new Promise((resolve, reject) => {
    const child = spawn("docker", args, { stdio });
    child.on("error", reject);
    child.on("close", (code) => resolve(code ?? 1));
  });
}

async function assertContainerRunning(container) {
  const code = await runDocker(
    ["inspect", "--type", "container", "-f", "{{.State.Running}}", container],
    ["ignore", "ignore", "ignore"],
  );
  if (code !== 0) {
    console.error(
      `Container "${container}" not found or docker unavailable. Check with: docker ps`,
    );
    process.exit(1);
  }
}

/** Run an async main(); print the error message (no stack) and exit 1 on failure. */
function run(main) {
  main().catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  });
}

module.exports = {
  PG_DB,
  PG_USER,
  assertContainerRunning,
  dockerExecArgs,
  parse,
  run,
  runDocker,
};
