import { describe, expect, it } from "vitest";
import { createDbCheck } from "./check-db";

function fakeDataSource(opts: { failInit?: boolean } = {}) {
  const ds = {
    isInitialized: false,
    initCalls: 0,
    async initialize() {
      ds.initCalls++;
      await new Promise((r) => setTimeout(r, 20));
      if (opts.failInit) throw new Error("connection refused");
      ds.isInitialized = true;
      return ds;
    },
    async query() {
      return [{ "?column?": 1 }];
    },
  };
  return ds;
}

describe("createDbCheck", () => {
  it("returns true for concurrent calls while initialize is in flight", async () => {
    const ds = fakeDataSource();
    const check = createDbCheck(ds as never);
    const results = await Promise.all([check(), check(), check()]);
    expect(results).toEqual([true, true, true]);
    expect(ds.initCalls).toBe(1);
  });

  it("returns false when initialize fails, and retries on the next call", async () => {
    const ds = fakeDataSource({ failInit: true });
    const check = createDbCheck(ds as never);
    await expect(check()).resolves.toBe(false);
    await expect(check()).resolves.toBe(false);
    expect(ds.initCalls).toBe(2);
  });
});
