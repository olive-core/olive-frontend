import { JSDOM } from "jsdom";

const dom = new JSDOM("<!doctype html><html><body><div id='root'></div></body></html>", {
    url: "http://localhost/",
    pretendToBeVisual: true,
});

const anyGlobal = globalThis as any;
anyGlobal.window = dom.window;
anyGlobal.document = dom.window.document;
anyGlobal.navigator = dom.window.navigator;
anyGlobal.HTMLElement = dom.window.HTMLElement;
anyGlobal.HTMLInputElement = dom.window.HTMLInputElement;
anyGlobal.Element = dom.window.Element;
anyGlobal.Node = dom.window.Node;
// Node ships its own global Event/CustomEvent, which jsdom's dispatchEvent rejects. Radix
// signals its layers with a CustomEvent, so the window's own classes have to win here.
anyGlobal.Event = dom.window.Event;
anyGlobal.CustomEvent = dom.window.CustomEvent;
anyGlobal.EventTarget = dom.window.EventTarget;
anyGlobal.KeyboardEvent = dom.window.KeyboardEvent;
anyGlobal.getComputedStyle = dom.window.getComputedStyle;
// The sheet is a Radix dialog: it hides the rest of the page from assistive tech and locks
// body scroll, both of which watch the DOM.
anyGlobal.MutationObserver = dom.window.MutationObserver;
// react-remove-scroll walks the tree with a TreeWalker to hide the page behind the sheet.
anyGlobal.NodeFilter = dom.window.NodeFilter;
anyGlobal.DocumentFragment = dom.window.DocumentFragment;
anyGlobal.MouseEvent = dom.window.MouseEvent;
anyGlobal.PointerEvent = dom.window.PointerEvent;
anyGlobal.requestAnimationFrame = (cb: FrameRequestCallback) => setTimeout(() => cb(Date.now()), 16) as unknown as number;
anyGlobal.cancelAnimationFrame = (id: number) => clearTimeout(id);
anyGlobal.IS_REACT_ACT_ENVIRONMENT = true;

class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
}
anyGlobal.ResizeObserver = ResizeObserverStub;
dom.window.ResizeObserver = ResizeObserverStub as any;

// Radix's dismissable layer and focus scope reach for pointer-capture and scrolling APIs
// jsdom does not implement.
dom.window.Element.prototype.hasPointerCapture = () => false;
dom.window.Element.prototype.setPointerCapture = () => {};
dom.window.Element.prototype.releasePointerCapture = () => {};
dom.window.Element.prototype.scrollIntoView = () => {};

// Which viewport the editors believe they are on. Flipped by the run before mounting, so
// both presentations can be exercised in one process.
export const viewport = { isPhone: false };

dom.window.matchMedia = ((query: string) => ({
    matches: viewport.isPhone, media: query, onchange: null,
    addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent: () => false,
})) as any;

export { dom };
