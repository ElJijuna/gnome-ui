import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
import { resolve } from "path";
import { fileURLToPath } from "node:url";
import { generateEntries } from "vite-magic-tree-shaking";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const externalPackages = [
  "@gnome-ui/core",
  "@gnome-ui/hooks",
  "@gnome-ui/icons",
  "@gnome-ui/react",
  "react",
  "react-dom",
];

function isExternalDependency(id: string) {
  return externalPackages.some((packageName) =>
    id === packageName || id.startsWith(`${packageName}/`),
  );
}

export default defineConfig({
  plugins: [
    react(),
    dts({
      include: ["src"],
      exclude: ["src/**/*.stories.tsx", "src/**/*.test.tsx"],
      insertTypesEntry: true,
    }),
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  build: {
    lib: {
      entry: generateEntries(__dirname),
      formats: ["es", "cjs"],
      fileName: (format, entryName) =>
        format === "cjs" ? `${entryName}.cjs` : `${entryName}.js`,
    },
    rollupOptions: {
      external: isExternalDependency,
      output: {
        preserveModules: true,
        preserveModulesRoot: "src",
        assetFileNames: "style.css",
      },
    },
    cssCodeSplit: false,
    sourcemap: true,
  },
});
