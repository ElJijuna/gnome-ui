import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import { fileURLToPath } from "node:url";
import { generateEntries } from "vite-magic-tree-shaking";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  plugins: [
    dts({
      include: ["src"],
      insertTypesEntry: true,
    }),
  ],
  build: {
    lib: {
      entry: generateEntries(__dirname, "src", { warnOnExportsMismatch: true }),
      formats: ["es", "cjs"],
      fileName: (format, entryName) =>
        format === "cjs" ? `${entryName}.cjs` : `${entryName}.js`,
    },
    rollupOptions: {
      output: {
        preserveModules: true,
        preserveModulesRoot: "src",
      },
    },
    sourcemap: true,
  },
});
