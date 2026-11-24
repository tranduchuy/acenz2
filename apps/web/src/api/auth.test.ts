import { describe, expect, it } from "vitest";
import { login } from "./auth";

type Call = { url: string; init?: RequestInit };

function respond(body: unknown, status: number, calls: Call[] = []) {
  return (async (url: string, init?: RequestInit) => {
    calls.push({ url, init });
    return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
  }) as typeof fetch;
}

describe("login", () => {
  it("returns the token on 200 and posts JSON credentials", async () => {
    const calls: Call[] = [];
    await expect(login("a@x.com", "P", respond({ token: "t" }, 200, calls))).resolves.toEqual({ ok: true, token: "t" });
    expect(calls[0].url).toBe("/api/auth/login");
    expect(calls[0].init?.method).toBe("POST");
    expect(new Headers(calls[0].init?.headers).get("Content-Type")).toBe("application/json");
    expect(JSON.parse(String(calls[0].init?.body))).toEqual({ email: "a@x.com", password: "P" });
  });

  it.each([
    [400, "AUTH_EMAIL_REQUIRED"],
    [400, "AUTH_PASSWORD_REQUIRED"],
    [401, "AUTH_INVALID_CREDENTIALS"],
    [403, "AUTH_ACCOUNT_LOCKED"],
    [500, "AUTH_INTERNAL_ERROR"],
    [418, "SOMETHING_NEW"],
  ])("returns the code from a %i response (%s)", async (status, code) => {
    await expect(login("a@x.com", "P", respond({ code }, status))).resolves.toEqual({ ok: false, code });
  });

  it.each([{}, { token: "" }, { token: 1 }])("returns code null for a 200 body without a usable token: %j", async (body) => {
    await expect(login("a@x.com", "P", respond(body, 200))).resolves.toEqual({ ok: false, code: null });
  });

  it("returns code null for a non-JSON response", async () => {
    const html = (async () => new Response("<html>Bad Gateway</html>", { status: 502 })) as typeof fetch;
    await expect(login("a@x.com", "P", html)).resolves.toEqual({ ok: false, code: null });
  });

  it("returns code null on a network error", async () => {
    const failing = (async () => {
      throw new TypeError("Failed to fetch");
    }) as typeof fetch;
    await expect(login("a@x.com", "P", failing)).resolves.toEqual({ ok: false, code: null });
  });
});
