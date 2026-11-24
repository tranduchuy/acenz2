import request from "supertest";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createApp } from "../app";
import type { LoginFn, LoginResult, RegisterFn } from "../services/auth.service";

afterEach(() => vi.restoreAllMocks());

function appWith(result: LoginResult | Error) {
  const login = vi.fn<LoginFn>(async () => {
    if (result instanceof Error) throw result;
    return result;
  });
  const register = vi.fn<RegisterFn>(async () => ({ ok: true, token: "unused" }));
  return { app: createApp({ checkDb: async () => true, authService: { login, register } }), login };
}

function registerApp(result: LoginResult | Error) {
  const register = vi.fn<RegisterFn>(async () => {
    if (result instanceof Error) throw result;
    return result;
  });
  const login = vi.fn<LoginFn>(async () => ({ ok: true, token: "unused" }));
  return { app: createApp({ checkDb: async () => true, authService: { login, register } }), register };
}

const post = (app: ReturnType<typeof createApp>) => request(app).post("/api/auth/login");

describe("POST /api/auth/login", () => {
  it("returns 200 with only the token", async () => {
    const { app, login } = appWith({ ok: true, token: "t" });
    const res = await post(app).send({ email: "a@x.com", password: "P" });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ token: "t" });
    expect(login).toHaveBeenCalledWith("a@x.com", "P");
  });

  it.each([{}, { password: "P" }, { email: "   ", password: "P" }, { email: 5, password: "P" }])(
    "returns 400 AUTH_EMAIL_REQUIRED for %j",
    async (body) => {
      const { app, login } = appWith({ ok: true, token: "t" });
      const res = await post(app).send(body);
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ code: "AUTH_EMAIL_REQUIRED" });
      expect(login).not.toHaveBeenCalled();
    },
  );

  it.each([{ email: "a@x.com" }, { email: "a@x.com", password: "" }, { email: "a@x.com", password: 1 }])(
    "returns 400 AUTH_PASSWORD_REQUIRED for %j",
    async (body) => {
      const { app, login } = appWith({ ok: true, token: "t" });
      const res = await post(app).send(body);
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ code: "AUTH_PASSWORD_REQUIRED" });
      expect(login).not.toHaveBeenCalled();
    },
  );

  it("returns 401 with only the code for invalid credentials", async () => {
    const { app } = appWith({ ok: false, code: "AUTH_INVALID_CREDENTIALS" });
    const res = await post(app).send({ email: "a@x.com", password: "P" });
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ code: "AUTH_INVALID_CREDENTIALS" });
  });

  it("returns 403 with no token for a locked account", async () => {
    const { app } = appWith({ ok: false, code: "AUTH_ACCOUNT_LOCKED" });
    const res = await post(app).send({ email: "a@x.com", password: "P" });
    expect(res.status).toBe(403);
    expect(res.body).toEqual({ code: "AUTH_ACCOUNT_LOCKED" });
  });

  it("returns 500 AUTH_INTERNAL_ERROR and never logs the password when login throws", async () => {
    const logged = vi.spyOn(console, "error").mockImplementation(() => {});
    const { app } = appWith(new Error("db down"));
    const res = await post(app).send({ email: "a@x.com", password: "S3cret!" });
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ code: "AUTH_INTERNAL_ERROR" });
    expect(logged).toHaveBeenCalled();
    const output = logged.mock.calls.map((args) => args.map((a) => (a instanceof Error ? a.stack : JSON.stringify(a))).join(" ")).join("\n");
    expect(output).not.toContain("S3cret!");
  });

  it("returns 400 AUTH_EMAIL_REQUIRED when there is no JSON body", async () => {
    const { app } = appWith({ ok: true, token: "t" });
    const res = await post(app).set("Content-Type", "text/plain").send("hello");
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ code: "AUTH_EMAIL_REQUIRED" });
  });

  it("returns 400 AUTH_EMAIL_REQUIRED for malformed JSON", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { app } = appWith({ ok: true, token: "t" });
    const res = await post(app).set("Content-Type", "application/json").send("{bad");
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ code: "AUTH_EMAIL_REQUIRED" });
  });
});

