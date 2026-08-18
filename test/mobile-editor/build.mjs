import { build } from "esbuild";
import path from "node:path";

// The prescription editor is written on a phone, in a hospital, on a screen the developer
// is not looking at. Its mobile rules are all invisible from a desktop browser — the
// keyboard inset, the 16px floor that stops iOS zooming the page in, the 44px targets, and
// which presentation an edit opens in — so they are pinned down here instead.
const root = path.resolve(import.meta.dirname, "../..");
const here = path.join(root, "test/mobile-editor");

// The editor's letterhead is resolved over the network; only the resolution is stubbed, so
// the header a phone actually renders is the real one.
const stubs = {
    "@/hooks/use-compose-letterhead": path.join(here, "stubs/compose-letterhead.ts"),
};

await build({
    entryPoints: [path.join(here, "run.ts")],
    plugins: [{
        name: "stubs",
        setup(pluginBuild) {
            pluginBuild.onResolve({ filter: /.*/ }, (args) => (stubs[args.path] ? { path: stubs[args.path] } : null));
        },
    }],
    bundle: true,
    platform: "node",
    format: "cjs",
    jsx: "automatic",
    outfile: path.join(here, "build/run.cjs"),
    alias: { "@": path.join(root, "src") },
    // jsdom reads its own stylesheet off disk, so it must stay a runtime require.
    external: ["jsdom"],
    define: { "process.env.NODE_ENV": JSON.stringify("development") },
    logLevel: "error",
});
