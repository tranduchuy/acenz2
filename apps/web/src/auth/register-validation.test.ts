import { describe, expect, it } from "vitest";
import { validateRegister } from "./register-validation";

const valid = { name: "Nguyen Van A", email: "a@x.com", phone: "0901234567", password: "P", confirmPassword: "P" };

describe("validateRegister", () => {
  it("returns no errors for valid values", () => {
    expect(validateRegister(valid)).toEqual({});
  });

  it("reports every empty field at once", () => {
    expect(validateRegister({ name: "", email: "", phone: "", password: "", confirmPassword: "" })).toEqual({
      name: "Vui lòng nhập họ và tên",
      email: "Vui lòng nhập email",
      phone: "Vui lòng nhập số điện thoại",
      password: "Vui lòng nhập mật khẩu",
      confirmPassword: "Vui lòng nhập xác nhận mật khẩu",
    });
  });

  it("reports a password mismatch next to another field's error", () => {
    expect(validateRegister({ ...valid, name: "", confirmPassword: "Q" })).toEqual({
      name: "Vui lòng nhập họ và tên",
      confirmPassword: "Mật khẩu xác nhận không khớp với mật khẩu",
    });
  });

  it("reports an invalid email and an invalid phone, one message per field", () => {
    expect(validateRegister({ ...valid, email: "abc", phone: "12345" })).toEqual({
      email: "Email không đúng định dạng",
      phone: "Số điện thoại không hợp lệ",
    });
  });

  it("treats a blank name as missing", () => {
    expect(validateRegister({ ...valid, name: "   " })).toEqual({ name: "Vui lòng nhập họ và tên" });
  });
});
