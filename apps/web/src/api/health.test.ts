import { describe, expect, it } from "vitest";
import { SchemaValidationError } from "@acenz/shared";
import { fetchHealth } from "./health";

const json = (body: unknown, status: number) =>
  (async () =>
    new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    })) as typeof fetch;

const now = () => new Date().toISOString();

describe("fetchHealth", () => {
  it("fetchHealth returns parsed body on 200", async () => {
    const body = { status: "ok", db: "up", timestamp: now() };
    await expect(fetchHealth(json(body, 200))).resolves.toEqual(body);
  });

  it("fetchHealth returns degraded body on 503", async () => {
    const body = { status: "degraded", db: "down", timestamp: now() };
    const result = await fetchHealth(json(body, 503));
    expect(result.db).toBe("down");
    expect(result.status).toBe("degraded");
  });

  it("fetchHealth rejects on schema mismatch", async () => {
    await expect(fetchHealth(json({ foo: 1 }, 200))).rejects.toBeInstanceOf(SchemaValidationError);
  });

  it("fetchHealth rejects on network error", async () => {
    const failing = (async () => {
      throw new TypeError("Failed to fetch");
    }) as typeof fetch;
    await expect(fetchHealth(failing)).rejects.toBeInstanceOf(TypeError);
  });
});
