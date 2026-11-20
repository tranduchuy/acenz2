import type { DataSource } from "typeorm";

type InitializableDataSource = Pick<DataSource, "isInitialized" | "initialize">;

/**
 * Lazily initialises the DataSource. Concurrent callers share one in-flight initialize()
 * (TypeORM throws if it runs twice); a failure clears it so the next call retries.
 */
export function createEnsureInitialized(dataSource: InitializableDataSource): () => Promise<void> {
  let initPromise: Promise<unknown> | undefined;

  return async () => {
    if (dataSource.isInitialized) return;
    initPromise ??= dataSource.initialize().finally(() => {
      initPromise = undefined;
    });
    await initPromise;
  };
}
