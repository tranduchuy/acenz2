import { copyFileSync } from "node:fs";
import { defineConfig } from "tsup";

export default defineConfig((options) => ({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  clean: !options.watch,
  sourcemap: true,
  external: ["react", "react-dom", "react/jsx-runtime", "@acenz/core", "@acenz/tokens"],
  // styles.css stays a plain file: it @imports @acenz/tokens/tokens.css, resolved by the app's bundler (Vite).
  onSuccess: async () => {
    copyFileSync("src/styles.css", "dist/styles.css");
  },
}));
