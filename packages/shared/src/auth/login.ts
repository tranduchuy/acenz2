import { z } from "zod";

/**
 * Auth error codes (login and register share one table). The API returns only the code;
 * the web app owns the display text. The register schema lives in `register.ts`.
 */
export const AUTH_ERROR = {
  EMAIL_REQUIRED: "AUTH_EMAIL_REQUIRED",
  PASSWORD_REQUIRED: "AUTH_PASSWORD_REQUIRED",
  INVALID_CREDENTIALS: "AUTH_INVALID_CREDENTIALS",
  ACCOUNT_LOCKED: "AUTH_ACCOUNT_LOCKED",
  INTERNAL_ERROR: "AUTH_INTERNAL_ERROR",
  NAME_REQUIRED: "AUTH_NAME_REQUIRED",
  EMAIL_INVALID: "AUTH_EMAIL_INVALID",
  PHONE_REQUIRED: "AUTH_PHONE_REQUIRED",
  PHONE_INVALID: "AUTH_PHONE_INVALID",
  CONFIRM_PASSWORD_REQUIRED: "AUTH_CONFIRM_PASSWORD_REQUIRED",
  PASSWORD_MISMATCH: "AUTH_PASSWORD_MISMATCH",
  EMAIL_EXISTS: "AUTH_EMAIL_EXISTS",
} as const;

export type AuthErrorCode = (typeof AUTH_ERROR)[keyof typeof AUTH_ERROR];

export const AUTH_ERROR_STATUS: Record<AuthErrorCode, number> = {
  AUTH_EMAIL_REQUIRED: 400,
  AUTH_PASSWORD_REQUIRED: 400,
  AUTH_INVALID_CREDENTIALS: 401,
  AUTH_ACCOUNT_LOCKED: 403,
  AUTH_INTERNAL_ERROR: 500,
  AUTH_NAME_REQUIRED: 400,
  AUTH_EMAIL_INVALID: 400,
  AUTH_PHONE_REQUIRED: 400,
  AUTH_PHONE_INVALID: 400,
  AUTH_CONFIRM_PASSWORD_REQUIRED: 400,
  AUTH_PASSWORD_MISMATCH: 400,
  AUTH_EMAIL_EXISTS: 409,
};

/**
 * `POST /api/auth/login` request body. Every issue message is an `AuthErrorCode`, so a failed parse maps
 * straight to the error response. Fields are checked in order (email first); a missing or non-object body
 * counts as a missing email. The email is trimmed, the password is left exactly as typed.
 */
export const LoginRequestSchema = z.object(
  {
    email: z
      .string({ error: AUTH_ERROR.EMAIL_REQUIRED })
      .trim()
      .min(1, { error: AUTH_ERROR.EMAIL_REQUIRED }),
    password: z
      .string({ error: AUTH_ERROR.PASSWORD_REQUIRED })
      .min(1, { error: AUTH_ERROR.PASSWORD_REQUIRED }),
  },
  { error: AUTH_ERROR.EMAIL_REQUIRED },
);
export type LoginRequest = z.infer<typeof LoginRequestSchema>;
/** 200 response body. */
export type LoginSuccess = { token: string };
/** Error response body (status from `AUTH_ERROR_STATUS`). */
export type LoginError = { code: AuthErrorCode };
