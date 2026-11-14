import express, { type ErrorRequestHandler } from "express";
import { createHealthRouter, type DbCheck } from "./routes/health";

export type { DbCheck };

export function createApp(deps: { checkDb: DbCheck }): express.Express {
  const app = express();
  app.use(express.json());
  app.use("/api", createHealthRouter(deps.checkDb));

  const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  };
  app.use(errorHandler);

  return app;
}
