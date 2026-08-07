import { JSDOM } from "jsdom";

const dom = new JSDOM("<!doctype html><html><body><div id='root'></div></body></html>", {
    url: "http://localhost/",
    pretendToBeVisual: true,
});

const anyGlobal = globalThis as any;
anyGlobal.window = dom.window;
anyGlobal.document = dom.window.document;
Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    writable: true,
    value: dom.window.navigator,
});
anyGlobal.HTMLElement = dom.window.HTMLElement;
anyGlobal.Node = dom.window.Node;
anyGlobal.Event = dom.window.Event;
anyGlobal.Blob = dom.window.Blob;
Object.defineProperty(globalThis, "FormData", {
    configurable: true,
    writable: true,
    value: dom.window.FormData,
});
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

// --- microphone stubs -------------------------------------------------------
export const micState = {
    liveTracks:        0,
    recorders:         [] as MockMediaRecorder[],
    getUserMediaCalls: 0,
    reset() { this.liveTracks = 0; this.recorders = []; this.getUserMediaCalls = 0; },
};

let microphoneAvailable = true;
export const setMicrophoneAvailable = (available: boolean) => { microphoneAvailable = available; };

class MockMediaRecorder {
    state = "inactive";
    ondataavailable: ((event: { data: Blob }) => void) | null = null;
    onstop: ((event: unknown) => void) | null = null;
    stream: unknown;
    constructor(stream: unknown) { this.stream = stream; micState.recorders.push(this); }
    start() { this.state = "recording"; }
    pause() { this.state = "paused"; }
    resume() { this.state = "recording"; }
    stop() {
        if (this.state === "inactive") return;
        this.state = "inactive";
        this.ondataavailable?.({ data: new dom.window.Blob(["audio"], { type: "audio/webm" }) as unknown as Blob });
        this.onstop?.({});
    }
}
anyGlobal.MediaRecorder = MockMediaRecorder;

Object.defineProperty(dom.window.navigator, "mediaDevices", {
    configurable: true,
    value: {
        getUserMedia: async () => {
            micState.getUserMediaCalls += 1;
            if (!microphoneAvailable) throw new Error("NotAllowedError: permission denied");
            micState.liveTracks += 1;
            return { getTracks: () => [{ stop: () => { micState.liveTracks -= 1; } }] };
        },
    },
});

anyGlobal.AudioContext = class {
    createMediaStreamSource() { return { connect() {}, disconnect() {} }; }
    createAnalyser() { return { fftSize: 1024, connect() {}, disconnect() {}, getByteTimeDomainData() {} }; }
    close() {}
};

export { dom };
