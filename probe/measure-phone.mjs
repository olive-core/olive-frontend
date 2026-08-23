import http from "node:http";
import fs from "node:fs";
import path from "node:path";

// Renders the real pad editor at phone sizes in a headless browser and fails if anything
// reaches past the viewport. jsdom cannot do this — it has no layout engine — and the bug
// this catches (content sized to max-content, clipped on the right, no scrollbar to hint at
// it) is invisible in markup assertions and invisible on a desktop browser.
//
// Puppeteer is deliberately not a project dependency — it downloads a browser, which no
// one should pay for on a plain `npm install`. To run this:
//   npm i --no-save puppeteer && npx puppeteer browsers install chrome-headless-shell
// Screenshots land in probe/shots/ for eyeballing.

let puppeteer;
try {
    puppeteer = (await import("puppeteer")).default;
} catch {
    console.error("This probe needs Puppeteer, which is not a project dependency:\n"
        + "  npm i --no-save puppeteer && npx puppeteer browsers install chrome-headless-shell");
    process.exit(1);
}

const HERE = path.dirname(new URL(import.meta.url).pathname);
const DIST = path.join(HERE, "dist");
const SHOTS = path.join(HERE, "shots");
const PORT = 5199;

const VIEWPORTS = [
    { name: "iphone-se",        hash: "#editor", width: 320, height: 568 },
    { name: "android-360",      hash: "#editor", width: 360, height: 780 },
    { name: "iphone-pro",       hash: "#editor", width: 390, height: 844 },
    { name: "phone-landscape",  hash: "#editor", width: 844, height: 390 },
    { name: "tablet",           hash: "#editor", width: 820, height: 1180 },
    { name: "first-run",        hash: "#wizard", width: 360, height: 780 },
    { name: "chambers-page",    hash: "#chambers-page", width: 360, height: 780 },
];

const OPEN_SECTIONS = ["Ibn Sina", "Popular", "Your details", "Look of the pad", "Bottom of the page"];

if (!fs.existsSync(DIST)) {
    console.error("Run `npm run probe:build` first.");
    process.exit(1);
}
fs.mkdirSync(SHOTS, { recursive: true });

const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".svg": "image/svg+xml" };
const server = http.createServer((req, res) => {
    const url = (req.url || "/").split("?")[0].split("#")[0];
    let file = path.join(DIST, url === "/" ? "index.html" : url);
    if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(DIST, "index.html");
    res.writeHead(200, { "Content-Type": MIME[path.extname(file)] ?? "application/octet-stream" });
    res.end(fs.readFileSync(file));
});
await new Promise((resolve) => server.listen(PORT, resolve));

const browser = await puppeteer.launch({ args: ["--no-sandbox", "--disable-gpu"] });

function overflowReport() {
    const viewportWidth = document.documentElement.clientWidth;
    const describe = (el) => {
        const classes = (el.getAttribute("class") || "").split(/\s+/).slice(0, 6).join(" ");
        const text = (el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 44);
        return `${el.tagName.toLowerCase()} [${classes}] "${text}"`;
    };
    // Text inside a `truncate` (or any deliberately clipping box) still reports a wide
    // rect while being visibly ellipsised. That is not an overflow — but a clipper that is
    // itself too wide is, and it gets reported on its own row. The document scroller is
    // excluded, or it would excuse everything.
    const containedByAClipper = (el) => {
        for (let parent = el.parentElement; parent && parent !== document.body; parent = parent.parentElement) {
            if (!/hidden|clip|auto|scroll/.test(getComputedStyle(parent).overflowX)) continue;
            const box = parent.getBoundingClientRect();
            if (box.right <= viewportWidth + 0.5 && box.left >= -0.5) return true;
        }
        return false;
    };

    const offenders = [];
    for (const el of document.querySelectorAll("body *")) {
        const box = el.getBoundingClientRect();
        if (box.width === 0 && box.height === 0) continue;
        if (box.right <= viewportWidth + 0.5 && box.left >= -0.5) continue;
        if (containedByAClipper(el)) continue;
        let depth = 0;
        for (let node = el; node; node = node.parentElement) depth += 1;
        offenders.push({ depth, over: Math.round(Math.max(box.right - viewportWidth, -box.left)), what: describe(el) });
    }
    offenders.sort((a, b) => a.depth - b.depth);
    return { viewportWidth, scrollWidth: document.documentElement.scrollWidth, offenders: offenders.slice(0, 10), total: offenders.length };
}

let failures = 0;

for (const { name, hash, width, height } of VIEWPORTS) {
    const page = await browser.newPage();
    await page.setViewport({ width, height, deviceScaleFactor: 2, isMobile: width < 768, hasTouch: true });
    await page.goto(`http://localhost:${PORT}/${hash}`, { waitUntil: "networkidle0" });
    await new Promise((resolve) => setTimeout(resolve, 600));

    // Every section open at once is the widest the page ever gets.
    for (const label of OPEN_SECTIONS) {
        await page.evaluate((text) => {
            [...document.querySelectorAll("button")].find((b) => (b.textContent || "").includes(text))?.click();
        }, label);
        await new Promise((resolve) => setTimeout(resolve, 250));
    }

    const report = await page.evaluate(overflowReport);
    const ok = report.total === 0 && report.scrollWidth <= report.viewportWidth;
    if (!ok) failures += 1;
    console.log(`${ok ? "  PASS" : "  FAIL"}  ${name.padEnd(17)} ${width}x${height}  scrollWidth=${report.scrollWidth}  ${report.total} element(s) past the edge`);
    for (const offender of report.offenders) console.log(`          +${offender.over}px  ${offender.what}`);

    await page.screenshot({ path: path.join(SHOTS, `${name}.png`), fullPage: true });
    await page.close();
}

await browser.close();
server.close();
console.log(failures === 0 ? "\nNothing overflows a phone screen." : `\n${failures} viewport(s) overflow`);
process.exit(failures === 0 ? 0 : 1);
