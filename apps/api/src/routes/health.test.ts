import request from "supertest";
import { describe, expect, it } from "vitest";
import { HealthResponseSchema } from "@acenz/shared";
import { createApp } from "../app";

describe("GET /api/health", () => {
  it("returns 200 ok when db is up", async () => {
    const app = createApp({ checkDb: async () => true });
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(HealthResponseSchema.safeParse(res.body).success).toBe(true);
    expect(res.body.db).toBe("up");
    expect(res.body.status).toBe("ok");
  });

  it("returns 503 when db check fails", async () => {
    const app = createApp({ checkDb: async () => false });
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(503);
    expect(res.body.status).toBe("degraded");
    expect(res.body.db).toBe("down");
  });

  it("returns 503 when db check throws", async () => {
    const app = createApp({
      checkDb: async () => {
        throw new Error("connection refused");
      },
    });
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(503);
    expect(res.body.db).toBe("down");
  });
});
