import path from "path";
import { defineConfig } from "tsup";
import alias from "esbuild-plugin-alias";
import pkg from "./package.json";

// Collect all your runtime deps as externals automatically
const externalDeps = Object.keys(pkg.dependencies || {});

export default defineConfig({
  entry: ["src/index.ts"],
  clean: true,
  sourcemap: true,
  format: ["cjs", "esm"],
  dts: true,
  outDir: "dist",
  esbuildPlugins: [
    alias({
      "@": path.resolve(__dirname, "src")
    })
  ],
  external: [
    ...externalDeps,
  ],
});
