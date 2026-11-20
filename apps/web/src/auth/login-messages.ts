import { AUTH_ERROR, type AuthErrorCode } from "@acenz/shared";

/** Where the message goes on the login form: under a field, or in the banner above the fields. */
export type LoginMessage = { field: "email" | "password" | "form"; message: string };

const GENERIC: LoginMessage = { field: "form", message: "Có lỗi xảy ra, vui lòng thử lại" };

const MESSAGES: Record<AuthErrorCode, LoginMessage> = {
  [AUTH_ERROR.EMAIL_REQUIRED]: { field: "email", message: "Vui lòng nhập email" },
  [AUTH_ERROR.PASSWORD_REQUIRED]: { field: "password", message: "Vui lòng nhập mật khẩu" },
  [AUTH_ERROR.INVALID_CREDENTIALS]: { field: "form", message: "Email hoặc mật khẩu không đúng" },
  [AUTH_ERROR.ACCOUNT_LOCKED]: { field: "form", message: "Tài khoản đã bị khóa" },
  [AUTH_ERROR.INTERNAL_ERROR]: GENERIC,
};

/** Unknown codes and `null` (no server answer) get the generic message. */
export function loginErrorMessage(code: string | null): LoginMessage {
  return (code !== null && Object.hasOwn(MESSAGES, code) ? MESSAGES[code as AuthErrorCode] : undefined) ?? GENERIC;
}
