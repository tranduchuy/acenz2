/** Login error codes. The API returns only the code; the web app owns the display text. */
export const AUTH_ERROR = {
  EMAIL_REQUIRED: "AUTH_EMAIL_REQUIRED",
  PASSWORD_REQUIRED: "AUTH_PASSWORD_REQUIRED",
  INVALID_CREDENTIALS: "AUTH_INVALID_CREDENTIALS",
  ACCOUNT_LOCKED: "AUTH_ACCOUNT_LOCKED",
  INTERNAL_ERROR: "AUTH_INTERNAL_ERROR",
} as const;

export type AuthErrorCode = (typeof AUTH_ERROR)[keyof typeof AUTH_ERROR];

export const AUTH_ERROR_STATUS: Record<AuthErrorCode, number> = {
  AUTH_EMAIL_REQUIRED: 400,
  AUTH_PASSWORD_REQUIRED: 400,
  AUTH_INVALID_CREDENTIALS: 401,
  AUTH_ACCOUNT_LOCKED: 403,
  AUTH_INTERNAL_ERROR: 500,
};

/** `POST /api/auth/login` request body. */
export type LoginRequest = { email: string; password: string };
/** 200 response body. */
export type LoginSuccess = { token: string };
/** Error response body (status from `AUTH_ERROR_STATUS`). */
export type LoginError = { code: AuthErrorCode };
