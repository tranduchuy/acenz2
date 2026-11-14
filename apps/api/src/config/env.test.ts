import { describe, expect, it } from "vitest";
import { loadEnv } from "./env";

describe("loadEnv", () => {
  it("loadEnv parses valid env", () => {
    const env = loadEnv({
      DATABASE_URL: "postgres://u:p@localhost:5432/db",
      API_PORT: "4000",
      NODE_ENV: "production",
    });
    expect(env).toEqual({
      DATABASE_URL: "postgres://u:p@localhost:5432/db",
      API_PORT: 4000,
      NODE_ENV: "production",
    });
  });

  it("loadEnv applies defaults", () => {
    const env = loadEnv({ DATABASE_URL: "postgres://u:p@localhost:5432/db" });
    expect(env.API_PORT).toBe(3000);
    expect(env.NODE_ENV).toBe("development");
  });

  it("loadEnv throws listing missing keys", () => {
    expect(() => loadEnv({})).toThrow(/DATABASE_URL/);
  });
});
