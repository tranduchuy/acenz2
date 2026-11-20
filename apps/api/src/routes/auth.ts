import express, { Router, type ErrorRequestHandler, type Response } from "express";
import { AUTH_ERROR, AUTH_ERROR_STATUS, type AuthErrorCode, type LoginError, type LoginSuccess } from "@acenz/shared";
import type { LoginFn } from "../auth/login-service";

function sendError(res: Response, code: AuthErrorCode): void {
  const body: LoginError = { code };
  res.status(AUTH_ERROR_STATUS[code]).json(body);
}

/** Mounted at `/api/auth`. Parses its own JSON so body errors map to login codes, not the app's generic 500. */
export function createAuthRouter(login: LoginFn): Router {
  const router = Router();
  router.use(express.json());

  router.post("/login", async (req, res) => {
    const { email, password } = (req.body ?? {}) as Record<string, unknown>;
    if (typeof email !== "string" || email.trim() === "") return sendError(res, AUTH_ERROR.EMAIL_REQUIRED);
    if (typeof password !== "string" || password === "") return sendError(res, AUTH_ERROR.PASSWORD_REQUIRED);

    const result = await login(email, password);
    if (!result.ok) return sendError(res, result.code);
    const body: LoginSuccess = { token: result.token };
    res.status(200).json(body);
  });

  // Logs the error only, never the request body (it holds the password).
  const errorHandler: ErrorRequestHandler = (err: { type?: string }, _req, res, _next) => {
    if (err?.type === "entity.parse.failed") return sendError(res, AUTH_ERROR.EMAIL_REQUIRED);
    console.error(err);
    sendError(res, AUTH_ERROR.INTERNAL_ERROR);
  };
  router.use(errorHandler);

  return router;
}
