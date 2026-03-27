import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import { resolve } from "path";
export default defineConfig({
    plugins: [
        dts({
            include: ["src"],
            insertTypesEntry: true,
        }),
    ],
    build: {
        lib: {
            entry: resolve(__dirname, "src/index.ts"),
            name: "GnomeIcons",
            formats: ["es", "cjs"],
            fileName: function (format) { return "index.".concat(format === "es" ? "js" : "cjs"); },
        },
        sourcemap: true,
    },
});
