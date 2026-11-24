import { AUTH_ERROR, type AuthErrorCode } from "@acenz/shared";

export type RegisterField = "name" | "email" | "phone" | "password" | "confirmPassword";

/** Where the message goes on the register form: under a field, or in the banner above the fields. */
export type RegisterMessage = { field: RegisterField | "form"; message: string };

const GENERIC: RegisterMessage = { field: "form", message: "Có lỗi xảy ra, vui lòng thử lại" };

// Partial: the login-only codes have no register message and fall back to the generic one.
const MESSAGES: Partial<Record<AuthErrorCode, RegisterMessage>> = {
  [AUTH_ERROR.NAME_REQUIRED]: { field: "name", message: "Vui lòng nhập họ và tên" },
  [AUTH_ERROR.EMAIL_REQUIRED]: { field: "email", message: "Vui lòng nhập email" },
  [AUTH_ERROR.EMAIL_INVALID]: { field: "email", message: "Email không đúng định dạng" },
  [AUTH_ERROR.PHONE_REQUIRED]: { field: "phone", message: "Vui lòng nhập số điện thoại" },
  [AUTH_ERROR.PHONE_INVALID]: { field: "phone", message: "Số điện thoại không hợp lệ" },
  [AUTH_ERROR.PASSWORD_REQUIRED]: { field: "password", message: "Vui lòng nhập mật khẩu" },
  [AUTH_ERROR.CONFIRM_PASSWORD_REQUIRED]: { field: "confirmPassword", message: "Vui lòng nhập xác nhận mật khẩu" },
  [AUTH_ERROR.PASSWORD_MISMATCH]: { field: "confirmPassword", message: "Mật khẩu xác nhận không khớp với mật khẩu" },
  [AUTH_ERROR.EMAIL_EXISTS]: { field: "email", message: "Email này đã tồn tại trong hệ thống" },
  [AUTH_ERROR.INTERNAL_ERROR]: GENERIC,
};

/** Unknown codes and `null` (no server answer) get the generic message. */
export function registerErrorMessage(code: string | null): RegisterMessage {
  return (code !== null && Object.hasOwn(MESSAGES, code) ? MESSAGES[code as AuthErrorCode] : undefined) ?? GENERIC;
}
