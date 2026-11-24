import { describe, expect, it } from "vitest";
import { createFindUserByEmail } from "./user.repository";

function fakes(opts: { failInit?: boolean } = {}) {
  const calls: string[] = [];
  const ds = {
    getRepository: () => ({
      findOne: async () => {
        calls.push("findOne");
        return null;
      },
    }),
  };
  const ensureInitialized = async () => {
    calls.push("ensureInitialized");
    if (opts.failInit) throw new Error("db down");
  };
  return { calls, find: createFindUserByEmail(ds as never, ensureInitialized) };
}

describe("createFindUserByEmail", () => {
  it("initialises the data source before querying", async () => {
    const { calls, find } = fakes();
    await find("a@x.com");
    expect(calls).toEqual(["ensureInitialized", "findOne"]);
  });

  it("rejects without querying when initialisation fails", async () => {
    const { calls, find } = fakes({ failInit: true });
    await expect(find("a@x.com")).rejects.toThrow("db down");
    expect(calls).toEqual(["ensureInitialized"]);
  });
});
