import { describe, expect, it } from "vitest";
import { HealthResponseSchema } from "../dto/health";
import { SchemaValidationError, parseOrThrow } from "./parse";

describe("parseOrThrow", () => {
  it("parseOrThrow returns typed data", () => {
    const input = { status: "ok", db: "up", timestamp: new Date().toISOString() };
    expect(parseOrThrow(HealthResponseSchema, input)).toEqual(input);
  });

  it("parseOrThrow throws SchemaValidationError with issues", () => {
    let error: unknown;
    try {
      parseOrThrow(HealthResponseSchema, {});
    } catch (e) {
      error = e;
    }
    expect(error).toBeInstanceOf(SchemaValidationError);
    expect((error as SchemaValidationError).issues.length).toBeGreaterThan(0);
  });
});
