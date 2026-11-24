import { randomUUID } from "node:crypto";
import { expect, test, type APIRequestContext, type Page } from "@playwright/test";
import pg from "pg";
import { E2E_DATABASE_URL } from "../db-url";
import { FIXTURE_DOMAIN, FIXTURE_PASSWORD, USERS } from "../fixtures/users";

const REGISTER_API = "**/api/auth/register";
const GENERIC = "Có lỗi xảy ra, vui lòng thử lại";

/** Unique per call and inside FIXTURE_DOMAIN, so global-setup removes it on the next run. */
const uniqueEmail = (prefix = "reg") => `${prefix}-${randomUUID().slice(0, 12)}@${FIXTURE_DOMAIN}`;

async function query(sql: string, params: unknown[]) {
  const client = new pg.Client({ connectionString: E2E_DATABASE_URL });
  await client.connect();
  try {
    return (await client.query(sql, params)).rows;
  } finally {
    await client.end();
  }
}

const countUsers = async (email: string) =>
  Number((await query("SELECT count(*) AS n FROM users WHERE lower(email) = lower($1)", [email]))[0].n);

const body = (email: string, over: Record<string, unknown> = {}) => ({
  name: "Nguyen Van A",
  email,
  phone: "0901234567",
  password: FIXTURE_PASSWORD,
  confirmPassword: FIXTURE_PASSWORD,
  ...over,
});

const post = (request: APIRequestContext, data: unknown) => request.post("/api/auth/register", { data });

test.describe("POST /api/auth/register", () => {
  test("creates a student with a bcrypt hash and returns only a token", async ({ request }) => {
    const email = uniqueEmail();
    const res = await post(request, body(email, { name: "  Nguyen Van A  ", phone: " 0901234567 ", email: ` ${email} ` }));
    expect(res.status()).toBe(201);
    const json = await res.json();
    expect(Object.keys(json)).toEqual(["token"]);
    expect(typeof json.token).toBe("string");
    expect(json.token).not.toBe("");
    expect(JSON.stringify(json)).not.toMatch(/password|hash|\$2/i);

    const [row] = await query("SELECT role, first_name, middle_name, last_name, phone, password_hash, is_locked FROM users WHERE email = $1", [email]);
    expect(row.role).toBe("student");
    expect(row.is_locked).toBe(false);
    expect(row.first_name).toBe("Nguyen Van A");
    expect(row.middle_name).toBeNull();
    expect(row.last_name).toBeNull();
    expect(row.phone).toBe("0901234567");
    expect(row.password_hash).toHaveLength(60);
    expect(row.password_hash.startsWith("$2")).toBe(true);
    expect(row.password_hash).not.toContain(FIXTURE_PASSWORD);
  });

  test("the new account can log in with the password it registered", async ({ request }) => {
    const email = uniqueEmail();
    expect((await post(request, body(email))).status()).toBe(201);
    const login = await request.post("/api/auth/login", { data: { email, password: FIXTURE_PASSWORD } });
    expect(login.status()).toBe(200);
  });

  test("keeps spaces at the ends of the password exactly", async ({ request }) => {
    const email = uniqueEmail();
    const password = " S3cret! ";
    expect((await post(request, body(email, { password, confirmPassword: password }))).status()).toBe(201);
    expect((await request.post("/api/auth/login", { data: { email, password } })).status()).toBe(200);
    expect((await request.post("/api/auth/login", { data: { email, password: "S3cret!" } })).status()).toBe(401);
  });

  const invalid: [string, Record<string, unknown>, string][] = [
    ["an empty name", { name: "" }, "AUTH_NAME_REQUIRED"],
    ["an empty email", { email: "" }, "AUTH_EMAIL_REQUIRED"],
    ["the email abc", { email: "abc" }, "AUTH_EMAIL_INVALID"],
    ["an empty phone", { phone: "" }, "AUTH_PHONE_REQUIRED"],
    ["the phone 12345", { phone: "12345" }, "AUTH_PHONE_INVALID"],
    ["an empty password", { password: "" }, "AUTH_PASSWORD_REQUIRED"],
    ["an empty confirmation", { confirmPassword: "" }, "AUTH_CONFIRM_PASSWORD_REQUIRED"],
    ["a different confirmation", { confirmPassword: "Different1!" }, "AUTH_PASSWORD_MISMATCH"],
  ];
  for (const [label, over, code] of invalid) {
    test(`${label} gets 400 ${code} and creates no user`, async ({ request }) => {
      const email = uniqueEmail("bad");
      const res = await post(request, body(email, over));
      expect(res.status()).toBe(400);
      expect(await res.json()).toEqual({ code });
      expect(await countUsers(String(over.email ?? email))).toBe(0);
    });
  }

  test("an email that is already registered gets 409 and no second user", async ({ request }) => {
    const email = uniqueEmail();
    expect((await post(request, body(email))).status()).toBe(201);
    const res = await post(request, body(email));
    expect(res.status()).toBe(409);
    expect(await res.json()).toEqual({ code: "AUTH_EMAIL_EXISTS" });
    expect(await countUsers(email)).toBe(1);
  });

  test("two simultaneous requests with one email create exactly one user", async ({ request }) => {
    const email = uniqueEmail("race");
    const [a, b] = await Promise.all([post(request, body(email)), post(request, body(email))]);
    expect([a.status(), b.status()].sort()).toEqual([201, 409]);
    const loser = a.status() === 409 ? a : b;
    expect(await loser.json()).toEqual({ code: "AUTH_EMAIL_EXISTS" });
    expect(await countUsers(email)).toBe(1);
  });

  test("an email differing only by case is refused with 409, not a server error", async ({ request }) => {
    const email = uniqueEmail("case");
    expect((await post(request, body(email))).status()).toBe(201);
    const res = await post(request, body(email.toUpperCase()));
    expect(res.status()).toBe(409);
    expect(await res.json()).toEqual({ code: "AUTH_EMAIL_EXISTS" });
    expect(await countUsers(email)).toBe(1);
  });

  test("the email of a soft-deleted user is still taken", async ({ request }) => {
    const res = await post(request, body(USERS.deleted.email));
    expect(res.status()).toBe(409);
    expect(await res.json()).toEqual({ code: "AUTH_EMAIL_EXISTS" });
  });

  test("an unreadable body gets 400 AUTH_NAME_REQUIRED", async ({ request }) => {
    const text = await request.post("/api/auth/register", { headers: { "Content-Type": "text/plain" }, data: "hello" });
    expect(text.status()).toBe(400);
    expect(await text.json()).toEqual({ code: "AUTH_NAME_REQUIRED" });
    const broken = await request.post("/api/auth/register", { headers: { "Content-Type": "application/json" }, data: "{bad" });
    expect(broken.status()).toBe(400);
    expect(await broken.json()).toEqual({ code: "AUTH_NAME_REQUIRED" });
  });
});

