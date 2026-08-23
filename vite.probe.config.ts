import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

// Layout-only harness: mounts the real pad editor with the network and router stubbed, so a
// headless browser can measure what actually overflows a phone screen.
export default defineConfig({
    root: path.resolve(import.meta.dirname, "probe"),
    plugins: [react(), tailwindcss()],
    resolve: {
        alias: {
            "@/lib/axios":            path.resolve(import.meta.dirname, "probe/stubs/axios.ts"),
            "@tanstack/react-router": path.resolve(import.meta.dirname, "probe/stubs/router.tsx"),
            "@":                      path.resolve(import.meta.dirname, "src"),
        },
    },
    build: { outDir: path.resolve(import.meta.dirname, "probe/dist"), emptyOutDir: true },
});
