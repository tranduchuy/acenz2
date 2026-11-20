import type { DataSource } from "typeorm";
import type { DbCheck } from "../routes/health";
import { createEnsureInitialized } from "./ensure-initialized";

type CheckableDataSource = Pick<DataSource, "isInitialized" | "initialize" | "query">;

export function createDbCheck(
  dataSource: CheckableDataSource,
  ensureInitialized: () => Promise<void> = createEnsureInitialized(dataSource),
): DbCheck {
  return async () => {
    try {
      await ensureInitialized();
      await dataSource.query("SELECT 1");
      return true;
    } catch {
      return false;
    }
  };
}