async function fill(page: Page, values: Partial<Record<"name" | "email" | "phone" | "password" | "confirm", string>>) {
  if (values.name !== undefined) await page.getByLabel("Họ và tên").fill(values.name);
  if (values.email !== undefined) await page.getByLabel("Email").fill(values.email);
  if (values.phone !== undefined) await page.getByLabel("Số điện thoại").fill(values.phone);
  if (values.password !== undefined) await page.getByLabel("Mật khẩu", { exact: true }).fill(values.password);
  if (values.confirm !== undefined) await page.getByLabel("Xác nhận mật khẩu").fill(values.confirm);
}

const fillValid = (page: Page, email = uniqueEmail("ui")) =>
  fill(page, { name: "Nguyen Van A", email, phone: "0901234567", password: FIXTURE_PASSWORD, confirm: FIXTURE_PASSWORD });

const submitButton = (page: Page) => page.getByRole("button", { name: "Tạo tài khoản" });
const formError = (page: Page) => page.getByTestId("register-form-error");

test.describe("register page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/register");
  });

  test("registers with valid data and shows the success banner", async ({ page }) => {
    const email = uniqueEmail("ui");
    await fillValid(page, email);
    const response = page.waitForResponse(REGISTER_API);
    await submitButton(page).click();
    expect((await response).status()).toBe(201);
    await expect(page.getByTestId("register-success")).toBeVisible();
    await expect(page.getByLabel("Email")).toBeDisabled();
    expect(await countUsers(email)).toBe(1);
  });

  test("an empty form shows every message under its field and sends no request", async ({ page }) => {
    let requests = 0;
    page.on("request", (r) => {
      if (r.url().includes("/api/auth/register")) requests++;
    });
    await submitButton(page).click();
    for (const message of [
      "Vui lòng nhập họ và tên",
      "Vui lòng nhập email",
      "Vui lòng nhập số điện thoại",
      "Vui lòng nhập mật khẩu",
      "Vui lòng nhập xác nhận mật khẩu",
    ]) {
      await expect(page.getByText(message, { exact: true })).toBeVisible();
    }
    await expect(formError(page)).toHaveCount(0);
    expect(requests).toBe(0);
  });

  test("a mismatch is shown together with another field's error", async ({ page }) => {
    await fill(page, { name: "", email: uniqueEmail("ui"), phone: "0901234567", password: "abc12345", confirm: "xyz12345" });
    await submitButton(page).click();
    await expect(page.getByText("Vui lòng nhập họ và tên", { exact: true })).toBeVisible();
    await expect(page.getByText("Mật khẩu xác nhận không khớp với mật khẩu", { exact: true })).toBeVisible();
  });

  test("an email that is already registered shows the message under the email field", async ({ page, request }) => {
    const email = uniqueEmail("ui");
    expect((await post(request, body(email))).status()).toBe(201);
    await fillValid(page, email);
    const response = page.waitForResponse(REGISTER_API);
    await submitButton(page).click();
    expect((await response).status()).toBe(409);
    await expect(page.getByText("Email này đã tồn tại trong hệ thống", { exact: true })).toBeVisible();
    await expect(formError(page)).toHaveCount(0);
    await expect(submitButton(page)).toBeEnabled();
  });

  test("a server failure shows the generic message above the fields and re-enables submit", async ({ page }) => {
    await page.route(REGISTER_API, (route) => route.fulfill({ status: 500, json: { code: "AUTH_INTERNAL_ERROR" } }));
    await fillValid(page);
    await submitButton(page).click();
    await expect(formError(page)).toHaveText(GENERIC);
    await expect(submitButton(page)).toBeEnabled();
  });

  test("a network failure shows the generic message", async ({ page }) => {
    await page.route(REGISTER_API, (route) => route.abort());
    await fillValid(page);
    await submitButton(page).click();
    await expect(formError(page)).toHaveText(GENERIC);
    await expect(submitButton(page)).toBeEnabled();
  });

  test("the button is disabled while submitting and a double submit sends one request", async ({ page }) => {
    let requests = 0;
    await page.route(REGISTER_API, async (route) => {
      requests++;
      await new Promise((r) => setTimeout(r, 500));
      await route.continue();
    });
    await fillValid(page);
    const response = page.waitForResponse(REGISTER_API);
    await page.evaluate(() => {
      const form = document.querySelector("form")!;
      form.requestSubmit();
      form.requestSubmit();
    });
    await expect(submitButton(page)).toBeDisabled();
    await response;
    await expect(page.getByTestId("register-success")).toBeVisible();
    expect(requests).toBe(1);
  });

  test("each password field has its own show/hide toggle", async ({ page }) => {
    const password = page.getByLabel("Mật khẩu", { exact: true });
    const confirm = page.getByLabel("Xác nhận mật khẩu");
    await expect(password).toHaveAttribute("type", "password");
    await expect(confirm).toHaveAttribute("type", "password");
    await page.getByRole("button", { name: "Hiện mật khẩu" }).first().click();
    await expect(password).toHaveAttribute("type", "text");
    await expect(confirm).toHaveAttribute("type", "password");
  });

  test("editing a field clears its error", async ({ page }) => {
    await submitButton(page).click();
    await expect(page.getByText("Vui lòng nhập họ và tên", { exact: true })).toBeVisible();
    await page.getByLabel("Họ và tên").fill("N");
    await expect(page.getByText("Vui lòng nhập họ và tên", { exact: true })).toHaveCount(0);
    await expect(page.getByText("Vui lòng nhập email", { exact: true })).toBeVisible();
  });

  test("links to the login page", async ({ page }) => {
    await page.getByRole("link", { name: "Đăng nhập" }).click();
    await expect(page).toHaveURL(/\/login$/);
  });

  test.describe("mobile", () => {
    test.use({ viewport: { width: 375, height: 812 } });

    test("registers on a 375px screen with the mobile layout", async ({ page }) => {
      await expect(page.getByTestId("register-brand-panel")).toBeHidden();
      await fillValid(page);
      const response = page.waitForResponse(REGISTER_API);
      await submitButton(page).click();
      expect((await response).status()).toBe(201);
      await expect(page.getByTestId("register-success")).toBeVisible();
    });
  });
});
