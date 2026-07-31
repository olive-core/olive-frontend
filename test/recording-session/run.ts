import fs from "node:fs";

// Unbuffered, so nothing is lost if the run has to be killed.
const write = (...args: unknown[]) =>
    fs.writeSync(1, args.map((a) => (typeof a === "string" ? a : JSON.stringify(a))).join(" ") + "\n");
console.log = write;
console.error = write;

import("./dom-setup").then(async () => {
    process.on("unhandledRejection", (error) => { console.error("UNHANDLED REJECTION:", String(error)); process.exit(1); });
    process.on("uncaughtException", (error) => { console.error("UNCAUGHT:", String(error)); process.exit(1); });
    const { runTest } = await import("./scenario");
    const hangGuard = setTimeout(() => { console.error("\nTEST HUNG - render loop or unsettled work"); process.exit(1); }, 60000);
    await runTest();
    clearTimeout(hangGuard);
    process.exit(process.exitCode ?? 0);
});
