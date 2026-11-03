import fs from "node:fs";
import path from "node:path";
import { createServer } from "vite";

// Captures the landing page's product screenshots from the real app screens rendered by
// probe/landing-shots.tsx (fictional patient, network stubbed), so they can be retaken
// whenever the UI changes. Writes WebP files into public/landing/.
//
// Puppeteer is deliberately not a project dependency. To run this:
//   npm i --no-save puppeteer && npx puppeteer browsers install chrome-headless-shell
//   node probe/capture-landing-shots.mjs
// Or skip the browser download and point PUPPETEER_EXECUTABLE_PATH at an installed Chrome.

let puppeteer;
try {
    puppeteer = (await import("puppeteer")).default;
} catch {
    console.error("This needs Puppeteer, which is not a project dependency:\n"
        + "  npm i --no-save puppeteer && npx puppeteer browsers install chrome-headless-shell");
    process.exit(1);
}

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const OUT = path.join(ROOT, "public", "landing");
const PORT = 5198;

const SHOTS = [
    // Desktop shots use the narrowest desktop layout, so the text stays readable once
    // the image is scaled into the landing page's column.
    { name: "record-desktop", screen: "record", width: 1024, height: 1000, scale: 2 },
    { name: "record-phone",   screen: "record", width: 390,  height: 844, scale: 2 },
    { name: "review-desktop", screen: "review", width: 1024, height: 800, scale: 2 },
    { name: "review-phone",   screen: "review", width: 390,  height: 844, scale: 2 },
    // The printed page is the same on every screen, so one capture of the sheet serves both.
    { name: "print",          screen: "print",  width: 900,  height: 1200, scale: 2, selector: "#print-shot" },
];

const server = await createServer({
    configFile: path.join(ROOT, "vite.probe.config.ts"),
    server: { port: PORT, strictPort: true },
    logLevel: "error",
});
await server.listen();
fs.mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({ args: ["--no-sandbox", "--disable-gpu"] });
try {
    for (const shot of SHOTS) {
        const page = await browser.newPage();
        await page.setViewport({ width: shot.width, height: shot.height, deviceScaleFactor: shot.scale });
        await page.goto(`http://localhost:${PORT}/landing-shots.html#${shot.screen}`, { waitUntil: "networkidle0" });
        await page.waitForSelector("#shot-ready");
        await page.evaluate(() => document.fonts.ready);
        const target = shot.selector ? await page.$(shot.selector) : page;
        if (!target) throw new Error(`${shot.name}: ${shot.selector} not found`);
        await target.screenshot({ path: path.join(OUT, `${shot.name}.webp`), type: "webp", quality: 82 });
        console.log(`wrote public/landing/${shot.name}.webp`);
        await page.close();
    }
} finally {
    await browser.close();
    await server.close();
}
