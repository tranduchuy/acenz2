import type { DataSource } from "typeorm";
import type { DbCheck } from "../routes/health";

type CheckableDataSource = Pick<DataSource, "isInitialized" | "initialize" | "query">;

// Concurrent callers share one in-flight initialize(); TypeORM throws if initialize() runs twice.
export function createDbCheck(dataSource: CheckableDataSource): DbCheck {
  let initPromise: Promise<unknown> | undefined;

  return async () => {
    try {
      if (!dataSource.isInitialized) {
        initPromise ??= dataSource.initialize().finally(() => {
          initPromise = undefined;
        });
        await initPromise;
      }
      await dataSource.query("SELECT 1");
      return true;
    } catch {
      return false;
    }
  };
}
