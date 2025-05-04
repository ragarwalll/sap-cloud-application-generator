import path from "path";
import { defineConfig } from "tsup";
import alias from "esbuild-plugin-alias";

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
  // if you have lots of small files, you might disable splitting:
  // splitting: false,
});
