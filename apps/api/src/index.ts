import "reflect-metadata";
import { createApp } from "./app";
import { loadEnv, type Env } from "./config/env";
import { createDataSource } from "./db/create-data-source";

function main(): void {
  let env: Env;
  try {
    env = loadEnv(process.env);
  } catch (err) {
    console.error((err as Error).message);
    process.exit(1);
  }

  const dataSource = createDataSource(env);

  const checkDb = async (): Promise<boolean> => {
    try {
      if (!dataSource.isInitialized) {
        await dataSource.initialize();
      }
      await dataSource.query("SELECT 1");
      return true;
    } catch {
      return false;
    }
  };

  // Do not block startup on the database: /api/health reports "degraded" until it is reachable.
  void checkDb().then((up) => {
    if (!up) console.error("Database is not reachable yet; will retry on /api/health checks.");
  });

  createApp({ checkDb }).listen(env.API_PORT, () => {
    console.log(`API listening on http://localhost:${env.API_PORT}`);
  });
}

main();
