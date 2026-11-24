import express, { type ErrorRequestHandler } from "express";
import { createAuthController } from "./controllers/auth.controller";
import type { AuthService } from "./services/auth.service";
import { createAuthRouter } from "./routes/auth.routes";
import { createHealthRouter, type DbCheck } from "./routes/health";

export type { DbCheck };

export function createApp(deps: { checkDb: DbCheck; authService: AuthService }): express.Express {
  const app = express();
  // Before the global JSON parser: the auth router parses its own body and maps errors to login codes.
  app.use("/api/auth", createAuthRouter(createAuthController(deps.authService)));
  app.use(express.json());
  app.use("/api", createHealthRouter(deps.checkDb));

  const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  };
  app.use(errorHandler);

  return app;
}
