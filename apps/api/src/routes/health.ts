import { Router } from "express";
import { HealthResponseSchema, parseOrThrow, type HealthResponse } from "@acenz/shared";

export type DbCheck = () => Promise<boolean>;

export function createHealthRouter(checkDb: DbCheck): Router {
  const router = Router();

  router.get("/health", async (_req, res) => {
    let dbUp: boolean;
    try {
      dbUp = await checkDb();
    } catch {
      dbUp = false;
    }

    const body: HealthResponse = {
      status: dbUp ? "ok" : "degraded",
      db: dbUp ? "up" : "down",
      timestamp: new Date().toISOString(),
    };
    res.status(dbUp ? 200 : 503).json(parseOrThrow(HealthResponseSchema, body));
  });

  return router;
}
