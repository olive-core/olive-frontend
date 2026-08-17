import { build } from "esbuild";
import path from "node:path";

// The queue is the piece that makes a lost connection a delay instead of lost audio, so
// it is tested against the network failing rather than against a mock of itself. This
// bundles the real store, drainer and uploader and swaps only the API for a stub that can
// be told to go offline, flake, or answer like a captive portal.
const root = path.resolve(import.meta.dirname, "../..");
const here = path.join(root, "test/audio-queue");

const stubs = {
    "@/lib/axios": path.join(here, "network.ts"),
};

await build({
    entryPoints: [path.join(here, "run.ts")],
    bundle: true,
    platform: "node",
    format: "cjs",
    outfile: path.join(here, "build/run.cjs"),
    alias: { "@": path.join(root, "src") },
    define: { "process.env.NODE_ENV": JSON.stringify("development") },
    plugins: [{
        name: "stubs",
        setup(pluginBuild) {
            pluginBuild.onResolve({ filter: /.*/ }, (args) => (stubs[args.path] ? { path: stubs[args.path] } : null));
        },
    }],
    logLevel: "error",
});
