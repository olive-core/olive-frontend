import { build } from "esbuild";
import path from "node:path";

// The recording session is the one piece of Olive that outlives a page, so it is worth a
// real DOM test rather than a type check. This bundles the actual provider, recorder card
// and floating widget against a jsdom document, swapping only the network and router
// layers for stubs, and runs the scenarios in run.ts.
const root = path.resolve(import.meta.dirname, "../..");
const here = path.join(root, "test/recording-session");

const stubs = {
    "@/lib/axios":            path.join(here, "stubs/axios.ts"),
    "@tanstack/react-router": path.join(here, "stubs/router.tsx"),
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
