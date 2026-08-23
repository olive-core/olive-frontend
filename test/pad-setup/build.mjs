import { build } from "esbuild";
import path from "node:path";

// The pad editor's job is to be findable. Its rules are about arrangement rather than
// arithmetic — which question is asked first, which section owns a control, what survives
// on a phone — and every one of them regresses silently, because the page still renders.
// They are pinned down here: the pure ordering rules directly, the arrangement by mounting
// the real editor with only the network and router swapped for stubs.
const root = path.resolve(import.meta.dirname, "../..");
const here = path.join(root, "test/pad-setup");

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
