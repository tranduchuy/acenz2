import { describe, expect, it } from "vitest";
import { HealthResponseSchema } from "./health";

describe("HealthResponseSchema", () => {
  it("accepts valid payload", () => {
    const result = HealthResponseSchema.safeParse({
      status: "ok",
      db: "up",
      timestamp: new Date().toISOString(),
    });
    expect(result.success).toBe(true);
  });

  it("rejects unknown status", () => {
    const result = HealthResponseSchema.safeParse({
      status: "broken",
      db: "up",
      timestamp: new Date().toISOString(),
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-ISO timestamp", () => {
    const result = HealthResponseSchema.safeParse({
      status: "ok",
      db: "up",
      timestamp: "yesterday",
    });
    expect(result.success).toBe(false);
  });
});
