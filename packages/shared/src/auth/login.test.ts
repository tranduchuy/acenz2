import { describe, expect, it } from "vitest";
import { AUTH_ERROR, AUTH_ERROR_STATUS, LoginRequestSchema } from "./login";

describe("auth error codes", () => {
  it("defines the five login codes and the seven register codes", () => {
    expect(Object.values(AUTH_ERROR).sort()).toEqual([
      "AUTH_ACCOUNT_LOCKED",
      "AUTH_CONFIRM_PASSWORD_REQUIRED",
      "AUTH_EMAIL_EXISTS",
      "AUTH_EMAIL_INVALID",
      "AUTH_EMAIL_REQUIRED",
      "AUTH_INTERNAL_ERROR",
      "AUTH_INVALID_CREDENTIALS",
      "AUTH_NAME_REQUIRED",
      "AUTH_PASSWORD_MISMATCH",
      "AUTH_PASSWORD_REQUIRED",
      "AUTH_PHONE_INVALID",
      "AUTH_PHONE_REQUIRED",
    ]);
  });

  it("maps each code to its HTTP status", () => {
    expect(AUTH_ERROR_STATUS).toEqual({
      AUTH_EMAIL_REQUIRED: 400,
      AUTH_PASSWORD_REQUIRED: 400,
      AUTH_INVALID_CREDENTIALS: 401,
      AUTH_ACCOUNT_LOCKED: 403,
      AUTH_INTERNAL_ERROR: 500,
      AUTH_NAME_REQUIRED: 400,
      AUTH_EMAIL_INVALID: 400,
      AUTH_PHONE_REQUIRED: 400,
      AUTH_PHONE_INVALID: 400,
      AUTH_CONFIRM_PASSWORD_REQUIRED: 400,
      AUTH_PASSWORD_MISMATCH: 400,
      AUTH_EMAIL_EXISTS: 409,
    });
  });
});

describe("LoginRequestSchema", () => {
  const codeOf = (body: unknown) => {
    const r = LoginRequestSchema.safeParse(body);
    return r.success ? null : r.error.issues[0]!.message;
  };

  it("accepts a valid body and trims only the email", () => {
    expect(LoginRequestSchema.parse({ email: "  a@x.com ", password: " P " })).toEqual({ email: "a@x.com", password: " P " });
  });

  it.each([undefined, null, "x", [], {}, { password: "P" }, { email: "   ", password: "P" }, { email: 5, password: "P" }])(
    "reports AUTH_EMAIL_REQUIRED for %j",
    (body) => expect(codeOf(body)).toBe("AUTH_EMAIL_REQUIRED"),
  );

  it.each([{ email: "a@x.com" }, { email: "a@x.com", password: "" }, { email: "a@x.com", password: 1 }])(
    "reports AUTH_PASSWORD_REQUIRED for %j",
    (body) => expect(codeOf(body)).toBe("AUTH_PASSWORD_REQUIRED"),
  );

  it("reports the email first when both are bad", () => {
    expect(codeOf({})).toBe("AUTH_EMAIL_REQUIRED");
  });
});
