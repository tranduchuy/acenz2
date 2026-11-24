import express, { type ErrorRequestHandler } from "express";
import type { LoginFn } from "./auth/login-service";
import { createAuthRouter } from "./routes/auth";
import { createHealthRouter, type DbCheck } from "./routes/health";

export type { DbCheck };

export function createApp(deps: { checkDb: DbCheck; login: LoginFn }): express.Express {
  const app = express();
  // Before the global JSON parser: the auth router parses its own body and maps errors to login codes.
  app.use("/api/auth", createAuthRouter(deps.login));
  app.use(express.json());
  app.use("/api", createHealthRouter(deps.checkDb));

  const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  };
  app.use(errorHandler);

  return app;
}
