import { describe, expect, it } from "vitest";
import { loadEnv } from "./env";

const BASE = {
  DATABASE_URL: "postgres://u:p@localhost:5432/db",
  JWT_SECRET: "a-test-secret-that-is-at-least-32-chars",
};

describe("loadEnv", () => {
  it("loadEnv parses valid env", () => {
    const env = loadEnv({ ...BASE, API_PORT: "4000", JWT_EXPIRES_IN_SECONDS: "60", NODE_ENV: "production" });
    expect(env).toEqual({ ...BASE, API_PORT: 4000, JWT_EXPIRES_IN_SECONDS: 60, NODE_ENV: "production" });
  });

  it("loadEnv applies defaults", () => {
    const env = loadEnv(BASE);
    expect(env.API_PORT).toBe(3000);
    expect(env.JWT_EXPIRES_IN_SECONDS).toBe(3600);
    expect(env.NODE_ENV).toBe("development");
  });

  it("loadEnv throws listing missing keys", () => {
    expect(() => loadEnv({})).toThrow(/DATABASE_URL/);
    expect(() => loadEnv({})).toThrow(/JWT_SECRET/);
  });

  it("loadEnv rejects a short JWT_SECRET", () => {
    expect(() => loadEnv({ ...BASE, JWT_SECRET: "short" })).toThrow(/JWT_SECRET/);
  });
});
