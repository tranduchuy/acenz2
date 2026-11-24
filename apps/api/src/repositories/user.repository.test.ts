import { inspect } from "node:util";
import { describe, expect, it } from "vitest";
import { createCreateUser, createFindUserByEmail } from "./user.repository";

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

const NEW_USER = { email: "a@x.com", passwordHash: "hash", firstName: "Nguyen Van A", phone: "0901234567" };

function insertFakes(opts: { insert?: () => Promise<unknown>; failInit?: boolean } = {}) {
  const calls: string[] = [];
  const inserted: unknown[] = [];
  const ds = {
    getRepository: () => ({
      insert: async (values: unknown) => {
        calls.push("insert");
        inserted.push(values);
        return opts.insert ? opts.insert() : { identifiers: [{ id: "42" }] };
      },
    }),
  };
  const ensureInitialized = async () => {
    calls.push("ensureInitialized");
    if (opts.failInit) throw new Error("db down");
  };
  return { calls, inserted, create: createCreateUser(ds as never, ensureInitialized) };
}

describe("createCreateUser", () => {
  it("initialises the data source, then inserts, and returns the new user", async () => {
    const { calls, create } = insertFakes();
    await expect(create(NEW_USER)).resolves.toEqual({
      ok: true,
      user: { id: "42", email: "a@x.com", passwordHash: "hash", isLocked: false },
    });
    expect(calls).toEqual(["ensureInitialized", "insert"]);
  });

  it("inserts a student with the given columns and no id", async () => {
    const { inserted, create } = insertFakes();
    await create(NEW_USER);
    expect(inserted).toEqual([
      { email: "a@x.com", passwordHash: "hash", firstName: "Nguyen Van A", phone: "0901234567", role: "student", isLocked: false },
    ]);
  });

  it("reports email-exists when the email unique index rejects the insert", async () => {
    const { create } = insertFakes({
      insert: () => Promise.reject({ driverError: { code: "23505", constraint: "users_email_lower_key" } }),
    });
    await expect(create(NEW_USER)).resolves.toEqual({ ok: false, reason: "email-exists" });
  });

  it("fails with an error naming the Postgres code for a unique violation of another constraint", async () => {
    const err = { driverError: { code: "23505", constraint: "users_slug_key", message: "duplicate key value" } };
    const { create } = insertFakes({ insert: () => Promise.reject(err) });
    await expect(create(NEW_USER)).rejects.toThrow(/23505/);
  });

  it("fails with the original message for any other failure", async () => {
    const { create } = insertFakes({ insert: () => Promise.reject(new Error("connection reset")) });
    await expect(create(NEW_USER)).rejects.toThrow(/connection reset/);
  });

  // TypeORM's QueryFailedError keeps the query parameters, and Node prints them when the error is logged.
  // The insert parameters include the bcrypt hash, so what is thrown must not carry them.
  it("never lets the password hash travel with a failed insert", async () => {
    const hash = "$2b$10$SECRETHASHSECRETHASHSECRETHASHSECRETHASHSECRETHASHSECRE";
    const failure = Object.assign(new Error("connection reset"), {
      query: "INSERT INTO users(...) VALUES ($1, $2)",
      parameters: ["a@x.com", hash],
      driverError: { code: "08006", parameters: [hash] },
    });
    const { create } = insertFakes({ insert: () => Promise.reject(failure) });
    const thrown = await create({ ...NEW_USER, passwordHash: hash }).catch((e: unknown) => e);
    expect(thrown).toBeInstanceOf(Error);
    expect(inspect(thrown, { depth: 10 })).not.toContain(hash);
    expect(JSON.stringify(thrown, Object.getOwnPropertyNames(thrown))).not.toContain(hash);
  });

  it("rejects without inserting when initialisation fails", async () => {
    const { calls, create } = insertFakes({ failInit: true });
    await expect(create(NEW_USER)).rejects.toThrow("db down");
    expect(calls).toEqual(["ensureInitialized"]);
  });
});
