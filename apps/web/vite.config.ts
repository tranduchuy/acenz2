import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";

export default defineConfig(({ mode }) => {
  // API_PROXY_TARGET lets e2e point the dev server at its own API instance.
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: 5173,
      proxy: { "/api": env.API_PROXY_TARGET || "http://localhost:3000" },
    },
    test: { environment: "node", include: ["src/**/*.test.ts"] },
  };
});
