import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import pg from "pg";
import { ADMIN_DATABASE_URL, E2E_DATABASE_URL, E2E_DB_NAME } from "./db-url";
import { FIXTURE_DOMAIN, USERS } from "./fixtures/users";

const ROOT = fileURLToPath(new URL("../../", import.meta.url));

async function withClient<T>(url: string, fn: (c: pg.Client) => Promise<T>): Promise<T> {
  const client = new pg.Client({ connectionString: url });
  await client.connect();
  try {
    return await fn(client);
  } finally {
    await client.end();
  }
}

/** Creates `acenz_e2e` if needed, migrates it, and re-seeds the fixture users. */
export default async function globalSetup(): Promise<void> {
  await withClient(ADMIN_DATABASE_URL, async (c) => {
    const { rowCount } = await c.query("SELECT 1 FROM pg_database WHERE datname = $1", [E2E_DB_NAME]);
    if (!rowCount) await c.query(`CREATE DATABASE ${E2E_DB_NAME}`);
  });

  execSync("pnpm --filter @acenz/api migration:run", {
    cwd: ROOT,
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: E2E_DATABASE_URL },
  });

  await withClient(E2E_DATABASE_URL, async (c) => {
    await c.query("DELETE FROM users WHERE email LIKE $1", [`%@${FIXTURE_DOMAIN}`]);
    for (const u of Object.values(USERS)) {
      await c.query(
        `INSERT INTO users (email, password_hash, role, is_locked, deleted_at)
         VALUES ($1, $2, 'student', $3, CASE WHEN $4::boolean THEN now() END)`,
        [u.email, u.passwordHash, u.isLocked, u.deleted],
      );
    }
  });
}
