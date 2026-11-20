import { defineConfig, devices } from "@playwright/test";
import { E2E_DATABASE_URL } from "./db-url";

// Own ports so `pnpm dev` (3000 / 5173) can keep running.
const API_PORT = 3100;
const WEB_PORT = 5174;

export default defineConfig({
  testDir: "./tests",
  globalSetup: "./global-setup.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? "list" : [["list"], ["html", { open: "never" }]],
  use: { baseURL: `http://localhost:${WEB_PORT}`, trace: "retain-on-failure" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } } }],
  webServer: [
    {
      // The API doesn't block on the DB and initialises it lazily, so it can start before globalSetup seeds it.
      command: "node --env-file-if-exists=../../.env dist/index.js",
      cwd: "../api",
      port: API_PORT,
      env: { DATABASE_URL: E2E_DATABASE_URL, API_PORT: String(API_PORT), NODE_ENV: "test" },
      reuseExistingServer: false,
    },
    {
      command: `pnpm exec vite --port ${WEB_PORT} --strictPort`,
      cwd: "../web",
      port: WEB_PORT,
      env: { API_PROXY_TARGET: `http://localhost:${API_PORT}` },
      reuseExistingServer: false,
    },
  ],
});
