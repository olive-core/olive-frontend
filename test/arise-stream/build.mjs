import { build } from "esbuild";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "../..");
const here = path.join(root, "test/arise-stream");

await build({
    entryPoints: [path.join(here, "run.ts")],
    bundle: true,
    platform: "node",
    format: "cjs",
    outfile: path.join(here, "build/run.cjs"),
    alias: { "@": path.join(root, "src") },
    plugins: [{
        name: "short-arise-timeouts",
        setup(pluginBuild) {
            pluginBuild.onResolve({ filter: /^@\/lib\/arise-timeouts$/ }, () => ({
                path: path.join(here, "stubs/arise-timeouts.ts"),
            }));
        },
    }],
    logLevel: "error",
});
