import '../memory/dom-setup';
Object.assign(globalThis, { MutationObserver: window.MutationObserver, CustomEvent: window.CustomEvent, HTMLInputElement: window.HTMLInputElement, NodeFilter: window.NodeFilter });
import('./scenario').then(async ({run}) => { await run(); process.exit(0); }).catch((error) => { console.error(error); process.exit(1); });
