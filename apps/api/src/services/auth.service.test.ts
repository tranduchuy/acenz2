import { describe, expect, it, vi } from "vitest";
import { createLoginService } from "./auth.service";
import { DUMMY_HASH } from "../constants/auth.constants";
import type { LoginUser } from "../repositories/user.repository";

const user = (over: Partial<LoginUser> = {}): LoginUser => ({
  id: "1",
  email: "a@x.com",
  passwordHash: "good-hash",
  isLocked: false,
  ...over,
});

function setup(found: LoginUser | null) {
  const findUserByEmail = vi.fn(async (_email: string) => found);
  const verifyPassword = vi.fn(async (plain: string, stored: unknown) => stored === "good-hash" && plain === "P");
  const issueToken = vi.fn(() => "placeholder-token");
  const login = createLoginService({ findUserByEmail, verifyPassword, issueToken });
  return { login, findUserByEmail, verifyPassword, issueToken };
}

describe("createLoginService", () => {
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
