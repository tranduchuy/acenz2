import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../../", import.meta.url));
export const E2E_DB_NAME = "acenz_e2e";

function readEnvFile(path: string): Record<string, string> {
  if (!existsSync(path)) return {};
  return Object.fromEntries(
    readFileSync(path, "utf8")
      .split(/\r?\n/)
      .map((l) => l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/))
      .filter((m): m is RegExpMatchArray => m !== null)
      .map((m) => [m[1], m[2]]),
  );
}

/** Dev DATABASE_URL: process env, else root `.env`, else the `.env.example` default. */
function devDatabaseUrl(): string {
  return (
    process.env.DATABASE_URL ??
    readEnvFile(`${ROOT}.env`).DATABASE_URL ??
    readEnvFile(`${ROOT}.env.example`).DATABASE_URL ??
    "postgres://acenz:acenz@localhost:5432/acenz"
  );
}

function withDatabase(url: string, db: string): string {
  const u = new URL(url);
  u.pathname = `/${db}`;
  return u.toString();
}

/** Same server and credentials as dev, separate database, so dev data is never touched. */
export const E2E_DATABASE_URL = withDatabase(devDatabaseUrl(), E2E_DB_NAME);
/** Maintenance connection used to create the e2e database. */
export const ADMIN_DATABASE_URL = withDatabase(devDatabaseUrl(), "postgres");
