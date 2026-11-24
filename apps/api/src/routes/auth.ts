import express, { Router } from "express";
import type { LoginFn } from "../auth/login-service";
import { createAuthController } from "../controllers/auth.controller";

/** Mounted at `/api/auth`. Parses its own JSON so body errors map to login codes, not the app's generic 500. */
export function createAuthRouter(login: LoginFn): Router {
  const controller = createAuthController(login);
  const router = Router();
  router.use(express.json());
  router.post("/login", controller.login);
  router.use(controller.handleError);
  return router;
}
