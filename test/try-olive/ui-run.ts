import("../mobile-editor/dom-setup").then(async () => {
    Object.assign(globalThis, { HTMLInputElement: window.HTMLInputElement, NodeFilter: window.NodeFilter });
    const timer = setTimeout(() => { console.error("UI test timed out"); process.exit(1); }, 30000);
    try { await (await import("./ui")).run(); clearTimeout(timer); process.exit(0); }
    catch (error) { console.error(error); process.exit(1); }
});
