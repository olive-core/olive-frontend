import fs from "node:fs";

import { generateAriseDraft, type AriseStreamHandlers } from "../../src/lib/arise-stream";
import {
    awaitRecordingFinalization,
    RecordingFinalizationTimeoutError,
    trackRecordingFinalization,
} from "../../src/lib/recording-finalization";

const write = (...args: unknown[]) =>
    fs.writeSync(1, args.map((arg) => (typeof arg === "string" ? arg : JSON.stringify(arg))).join(" ") + "\n");
console.log = write;
console.error = write;
console.warn = write;

const encoder = new TextEncoder();
const accepted = 'event: accepted\ndata: {"payload":{}}\n\n';
const failed = 'event: error\ndata: {"payload":{"error":"429 RESOURCE_EXHAUSTED"}}\n\n';
const completed = 'event: completed\ndata: {"payload":{"summary":"done"}}\n\n';

let failures = 0;

function check(label: string, passed: boolean, detail = "") {
    if (!passed) failures += 1;
    console.log(`${passed ? "  PASS" : "  FAIL"}  ${label}${passed || !detail ? "" : ` -> ${detail}`}`);
}

function streamFrom(parts: string[], onCancel?: () => void) {
    return new ReadableStream<Uint8Array>({
        start(controller) {
            for (const part of parts) controller.enqueue(encoder.encode(part));
            controller.close();
        },
        cancel: onCancel,
    });
}

function openStream(onCancel?: () => void) {
    return new ReadableStream<Uint8Array>({ cancel: onCancel });
}

function responseFor(parts: string[], onCancel?: () => void) {
    return new Response(streamFrom(parts, onCancel), {
        status: 200,
        headers: { "Content-Type": "text/event-stream" },
    });
}

function request(signal: AbortSignal, onCompleted = (_payload: unknown) => {}) {
    const handlers: AriseStreamHandlers = {
        onPartial: () => {},
        onScribe: () => {},
        onDecide: () => {},
        onCompleted: onCompleted as AriseStreamHandlers["onCompleted"],
    };
    return {
        sessionId: "session-1",
        accessToken: "test-token",
        signal,
        handlers,
    };
}

async function testNormalCompletion() {
    let fetchCalls = 0;
    let summary = "";
    globalThis.fetch = async () => {
        fetchCalls += 1;
        return responseFor([accepted.slice(0, 10), accepted.slice(10), completed]);
    };

    const outcome = await generateAriseDraft(request(new AbortController().signal, (payload: any) => {
        summary = payload.summary;
    }));

    console.log("\nnormal stream");
    check("completes on the first attempt", outcome.status === "completed" && fetchCalls === 1);
    check("delivers the final payload", summary === "done", summary);
}

async function testBackendErrorRetries() {
    let fetchCalls = 0;
    globalThis.fetch = async () => {
        fetchCalls += 1;
        return fetchCalls === 1 ? responseFor([accepted, failed]) : responseFor([completed]);
    };

    const outcome = await generateAriseDraft(request(new AbortController().signal));

    console.log("\nbackend error then recovery");
    check("silently retries a terminal backend error", fetchCalls === 2, String(fetchCalls));
    check("returns the recovered draft", outcome.status === "completed", JSON.stringify(outcome));
}

async function testUnexpectedEofStops() {
    let fetchCalls = 0;
    globalThis.fetch = async () => {
        fetchCalls += 1;
        return responseFor([accepted]);
    };

    const outcome = await generateAriseDraft(request(new AbortController().signal));

    console.log("\nunexpected EOF");
    check("uses the one automatic retry", fetchCalls === 2, String(fetchCalls));
    check(
        "reports failure instead of remaining in loading state",
        outcome.status === "failed" && outcome.reason.includes("before a result"),
        JSON.stringify(outcome),
    );
}

async function testIdleStreamStops() {
    let fetchCalls = 0;
    let cancelledStreams = 0;
    globalThis.fetch = async () => {
        fetchCalls += 1;
        return new Response(openStream(() => { cancelledStreams += 1; }), { status: 200 });
    };

    const outcome = await generateAriseDraft(request(new AbortController().signal));

    console.log("\nsilent stream");
    check("does not leave a silent stream open", cancelledStreams === 2, String(cancelledStreams));
    check("bounds the silent-stream retry", fetchCalls === 2, String(fetchCalls));
    check(
        "returns an inactivity failure",
        outcome.status === "failed" && outcome.reason.includes("inactive"),
        JSON.stringify(outcome),
    );
}

async function testTransportFailureRetries() {
    let fetchCalls = 0;
    globalThis.fetch = async () => {
        fetchCalls += 1;
        if (fetchCalls === 1) throw new TypeError("network disconnected");
        return responseFor([completed]);
    };

    const outcome = await generateAriseDraft(request(new AbortController().signal));

    console.log("\ntransport failure then recovery");
    check("retries a failed fetch", fetchCalls === 2, String(fetchCalls));
    check("returns the recovered response", outcome.status === "completed", JSON.stringify(outcome));
}

async function testAbortDoesNotRetry() {
    let fetchCalls = 0;
    const controller = new AbortController();
    globalThis.fetch = async () => {
        fetchCalls += 1;
        return new Response(openStream(), { status: 200 });
    };

    const generation = generateAriseDraft(request(controller.signal));
    controller.abort();
    let error: unknown;
    try {
        await generation;
    } catch (caught) {
        error = caught;
    }

    console.log("\ncancellation");
    check("surfaces cancellation as AbortError", error instanceof Error && error.name === "AbortError", String(error));
    check("does not retry clinician cancellation", fetchCalls === 1, String(fetchCalls));
}

async function testFinalRecordingWait() {
    let finishUpload: (() => void) | undefined;
    trackRecordingFinalization("slow-upload", new Promise<void>((resolve) => {
        finishUpload = resolve;
    }));

    let timeoutError: unknown;
    try {
        await awaitRecordingFinalization("slow-upload", { timeoutMs: 10 });
    } catch (caught) {
        timeoutError = caught;
    }

    let retryTimeoutError: unknown;
    try {
        await awaitRecordingFinalization("slow-upload", { timeoutMs: 10 });
    } catch (caught) {
        retryTimeoutError = caught;
    }

    finishUpload?.();
    await awaitRecordingFinalization("slow-upload", { timeoutMs: 10 });

    const failedUpload = Promise.reject(new Error("upload failed"));
    trackRecordingFinalization("failed-upload", failedUpload);
    await Promise.resolve();
    let uploadError: unknown;
    try {
        await awaitRecordingFinalization("failed-upload");
    } catch (caught) {
        uploadError = caught;
    }

    console.log("\nfinal recording upload");
    check("times out a stuck final upload", timeoutError instanceof RecordingFinalizationTimeoutError, String(timeoutError));
    check("retains the pending upload for a retry", retryTimeoutError instanceof RecordingFinalizationTimeoutError, String(retryTimeoutError));
    check("does not hide a fast upload rejection", String(uploadError).includes("upload failed"), String(uploadError));
}

async function run() {
    await testNormalCompletion();
    await testBackendErrorRetries();
    await testUnexpectedEofStops();
    await testIdleStreamStops();
    await testTransportFailureRetries();
    await testAbortDoesNotRetry();
    await testFinalRecordingWait();

    console.log(failures === 0 ? "\nALL ARISE CHECKS PASSED" : `\n${failures} ARISE CHECK(S) FAILED`);
    process.exit(failures === 0 ? 0 : 1);
}

run().catch((error) => {
    console.error("UNEXPECTED TEST FAILURE", String(error));
    process.exit(1);
});
