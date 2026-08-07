import { build } from "esbuild";
import path from "node:path";

// Memory's rules are all decisions made in one place and felt somewhere else: which
// sections a memory covers, what an apply replaces, and what undo puts back. They are
// worth exercising directly — a wrong answer here quietly rewrites a doctor's
// prescription. The scenarios cover both the store rules and the surface built on them,
// swapping only the network and router layers for stubs.
const root = path.resolve(import.meta.dirname, "../..");
const here = path.join(root, "test/memory");

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
