import bcrypt from "bcryptjs";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DUMMY_HASH } from "../constants/auth.constants";
import { hashPassword, verifyPassword } from "./password";
import { FIXTURE_HASH_2Y, FIXTURE_PASSWORD } from "./test-fixtures";

afterEach(() => vi.restoreAllMocks());

describe("hashPassword", () => {
  it("returns a 60-char bcrypt hash that is not the plain password", async () => {
    const hash = await hashPassword(FIXTURE_PASSWORD);
    expect(hash).toHaveLength(60);
    expect(hash.startsWith("$2")).toBe(true);
    expect(hash).not.toContain(FIXTURE_PASSWORD);
  });

  it("uses cost 10", async () => {
    expect((await hashPassword(FIXTURE_PASSWORD)).startsWith("$2b$10$")).toBe(true);
  });

  it("round-trips through verifyPassword, and a wrong password does not match", async () => {
    const hash = await hashPassword(FIXTURE_PASSWORD);
    await expect(verifyPassword(FIXTURE_PASSWORD, hash)).resolves.toBe(true);
    await expect(verifyPassword("other", hash)).resolves.toBe(false);
  });

  it("keeps spaces at the ends of the password", async () => {
    const hash = await hashPassword(" S3cret! ");
    await expect(verifyPassword(" S3cret! ", hash)).resolves.toBe(true);
    await expect(verifyPassword("S3cret!", hash)).resolves.toBe(false);
  });

  it("salts: the same password hashes differently twice", async () => {
    expect(await hashPassword("P")).not.toBe(await hashPassword("P"));
  });
});

describe("verifyPassword", () => {
  it("accepts the right password for a $2y$10$ hash", async () => {
    await expect(verifyPassword(FIXTURE_PASSWORD, FIXTURE_HASH_2Y)).resolves.toBe(true);
  });

  it("rejects a wrong password", async () => {
    await expect(verifyPassword("wrong", FIXTURE_HASH_2Y)).resolves.toBe(false);
  });

  it.each(["", null, undefined, 123, "x".repeat(59), "x".repeat(61)])(
    "returns false for unusable stored value %j, comparing against the dummy hash only",
    async (stored) => {
      const compare = vi.spyOn(bcrypt, "compare");
      await expect(verifyPassword(FIXTURE_PASSWORD, stored)).resolves.toBe(false);
      // Same bcrypt cost as a real check, so a missing hash isn't revealed by response time.
      expect(compare).toHaveBeenCalledTimes(1);
      expect(compare).toHaveBeenCalledWith(FIXTURE_PASSWORD, DUMMY_HASH);
    },
  );

  it("DUMMY_HASH is a usable 60-char hash", async () => {
    expect(DUMMY_HASH).toHaveLength(60);
    await expect(verifyPassword("anything", DUMMY_HASH)).resolves.toBe(false);
  });
});
