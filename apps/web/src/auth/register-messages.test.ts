import { describe, expect, it } from "vitest";
import { registerErrorMessage } from "./register-messages";

describe("registerErrorMessage", () => {
  it.each([
    ["AUTH_NAME_REQUIRED", "name", "Vui lòng nhập họ và tên"],
    ["AUTH_EMAIL_REQUIRED", "email", "Vui lòng nhập email"],
    ["AUTH_EMAIL_INVALID", "email", "Email không đúng định dạng"],
    ["AUTH_PHONE_REQUIRED", "phone", "Vui lòng nhập số điện thoại"],
    ["AUTH_PHONE_INVALID", "phone", "Số điện thoại không hợp lệ"],
    ["AUTH_PASSWORD_REQUIRED", "password", "Vui lòng nhập mật khẩu"],
    ["AUTH_CONFIRM_PASSWORD_REQUIRED", "confirmPassword", "Vui lòng nhập xác nhận mật khẩu"],
    ["AUTH_PASSWORD_MISMATCH", "confirmPassword", "Mật khẩu xác nhận không khớp với mật khẩu"],
    ["AUTH_EMAIL_EXISTS", "email", "Email này đã tồn tại trong hệ thống"],
    ["AUTH_INTERNAL_ERROR", "form", "Có lỗi xảy ra, vui lòng thử lại"],
  ])("maps %s to the %s message", (code, field, message) => {
    expect(registerErrorMessage(code)).toEqual({ field, message });
  });

  it.each(["WHATEVER", "AUTH_INVALID_CREDENTIALS", null])("falls back to the generic form message for %j", (code) => {
    expect(registerErrorMessage(code)).toEqual({ field: "form", message: "Có lỗi xảy ra, vui lòng thử lại" });
  });
});
