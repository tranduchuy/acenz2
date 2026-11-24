import type { ErrorRequestHandler, RequestHandler } from "express";
import {
  AUTH_ERROR,
  AUTH_ERROR_STATUS,
  LoginRequestSchema,
  type AuthErrorCode,
  type LoginSuccess,
} from "@acenz/shared";
import type { AuthService } from "../services/auth.service";
import { sendError } from "../utils/send-error";

const fail = (res: Parameters<typeof sendError>[0], code: AuthErrorCode) => sendError(res, AUTH_ERROR_STATUS[code], code);

export interface AuthController {
  login: RequestHandler;
  handleError: ErrorRequestHandler;
}

export function createAuthController(authService: AuthService): AuthController {
  const login: RequestHandler = async (req, res) => {
    const parsed = LoginRequestSchema.safeParse(req.body);
    // Schema issue messages are AuthErrorCodes (see LoginRequestSchema).
    if (!parsed.success) return fail(res, parsed.error.issues[0]!.message as AuthErrorCode);

    const result = await authService.login(parsed.data.email, parsed.data.password);
    if (!result.ok) return fail(res, result.code);
    const body: LoginSuccess = { token: result.token };
    res.status(200).json(body);
  };

  // Logs the error only, never the request body (it holds the password).
  const handleError: ErrorRequestHandler = (err: { type?: string }, _req, res, _next) => {
    if (err?.type === "entity.parse.failed") return fail(res, AUTH_ERROR.EMAIL_REQUIRED);
    console.error(err);
    fail(res, AUTH_ERROR.INTERNAL_ERROR);
  };

  return { login, handleError };
}
