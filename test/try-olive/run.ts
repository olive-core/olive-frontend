import { SAMPLE_MEMORIES } from "@/components/try-olive/sample-content";
import assert from "node:assert/strict";
import { startDemo, generateDemo, encodePcmWav } from "@/lib/try-olive";
import { createPrescriptionStore, usePrescriptionStore } from "@/stores/prescription-store";

async function main() {
    const originalFetch = globalThis.fetch;
    try {
        globalThis.fetch = async () => new Response(JSON.stringify({ detail: "Not Found" }), { status: 404 });
        await assert.rejects(startDemo(), (error: Error) =>
            error.message.includes("No account is needed") && !error.message.includes("Not Found"));
        console.log("PASS: a missing endpoint is an availability error, not a signup requirement");

        let submitted: RequestInit | undefined;
        globalThis.fetch = async (_url, options) => {
            submitted = options;
            return new Response('event: scribe_complete\ndata: {"payload":{"summary":"Streaming note"}}\n\nevent: decide_complete\ndata: {"payload":{"diagnoses":[]}}\n\nevent: completed\ndata: {"payload":{"summary":"Fictional note","session_id":"demo"}}\n\n');
        };
        const stages: string[] = [];
        const draft = await generateDemo(new Blob(["audio"]), { name: "Fictional name", age: 32, sex: "female" }, new AbortController().signal, { onPartial: () => {}, onScribe: () => { stages.push("scribe"); }, onDecide: () => { stages.push("decide"); } });
        assert.deepEqual(stages, ["scribe", "decide"]);
        assert.equal(draft.summary, "Fictional note");
        assert.equal(new Headers(submitted?.headers).get("X-Demo-Age"), "32");
        assert.equal(new Headers(submitted?.headers).get("Authorization"), null);
        assert.ok(!JSON.stringify(submitted).includes("Fictional name"));
        console.log("PASS: anonymous generation returns its draft without transmitting the fictional name");

        const wav = new DataView(encodePcmWav(new Float32Array([-2, 0, 2])));
        assert.equal(wav.getUint32(24, true), 16000);
        assert.equal(wav.getUint16(22, true), 1);
        assert.equal(wav.getInt16(44, true), -32768);
        assert.equal(wav.getInt16(48, true), 32767);
        assert.equal(wav.getUint32(40, true), 6);
        console.log("PASS: recording conversion produces bounded mono PCM samples");

        const doctor = usePrescriptionStore.getState();
        const previousAdvice = doctor.advice;
        const demo = createPrescriptionStore();
        demo.getState().setAdvice(["Before sample"]);
        demo.getState().applyMemory("Sample", { advice_list: ["Example advice"] });
        assert.deepEqual(demo.getState().advice, ["Example advice"]);
        assert.equal(usePrescriptionStore.getState().advice, previousAdvice);
        demo.getState().undoMemorySection("advice");
        assert.deepEqual(demo.getState().advice, ["Before sample"]);
        console.log("PASS: demo Memory and Undo are isolated from the doctor draft");
        const memory = SAMPLE_MEMORIES[0];
        demo.getState().applyMemory(memory.template_name, memory.prescription_data, ["investigation"]);
        assert.equal(demo.getState().investigation.length, 3);
        assert.deepEqual(demo.getState().advice, ["Before sample"]);
        demo.getState().undoMemorySection("investigation");
        assert.equal(demo.getState().investigation.length, 0);
        demo.getState().applyMemory(memory.template_name, memory.prescription_data);
        assert.equal(demo.getState().medicine.length, 2);
        assert.equal(demo.getState().followUp.follow_up_days, 7);
        console.log("PASS: copied Dengue Fever memory supports section-only apply, full apply and Undo");
    } finally { globalThis.fetch = originalFetch; }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
