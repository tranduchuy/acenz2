import { describe, expect, it, vi } from "vitest";
import { createAuthService } from "./auth.service";
import { DUMMY_HASH } from "../constants/auth.constants";
import type { CreateUserResult, LoginUser } from "../repositories/user.repository";

const user = (over: Partial<LoginUser> = {}): LoginUser => ({
  id: "1",
  email: "a@x.com",
  passwordHash: "good-hash",
  isLocked: false,
  ...over,
});

function setup(found: LoginUser | null, created: CreateUserResult = { ok: true, user: user({ id: "7" }) }) {
  const findUserByEmail = vi.fn(async (_email: string) => found);
  const verifyPassword = vi.fn(async (plain: string, stored: unknown) => stored === "good-hash" && plain === "P");
  const issueToken = vi.fn((_user: LoginUser) => "placeholder-token");
  const hashPassword = vi.fn(async (_plain: string) => "hashed");
  const createUser = vi.fn(async (_input: unknown) => created);
  const { login, register } = createAuthService({ findUserByEmail, verifyPassword, issueToken, hashPassword, createUser });
  return { login, register, findUserByEmail, verifyPassword, issueToken, hashPassword, createUser };
}

describe("createAuthService", () => {
  it("returns a token for the right password", async () => {
    const { login } = setup(user());
    await expect(login("a@x.com", "P")).resolves.toEqual({ ok: true, token: "placeholder-token" });
  });

  it("rejects an unknown email and still runs a dummy compare", async () => {
    const { login, verifyPassword } = setup(null);
    await expect(login("nobody@x.com", "P")).resolves.toEqual({ ok: false, code: "AUTH_INVALID_CREDENTIALS" });
    expect(verifyPassword).toHaveBeenCalledWith("P", DUMMY_HASH);
  });

  it("rejects a wrong password", async () => {
    const { login } = setup(user());
    await expect(login("a@x.com", "wrong")).resolves.toEqual({ ok: false, code: "AUTH_INVALID_CREDENTIALS" });
  });

  it("rejects a user without a password hash", async () => {
    const { login } = setup(user({ passwordHash: null }));
    await expect(login("a@x.com", "P")).resolves.toEqual({ ok: false, code: "AUTH_INVALID_CREDENTIALS" });
  });

  it("rejects a locked account with the right password", async () => {
    const { login, issueToken } = setup(user({ isLocked: true }));
    await expect(login("a@x.com", "P")).resolves.toEqual({ ok: false, code: "AUTH_ACCOUNT_LOCKED" });
    expect(issueToken).not.toHaveBeenCalled();
  });

  it("gives a locked account with a wrong password the same answer as any wrong password", async () => {
    const { login } = setup(user({ isLocked: true }));
    await expect(login("a@x.com", "wrong")).resolves.toEqual({ ok: false, code: "AUTH_INVALID_CREDENTIALS" });
  });

  it("looks the user up by the trimmed email", async () => {
    const { login, findUserByEmail } = setup(user());
    await login("  a@x.com ", "P");
    expect(findUserByEmail).toHaveBeenCalledWith("a@x.com");
  });

  it("propagates lookup failures", async () => {
    const { login, findUserByEmail } = setup(null);
    findUserByEmail.mockRejectedValueOnce(new Error("db down"));
    await expect(login("a@x.com", "P")).rejects.toThrow("db down");
  });
});

describe("register", () => {
  const input = { name: "Nguyen Van A", email: "a@x.com", phone: "0901234567", password: "P" };

  it("creates the user from the hashed password and returns a token for the new user", async () => {
    const created = user({ id: "7" });
    const { register, findUserByEmail, hashPassword, createUser, issueToken } = setup(null, { ok: true, user: created });
    await expect(register(input)).resolves.toEqual({ ok: true, token: "placeholder-token" });
    expect(findUserByEmail).toHaveBeenCalledWith("a@x.com");
    expect(hashPassword).toHaveBeenCalledWith("P");
    expect(createUser).toHaveBeenCalledWith({ email: "a@x.com", passwordHash: "hashed", firstName: "Nguyen Van A", phone: "0901234567" });
    expect(JSON.stringify(createUser.mock.calls)).not.toContain('"P"');
    expect(issueToken).toHaveBeenCalledWith(created);
  });

  it("rejects an email that already exists without hashing or inserting", async () => {
    const { register, hashPassword, createUser, issueToken } = setup(user());
    await expect(register(input)).resolves.toEqual({ ok: false, code: "AUTH_EMAIL_EXISTS" });
    expect(hashPassword).not.toHaveBeenCalled();
    expect(createUser).not.toHaveBeenCalled();
    expect(issueToken).not.toHaveBeenCalled();
  });

  it("answers AUTH_EMAIL_EXISTS when the insert loses a race, and issues no token", async () => {
    const { register, issueToken } = setup(null, { ok: false, reason: "email-exists" });
    await expect(register(input)).resolves.toEqual({ ok: false, code: "AUTH_EMAIL_EXISTS" });
    expect(issueToken).not.toHaveBeenCalled();
  });

  it.each(["findUserByEmail", "hashPassword", "createUser"] as const)("propagates a failure of %s", async (dep) => {
    const s = setup(null);
    s[dep].mockRejectedValueOnce(new Error("boom"));
    await expect(s.register(input)).rejects.toThrow("boom");
    expect(s.issueToken).not.toHaveBeenCalled();
  });
});
