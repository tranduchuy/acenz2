import express, { Router } from "express";
import type { AuthController } from "../controllers/auth.controller";

/** Mounted at `/api/auth`. Parses its own JSON so body errors map to auth codes, not the app's generic 500. */
export function createAuthRouter(controller: AuthController): Router {
  const router = Router();
  router.use(express.json());
  router.post("/login", controller.login);
  router.post("/register", controller.register);
  router.use(controller.handleError);
  return router;
}
