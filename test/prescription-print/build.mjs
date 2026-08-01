import { build } from "esbuild";
import path from "node:path";

// The print layout decides itself, at measure time, in a browser the developer never
// sees. Its two pure pieces — the paper geometry and the one-page fit ladder — are worth
// exercising directly: a ladder that fails to settle is an infinite render loop.
const root = path.resolve(import.meta.dirname, "../..");

await build({
    entryPoints: [path.join(root, "test/prescription-print/run.ts")],
    bundle: true,
    platform: "node",
    format: "cjs",
    jsx: "automatic",
    outfile: path.join(root, "test/prescription-print/build/run.cjs"),
    alias: { "@": path.join(root, "src") },
    logLevel: "error",
});
