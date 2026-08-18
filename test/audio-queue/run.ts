import "fake-indexeddb/auto";

// Node has no navigator. Leaving it empty is the honest shape for the browsers that lack
// Web Locks and persistent storage, which is the configuration the queue must still work in.
(globalThis as { navigator?: unknown }).navigator ??= {};

import {
    enqueueChunk,
    forgetDiscardedSession,
    nudgeDrainer,
    queueStatus,
    sessionChunks,
    setDrainUrgency,
    startDrainer,
    stopDrainer,
    sweepSyncedChunks,
    unsentChunkCount,
    type QueuedChunk,
} from "@/lib/audio-queue";
import { installProbeNetwork, network, type NetworkProfile } from "./network";

const A_DAY_MS = 24 * 60 * 60 * 1000;

let failures = 0;
function check(label: string, passed: boolean, detail = "") {
    if (!passed) failures += 1;
    console.log(`${passed ? "  PASS" : "  FAIL"}  ${label}${passed || !detail ? "" : `   -> ${detail}`}`);
}
const section = (title: string) => console.log(`\n${title}`);

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Polls until the condition holds, so a passing test never sleeps longer than it must. */
async function until(condition: () => Promise<boolean>, timeoutMs = 8_000): Promise<boolean> {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
        if (await condition()) return true;
        await wait(25);
    }
    return false;
}

async function record(sessionId: string, count: number, at = Date.now()): Promise<void> {
    const realNow = Date.now;
    Date.now = () => at;
    try {
        for (let chunkIndex = 0; chunkIndex < count; chunkIndex += 1) {
            await enqueueChunk({
                sessionId,
                chunkIndex,
                blob:        new Blob([`audio-${chunkIndex}`], { type: "audio/webm" }),
                mimeType:    "audio/webm",
                byteSize:    64,
                chunkSizeMs: 30_000,
                overlapMs:   2_000,
            });
        }
    } finally {
        Date.now = realNow;
    }
    nudgeDrainer();
}

const goOnline = (profile: NetworkProfile = "online") => {
    network.profile = profile;
    nudgeDrainer();
};

const chunksIn = (sessionId: string) => sessionChunks(sessionId);
const stateOf = (chunks: QueuedChunk[], index: number) => chunks.find((c) => c.chunkIndex === index)?.state;

async function main() {
    installProbeNetwork();
    // The doctor is waiting on the prescribe screen for most of these, and the patient
    // ladder would put a passing test to sleep for thirty seconds at a time.
    setDrainUrgency("urgent");
    startDrainer();

    section("1. The network is down for the whole recording");
    network.reset("offline");
    await record("offline-session", 3);
    await wait(400);
    check("nothing reached the server", network.delivered.length === 0, `delivered=${network.delivered.length}`);
    let chunks = await chunksIn("offline-session");
    check("all three are still on the device", chunks.length === 3, `chunks=${chunks.length}`);
    check("their audio was not dropped", chunks.every((c) => c.blob !== null));
    check("none is marked delivered", chunks.every((c) => c.state === "pending"));

    section("2. The network comes back");
    goOnline();
    const drained = await until(async () => (await unsentChunkCount("offline-session")) === 0);
    check("everything caught up", drained, `unsent=${await unsentChunkCount("offline-session")}`);
    check("the server holds every chunk", network.storedChunkIndexes("offline-session").join() === "0,1,2",
        network.storedChunkIndexes("offline-session").join());
    chunks = await chunksIn("offline-session");
    check("receipts remain", chunks.length === 3, `chunks=${chunks.length}`);
    check("audio was released", chunks.every((c) => c.blob === null));
    await forgetDiscardedSession("offline-session");

    section("3. A chunk the server stored but never acknowledged");
    network.reset("succeeds-but-times-out");
    await record("timeout-session", 1);
    const redelivered = await until(async () => network.deliveryCount("timeout-session", 0) >= 2);
    check("the client retried it", redelivered, `deliveries=${network.deliveryCount("timeout-session", 0)}`);
    check("it is still unacknowledged", (await unsentChunkCount("timeout-session")) === 1);
    goOnline();
    check("it settles once an answer arrives",
        await until(async () => (await unsentChunkCount("timeout-session")) === 0));
    check("the server holds it exactly once, by index",
        network.storedChunkIndexes("timeout-session").join() === "0",
        network.storedChunkIndexes("timeout-session").join());
    check("which took more than one delivery to establish",
        network.deliveryCount("timeout-session", 0) > 1,
        `deliveries=${network.deliveryCount("timeout-session", 0)}`);
    await forgetDiscardedSession("timeout-session");

    section("4. A captive portal answering 200 to everything");
    network.reset("captive-portal");
    await record("portal-session", 2);
    await wait(400);
    check("the login page was not mistaken for delivery",
        (await unsentChunkCount("portal-session")) === 2,
        `unsent=${await unsentChunkCount("portal-session")}`);
    check("the audio is intact", (await chunksIn("portal-session")).every((c) => c.blob !== null));
    goOnline();
    check("it uploads once past the portal",
        await until(async () => (await unsentChunkCount("portal-session")) === 0));
    await forgetDiscardedSession("portal-session");

    section("5. A connection that drops one request in three");
    network.reset("flaky");
    await record("flaky-session", 10);
    check("all ten arrive eventually",
        await until(async () => (await unsentChunkCount("flaky-session")) === 0, 20_000),
        `unsent=${await unsentChunkCount("flaky-session")}`);
    check("in recording order", network.storedChunkIndexes("flaky-session").join() === "0,1,2,3,4,5,6,7,8,9",
        network.storedChunkIndexes("flaky-session").join());
    await forgetDiscardedSession("flaky-session");

    section("6. A chunk the server refuses outright");
    network.reset("rejects");
    await record("rejected-session", 1);
    const settled = await until(async () => (await chunksIn("rejected-session"))[0]?.state === "rejected");
    check("it stops being retried", settled, `state=${stateOf(await chunksIn("rejected-session"), 0)}`);
    check("but its audio is kept", (await chunksIn("rejected-session"))[0]?.blob !== null);
    check("and the doctor is told", queueStatus().health === "attention", `health=${queueStatus().health}`);
    await forgetDiscardedSession("rejected-session");

    section("7. The sweep never takes audio the server has not confirmed");
    network.reset("online");
    await record("old-synced", 1, Date.now() - 3 * A_DAY_MS);
    check("the old delivered chunk is acknowledged",
        await until(async () => (await unsentChunkCount("old-synced")) === 0));

    // Parked with the drainer stopped, so it stays exactly what the sweep must not touch:
    // three-day-old audio the server has never seen.
    stopDrainer();
    await record("old-unsent", 1, Date.now() - 3 * A_DAY_MS);

    const removed = await sweepSyncedChunks();
    check("the sweep removed something", removed >= 1, `removed=${removed}`);
    check("the delivered receipt is gone", (await chunksIn("old-synced")).length === 0);
    check("the undelivered audio is untouched", (await chunksIn("old-unsent")).length === 1);
    check("and still has its audio", (await chunksIn("old-unsent"))[0]?.blob !== null);
    await forgetDiscardedSession("old-unsent");

    console.log(failures === 0 ? "\nALL CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`);
    process.exit(failures === 0 ? 0 : 1);
}

void main();