describe("POST /api/auth/register", () => {
  const body = { name: "Nguyen Van A", email: "a@x.com", phone: "0901234567", password: "P", confirmPassword: "P" };
  const postRegister = (app: ReturnType<typeof createApp>) => request(app).post("/api/auth/register");
  const OK = { ok: true, token: "t" } as const;

  it("returns 201 with only the token and passes the trimmed fields without confirmPassword", async () => {
    const { app, register } = registerApp(OK);
    const res = await postRegister(app).send({ ...body, name: "  Nguyen Van A ", email: " a@x.com ", phone: " 0901234567 " });
    expect(res.status).toBe(201);
    expect(res.body).toEqual({ token: "t" });
    expect(register).toHaveBeenCalledWith({ name: "Nguyen Van A", email: "a@x.com", phone: "0901234567", password: "P" });
  });

  it.each([
    ["no fields", {}, "AUTH_NAME_REQUIRED"],
    ["a blank name", { ...body, name: "  " }, "AUTH_NAME_REQUIRED"],
    ["an empty email", { ...body, email: "" }, "AUTH_EMAIL_REQUIRED"],
    ["the email abc", { ...body, email: "abc" }, "AUTH_EMAIL_INVALID"],
    ["an empty phone", { ...body, phone: "" }, "AUTH_PHONE_REQUIRED"],
    ["the phone 12345", { ...body, phone: "12345" }, "AUTH_PHONE_INVALID"],
    ["an empty password", { ...body, password: "" }, "AUTH_PASSWORD_REQUIRED"],
    ["an empty confirmation", { ...body, confirmPassword: "" }, "AUTH_CONFIRM_PASSWORD_REQUIRED"],
    ["a different confirmation", { ...body, confirmPassword: "Q" }, "AUTH_PASSWORD_MISMATCH"],
  ])("returns 400 with only the code for %s", async (_label, send, code) => {
    const { app, register } = registerApp(OK);
    const res = await postRegister(app).send(send);
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ code });
    expect(register).not.toHaveBeenCalled();
  });

  it("returns only the first error when several fields are bad", async () => {
    const { app } = registerApp(OK);
    const res = await postRegister(app).send({ ...body, name: "", email: "abc" });
    expect(res.body).toEqual({ code: "AUTH_NAME_REQUIRED" });
  });

  it("returns 409 AUTH_EMAIL_EXISTS when the service says so", async () => {
    const { app } = registerApp({ ok: false, code: "AUTH_EMAIL_EXISTS" });
    const res = await postRegister(app).send(body);
    expect(res.status).toBe(409);
    expect(res.body).toEqual({ code: "AUTH_EMAIL_EXISTS" });
  });

  it("returns 500 AUTH_INTERNAL_ERROR and never logs the passwords when the service throws", async () => {
    const logged = vi.spyOn(console, "error").mockImplementation(() => {});
    const { app } = registerApp(new Error("db down"));
    const res = await postRegister(app).send({ ...body, password: "S3cret!", confirmPassword: "S3cret!" });
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ code: "AUTH_INTERNAL_ERROR" });
    expect(logged).toHaveBeenCalled();
    const output = logged.mock.calls.map((args) => args.map((a) => (a instanceof Error ? a.stack : JSON.stringify(a))).join(" ")).join("\n");
    expect(output).not.toContain("S3cret!");
  });

  it("never puts a password or hash in any response", async () => {
    for (const result of [OK, { ok: false, code: "AUTH_EMAIL_EXISTS" } as const]) {
      const { app } = registerApp(result);
      const res = await postRegister(app).send({ ...body, password: "S3cret!", confirmPassword: "S3cret!" });
      expect(JSON.stringify(res.body)).not.toMatch(/password|S3cret|\$2/i);
    }
  });

  it("returns 400 AUTH_NAME_REQUIRED when there is no JSON body", async () => {
    const { app } = registerApp(OK);
    const res = await postRegister(app).set("Content-Type", "text/plain").send("hello");
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ code: "AUTH_NAME_REQUIRED" });
  });

  it("returns 400 AUTH_NAME_REQUIRED for malformed JSON, while login keeps AUTH_EMAIL_REQUIRED", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { app } = registerApp(OK);
    const res = await postRegister(app).set("Content-Type", "application/json").send("{bad");
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ code: "AUTH_NAME_REQUIRED" });
    const login = await post(app).set("Content-Type", "application/json").send("{bad");
    expect(login.body).toEqual({ code: "AUTH_EMAIL_REQUIRED" });
  });
});
