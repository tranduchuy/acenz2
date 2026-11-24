import { describe, expect, it } from "vitest";
import { createEnsureInitialized } from "./ensure-initialized";

function fakeDataSource(opts: { failInit?: boolean; initialized?: boolean } = {}) {
  const ds = {
    isInitialized: opts.initialized ?? false,
    initCalls: 0,
    async initialize() {
      ds.initCalls++;
      await new Promise((r) => setTimeout(r, 20));
      if (opts.failInit) throw new Error("connection refused");
      ds.isInitialized = true;
      return ds;
    },
  };
  return ds;
}

describe("createEnsureInitialized", () => {
  it("shares one initialize() across concurrent callers", async () => {
    const ds = fakeDataSource();
    const ensure = createEnsureInitialized(ds as never);
    await Promise.all([ensure(), ensure(), ensure()]);
    expect(ds.initCalls).toBe(1);
  });

  it("rejects on failure and retries on the next call", async () => {
    const ds = fakeDataSource({ failInit: true });
    const ensure = createEnsureInitialized(ds as never);
    await expect(ensure()).rejects.toThrow("connection refused");
    await expect(ensure()).rejects.toThrow("connection refused");
    expect(ds.initCalls).toBe(2);
  });

  it("does nothing when already initialized", async () => {
    const ds = fakeDataSource({ initialized: true });
    const ensure = createEnsureInitialized(ds as never);
    await ensure();
    expect(ds.initCalls).toBe(0);
  });
});
