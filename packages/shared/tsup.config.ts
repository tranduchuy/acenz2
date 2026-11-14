import { defineConfig } from "tsup";

export default defineConfig((options) => ({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  // Cleaning in watch mode briefly removes dist while api/web may be reading it.
  clean: !options.watch,
  sourcemap: true,
}));
