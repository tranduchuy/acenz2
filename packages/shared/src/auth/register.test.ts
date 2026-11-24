import { describe, expect, it } from "vitest";
import { RegisterRequestSchema } from "./register";

const valid = {
  name: "Nguyen Van A",
  email: "a@x.com",
  phone: "0901234567",
  password: "P",
  confirmPassword: "P",
};

const codesOf = (body: unknown): string[] => {
  const r = RegisterRequestSchema.safeParse(body);
  return r.success ? [] : r.error.issues.map((i) => i.message);
};
const codeOf = (body: unknown): string | null => codesOf(body)[0] ?? null;
const withField = (field: string, value: unknown) => {
  const { [field as keyof typeof valid]: _drop, ...rest } = valid;
  return value === undefined ? rest : { ...rest, [field]: value };
};

describe("RegisterRequestSchema", () => {
  it("accepts a valid body, trims name/email/phone and keeps both passwords exactly as typed", () => {
    expect(
      RegisterRequestSchema.parse({
        name: "  Nguyen Van A ",
        email: " a@x.com ",
        phone: " 0901234567 ",
        password: " P ",
        confirmPassword: " P ",
      }),
    ).toEqual({ ...valid, password: " P ", confirmPassword: " P " });
  });

  it.each([undefined, null, "x", [], {}])("reports AUTH_NAME_REQUIRED for the body %j", (body) => {
    expect(codeOf(body)).toBe("AUTH_NAME_REQUIRED");
  });

  it.each([
    ["name", "", "AUTH_NAME_REQUIRED"],
    ["name", "   ", "AUTH_NAME_REQUIRED"],
    ["name", 5, "AUTH_NAME_REQUIRED"],
    ["name", null, "AUTH_NAME_REQUIRED"],
    ["name", [], "AUTH_NAME_REQUIRED"],
    ["name", undefined, "AUTH_NAME_REQUIRED"],
    ["email", "", "AUTH_EMAIL_REQUIRED"],
    ["email", 5, "AUTH_EMAIL_REQUIRED"],
    ["email", null, "AUTH_EMAIL_REQUIRED"],
    ["email", undefined, "AUTH_EMAIL_REQUIRED"],
    ["email", "abc", "AUTH_EMAIL_INVALID"],
    ["email", "a@", "AUTH_EMAIL_INVALID"],
    ["email", "@x.com", "AUTH_EMAIL_INVALID"],
    ["email", "a b@x.com", "AUTH_EMAIL_INVALID"],
    ["phone", "", "AUTH_PHONE_REQUIRED"],
    ["phone", 5, "AUTH_PHONE_REQUIRED"],
    ["phone", null, "AUTH_PHONE_REQUIRED"],
    ["phone", undefined, "AUTH_PHONE_REQUIRED"],
    ["phone", "12345", "AUTH_PHONE_INVALID"],
    ["phone", "090123456", "AUTH_PHONE_INVALID"],
    ["phone", "090123456789", "AUTH_PHONE_INVALID"],
    ["phone", "0901-234-567", "AUTH_PHONE_INVALID"],
    ["phone", "+84901234567", "AUTH_PHONE_INVALID"],
    ["phone", "09012345a7", "AUTH_PHONE_INVALID"],
    ["password", "", "AUTH_PASSWORD_REQUIRED"],
    ["password", 5, "AUTH_PASSWORD_REQUIRED"],
    ["password", null, "AUTH_PASSWORD_REQUIRED"],
    ["password", undefined, "AUTH_PASSWORD_REQUIRED"],
    ["confirmPassword", "", "AUTH_CONFIRM_PASSWORD_REQUIRED"],
    ["confirmPassword", 5, "AUTH_CONFIRM_PASSWORD_REQUIRED"],
    ["confirmPassword", null, "AUTH_CONFIRM_PASSWORD_REQUIRED"],
    ["confirmPassword", undefined, "AUTH_CONFIRM_PASSWORD_REQUIRED"],
    ["confirmPassword", "Q", "AUTH_PASSWORD_MISMATCH"],
  ])("with %s = %j the first code is %s", (field, value, code) => {
    expect(codeOf(withField(field, value))).toBe(code);
  });

  it.each(["0901234567", "09012345678"])("accepts the phone %s (10 or 11 digits)", (phone) => {
    expect(codesOf({ ...valid, phone })).toEqual([]);
  });

  it("reports the earlier field first when several are bad", () => {
    expect(codeOf({ ...valid, name: "", email: "abc" })).toBe("AUTH_NAME_REQUIRED");
    expect(codeOf({ ...valid, email: "abc", phone: "" })).toBe("AUTH_EMAIL_INVALID");
    expect(codeOf({ ...valid, phone: "12345", password: "" })).toBe("AUTH_PHONE_INVALID");
  });

  it("still reports the password mismatch when another field is also bad, after it", () => {
    const codes = codesOf({ ...valid, name: "", confirmPassword: "Q" });
    expect(codes).toContain("AUTH_NAME_REQUIRED");
    expect(codes).toContain("AUTH_PASSWORD_MISMATCH");
    expect(codes.indexOf("AUTH_NAME_REQUIRED")).toBeLessThan(codes.indexOf("AUTH_PASSWORD_MISMATCH"));
  });

  it("does not add a mismatch when the confirmation is empty", () => {
    expect(codesOf({ ...valid, confirmPassword: "" })).toEqual(["AUTH_CONFIRM_PASSWORD_REQUIRED"]);
  });
});
