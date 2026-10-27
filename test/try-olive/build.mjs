import { build } from "esbuild";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "../..");
await build({
    entryPoints: [path.join(import.meta.dirname, "run.ts")],
    bundle: true, platform: "node", format: "cjs",
    outfile: path.join(import.meta.dirname, "build/run.cjs"),
    alias: { "@": path.join(root, "src") }, logLevel: "error",
});
await build({
    entryPoints: [path.join(import.meta.dirname, "ui-run.ts")],
    bundle: true, platform: "node", format: "cjs", jsx: "automatic",
    outfile: path.join(import.meta.dirname, "build/ui.cjs"),
    alias: { "@": path.join(root, "src"), "@tanstack/react-router": path.join(import.meta.dirname, "router-stub.tsx") },
    external: ["jsdom"], loader: { ".css": "empty" }, logLevel: "error",
});
