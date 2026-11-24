import { describe, expect, it } from "vitest";
import { loginErrorMessage } from "./login-messages";

describe("loginErrorMessage", () => {
  it.each([
    ["AUTH_EMAIL_REQUIRED", "email", "Vui lòng nhập email"],
    ["AUTH_PASSWORD_REQUIRED", "password", "Vui lòng nhập mật khẩu"],
    ["AUTH_INVALID_CREDENTIALS", "form", "Email hoặc mật khẩu không đúng"],
    ["AUTH_ACCOUNT_LOCKED", "form", "Tài khoản đã bị khóa"],
    ["AUTH_INTERNAL_ERROR", "form", "Có lỗi xảy ra, vui lòng thử lại"],
  ])("maps %s to the %s message", (code, field, message) => {
    expect(loginErrorMessage(code)).toEqual({ field, message });
  });

  it.each(["WHATEVER", null])("falls back to the generic form message for %j", (code) => {
    expect(loginErrorMessage(code)).toEqual({ field: "form", message: "Có lỗi xảy ra, vui lòng thử lại" });
  });
});
