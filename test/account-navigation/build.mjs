import { build } from "esbuild";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "../..");
const here = path.join(root, "test/account-navigation");

const stubs = {
    "@/lib/axios":            path.join(here, "stubs/axios.ts"),
};

await build({
    entryPoints: [path.join(here, "run.ts")],
    bundle: true,
    platform: "node",
    format: "cjs",
    jsx: "automatic",
    outfile: path.join(here, "build/run.cjs"),
    alias: { "@": path.join(root, "src") },
    // jsdom reads its own stylesheet off disk, so it must stay a runtime require.
    external: ["jsdom"],
    define: { "process.env.NODE_ENV": JSON.stringify("development") },
    plugins: [{
        name: "stubs",
        setup(pluginBuild) {
            pluginBuild.onResolve({ filter: /.*/ }, (args) => (stubs[args.path] ? { path: stubs[args.path] } : null));
        },
    }],
    logLevel: "error",
});
