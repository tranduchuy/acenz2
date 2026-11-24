import request from "supertest";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createApp } from "../app";
import type { LoginFn, LoginResult } from "../auth/login-service";

afterEach(() => vi.restoreAllMocks());

function appWith(result: LoginResult | Error) {
  const login = vi.fn<LoginFn>(async () => {
    if (result instanceof Error) throw result;
    return result;
  });
  return { app: createApp({ checkDb: async () => true, login }), login };
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
