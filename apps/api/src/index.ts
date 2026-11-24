import "reflect-metadata";
import { createApp } from "./app";
import { createAuthService } from "./services/auth.service";
import { hashPassword, verifyPassword } from "./utils/password";
import { createTokenIssuer } from "./services/token.service";
import { createCreateUser, createFindUserByEmail } from "./repositories/user.repository";
import { loadEnv, type Env } from "./config/env";
import { createDbCheck } from "./db/check-db";
import { createDataSource } from "./db/create-data-source";
import { createEnsureInitialized } from "./db/ensure-initialized";
import { startServer } from "./server";

async function main(): Promise<void> {
  let env: Env;
  try {
    env = loadEnv(process.env);
  } catch (err) {
    console.error((err as Error).message);
    process.exit(1);
  }

  const dataSource = createDataSource(env);
  const ensureInitialized = createEnsureInitialized(dataSource);
  const checkDb = createDbCheck(dataSource, ensureInitialized);
  const authService = createAuthService({
    findUserByEmail: createFindUserByEmail(dataSource, ensureInitialized),
    verifyPassword,
    hashPassword,
    createUser: createCreateUser(dataSource, ensureInitialized),
    issueToken: createTokenIssuer({ secret: env.JWT_SECRET, expiresInSeconds: env.JWT_EXPIRES_IN_SECONDS }),
  });

  // Do not block startup on the database: /api/health reports "degraded" until it is reachable.
  void checkDb().then((up) => {
    if (!up) console.error("Database is not reachable yet; will retry on /api/health checks.");
  });

  try {
    await startServer(createApp({ checkDb, authService }), env.API_PORT);
  } catch (err) {
    console.error(`Failed to listen on port ${env.API_PORT}: ${(err as Error).message}`);
    process.exit(1);
  }
  console.log(`API listening on http://localhost:${env.API_PORT}`);
}

void main();
