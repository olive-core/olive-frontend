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
anyGlobal.Node = dom.window.Node;
anyGlobal.Event = dom.window.Event;
anyGlobal.getComputedStyle = dom.window.getComputedStyle;
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
dom.window.matchMedia = ((query: string) => ({
    matches: false, media: query, onchange: null,
    addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent: () => false,
})) as any;
