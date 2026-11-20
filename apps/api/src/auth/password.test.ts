import bcrypt from "bcryptjs";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DUMMY_HASH, verifyPassword } from "./password";
import { FIXTURE_HASH_2Y, FIXTURE_PASSWORD } from "./test-fixtures";

afterEach(() => vi.restoreAllMocks());

describe("verifyPassword", () => {
  it("accepts the right password for a $2y$10$ hash", async () => {
    await expect(verifyPassword(FIXTURE_PASSWORD, FIXTURE_HASH_2Y)).resolves.toBe(true);
  });

  it("rejects a wrong password", async () => {
    await expect(verifyPassword("wrong", FIXTURE_HASH_2Y)).resolves.toBe(false);
  });

  it.each(["", null, undefined, 123, "x".repeat(59), "x".repeat(61)])(
    "returns false for unusable stored value %j without calling bcrypt",
    async (stored) => {
      const compare = vi.spyOn(bcrypt, "compare");
      await expect(verifyPassword(FIXTURE_PASSWORD, stored)).resolves.toBe(false);
      expect(compare).not.toHaveBeenCalled();
    },
  );

  it("DUMMY_HASH is a usable 60-char hash", async () => {
    expect(DUMMY_HASH).toHaveLength(60);
    await expect(verifyPassword("anything", DUMMY_HASH)).resolves.toBe(false);
  });
});
