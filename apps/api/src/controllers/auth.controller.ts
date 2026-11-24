import type { ErrorRequestHandler, RequestHandler } from "express";
import {
  AUTH_ERROR,
  AUTH_ERROR_STATUS,
  LoginRequestSchema,
  RegisterRequestSchema,
  type AuthErrorCode,
  type LoginSuccess,
  type RegisterSuccess,
} from "@acenz/shared";
import type { AuthService } from "../services/auth.service";
import { sendError } from "../utils/send-error";

const fail = (res: Parameters<typeof sendError>[0], code: AuthErrorCode) => sendError(res, AUTH_ERROR_STATUS[code], code);

export interface AuthController {
  login: RequestHandler;
  register: RequestHandler;
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

  const register: RequestHandler = async (req, res) => {
    const parsed = RegisterRequestSchema.safeParse(req.body);
    // Schema issue messages are AuthErrorCodes, in the order the server must report them (see RegisterRequestSchema).
    if (!parsed.success) return fail(res, parsed.error.issues[0]!.message as AuthErrorCode);

    const { name, email, phone, password } = parsed.data;
    const result = await authService.register({ name, email, phone, password });
    if (!result.ok) return fail(res, result.code);
    const body: RegisterSuccess = { token: result.token };
    res.status(201).json(body);
  };

  // Logs the error only, never the request body (it holds the password).
  const handleError: ErrorRequestHandler = (err: { type?: string }, req, res, _next) => {
    // An unreadable body counts as a missing first field: the email for login, the name for register.
    if (err?.type === "entity.parse.failed") {
      return fail(res, req.path === "/register" ? AUTH_ERROR.NAME_REQUIRED : AUTH_ERROR.EMAIL_REQUIRED);
    }
    console.error(err);
    fail(res, AUTH_ERROR.INTERNAL_ERROR);
  };

  return { login, register, handleError };
}
