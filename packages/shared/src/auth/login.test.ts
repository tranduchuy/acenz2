import { describe, expect, it } from "vitest";
import { AUTH_ERROR, AUTH_ERROR_STATUS } from "./login";

describe("login error codes", () => {
  it("defines exactly the five login codes", () => {
    expect(Object.values(AUTH_ERROR).sort()).toEqual([
      "AUTH_ACCOUNT_LOCKED",
      "AUTH_EMAIL_REQUIRED",
      "AUTH_INTERNAL_ERROR",
      "AUTH_INVALID_CREDENTIALS",
      "AUTH_PASSWORD_REQUIRED",
    ]);
  });

  it("maps each code to its HTTP status", () => {
    expect(AUTH_ERROR_STATUS).toEqual({
      AUTH_EMAIL_REQUIRED: 400,
      AUTH_PASSWORD_REQUIRED: 400,
      AUTH_INVALID_CREDENTIALS: 401,
      AUTH_ACCOUNT_LOCKED: 403,
      AUTH_INTERNAL_ERROR: 500,
    });
  });
});
