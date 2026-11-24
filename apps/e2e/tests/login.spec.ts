import { expect, test, type Page, type Response } from "@playwright/test";
import { FIXTURE_PASSWORD, USERS } from "../fixtures/users";

const LOGIN_API = "**/api/auth/login";

async function submit(page: Page, email: string, password: string): Promise<Response> {
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Mật khẩu", { exact: true }).fill(password);
  const response = page.waitForResponse(LOGIN_API);
  await page.getByRole("button", { name: "Đăng nhập" }).click();
  return response;
}

const formError = (page: Page) => page.getByTestId("login-form-error");

test.beforeEach(async ({ page }) => {
  await page.goto("/login");
});

test("logs in with correct credentials", async ({ page }) => {
  const res = await submit(page, USERS.ok.email, FIXTURE_PASSWORD);
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(typeof body.token).toBe("string");
  expect(body.token).not.toBe("");
  expect(JSON.stringify(body)).not.toMatch(/password|hash|\$2y\$/i);
  await expect(page.getByTestId("login-success")).toBeVisible();
});

test("empty email shows the message under the email field", async ({ page }) => {
  const res = await submit(page, "", FIXTURE_PASSWORD);
  expect(res.status()).toBe(400);
  expect(await res.json()).toEqual({ code: "AUTH_EMAIL_REQUIRED" });
  await expect(page.getByText("Vui lòng nhập email")).toBeVisible();
  await expect(formError(page)).toHaveCount(0);
});

test("empty password shows the message under the password field", async ({ page }) => {
  const res = await submit(page, USERS.ok.email, "");
  expect(res.status()).toBe(400);
  expect(await res.json()).toEqual({ code: "AUTH_PASSWORD_REQUIRED" });
  await expect(page.getByText("Vui lòng nhập mật khẩu")).toBeVisible();
});

test("wrong password and unknown email get the same answer", async ({ page }) => {
  for (const [email, password] of [
    [USERS.ok.email, "wrong-password"],
    ["nobody@x.com", FIXTURE_PASSWORD],
  ]) {
    const res = await submit(page, email, password);
    expect(res.status()).toBe(401);
    expect(await res.json()).toEqual({ code: "AUTH_INVALID_CREDENTIALS" });
    await expect(formError(page)).toHaveText("Email hoặc mật khẩu không đúng");
  }
});

for (const key of ["nohash", "emptyhash"] as const) {
  test(`user without a usable password hash (${key}) is rejected, not a server error`, async ({ page }) => {
    const res = await submit(page, USERS[key].email, FIXTURE_PASSWORD);
    expect(res.status()).toBe(401);
    expect(await res.json()).toEqual({ code: "AUTH_INVALID_CREDENTIALS" });
    await expect(formError(page)).toHaveText("Email hoặc mật khẩu không đúng");
  });
}

test("locked account is refused without a token", async ({ page }) => {
  const res = await submit(page, USERS.locked.email, FIXTURE_PASSWORD);
  expect(res.status()).toBe(403);
  const body = await res.json();
  expect(body).toEqual({ code: "AUTH_ACCOUNT_LOCKED" });
  expect("token" in body).toBe(false);
  await expect(formError(page)).toHaveText("Tài khoản đã bị khóa");
});

test("server failure shows the generic message and re-enables submit", async ({ page }) => {
  await page.route(LOGIN_API, (route) => route.fulfill({ status: 500, json: { code: "AUTH_INTERNAL_ERROR" } }));
  await submit(page, USERS.ok.email, FIXTURE_PASSWORD);
  await expect(formError(page)).toHaveText("Có lỗi xảy ra, vui lòng thử lại");
  await expect(page.getByRole("button", { name: "Đăng nhập" })).toBeEnabled();
});

test("network failure shows the generic message", async ({ page }) => {
  await page.route(LOGIN_API, (route) => route.abort());
  await page.getByLabel("Email").fill(USERS.ok.email);
  await page.getByLabel("Mật khẩu", { exact: true }).fill(FIXTURE_PASSWORD);
  await page.getByRole("button", { name: "Đăng nhập" }).click();
  await expect(formError(page)).toHaveText("Có lỗi xảy ra, vui lòng thử lại");
  await expect(page.getByRole("button", { name: "Đăng nhập" })).toBeEnabled();
});

test("soft-deleted user is rejected", async ({ page }) => {
  const res = await submit(page, USERS.deleted.email, FIXTURE_PASSWORD);
  expect(res.status()).toBe(401);
  expect(await res.json()).toEqual({ code: "AUTH_INVALID_CREDENTIALS" });
});

test("button is disabled while submitting and a double submit sends one request", async ({ page }) => {
  let requests = 0;
  await page.route(LOGIN_API, async (route) => {
    requests++;
    await new Promise((r) => setTimeout(r, 500));
    await route.continue();
  });
  await page.getByLabel("Email").fill(USERS.ok.email);
  const password = page.getByLabel("Mật khẩu", { exact: true });
  await password.fill(FIXTURE_PASSWORD);
  const response = page.waitForResponse(LOGIN_API);
  // Two submits in the same tick: Enter in the password field and a form submit.
  await page.evaluate(() => {
    const form = document.querySelector("form")!;
    form.requestSubmit();
    form.requestSubmit();
  });
  await expect(page.getByRole("button", { name: "Đăng nhập" })).toBeDisabled();
  await response;
  await expect(page.getByTestId("login-success")).toBeVisible();
  expect(requests).toBe(1);
});

test("password toggle shows and hides the password", async ({ page }) => {
  const input = page.getByLabel("Mật khẩu", { exact: true });
  await expect(input).toHaveAttribute("type", "password");
  await page.getByRole("button", { name: "Hiện mật khẩu" }).click();
  await expect(input).toHaveAttribute("type", "text");
  await page.getByRole("button", { name: "Ẩn mật khẩu" }).click();
  await expect(input).toHaveAttribute("type", "password");
});

test("editing a field clears its error", async ({ page }) => {
  await submit(page, "", FIXTURE_PASSWORD);
  await expect(page.getByText("Vui lòng nhập email")).toBeVisible();
  await page.getByLabel("Email").fill("a");
  await expect(page.getByText("Vui lòng nhập email")).toHaveCount(0);
});

test("email with surrounding spaces logs in", async ({ page }) => {
  // type="email" inputs strip surrounding whitespace in the browser, so this also checks the API trims it.
  const res = await submit(page, `  ${USERS.ok.email} `, FIXTURE_PASSWORD);
  expect(res.status()).toBe(200);
});

test("links to the registration page and back", async ({ page }) => {
  await expect(page.getByText("Chưa có tài khoản?")).toBeVisible();
  await page.getByRole("link", { name: "Đăng ký" }).click();
  await expect(page).toHaveURL(/\/register$/);
  await expect(page.getByRole("heading", { name: "Tạo tài khoản" })).toBeVisible();
  await page.getByRole("link", { name: "Đăng nhập" }).click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { name: "Đăng nhập" })).toBeVisible();
});

test.describe("mobile", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("logs in on a 375px screen with the mobile layout", async ({ page }) => {
    await expect(page.getByTestId("login-brand-panel")).toBeHidden();
    const res = await submit(page, USERS.ok.email, FIXTURE_PASSWORD);
    expect(res.status()).toBe(200);
    await expect(page.getByTestId("login-success")).toBeVisible();
  });

  test("the registration link is visible and works on a 375px screen", async ({ page }) => {
    await page.getByRole("link", { name: "Đăng ký" }).click();
    await expect(page).toHaveURL(/\/register$/);
  });
});
