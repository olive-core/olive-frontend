import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { selectMemoryUndo, usePrescriptionStore } from "@/stores/prescription-store";
import AdviceList from "@/components/prescription/advice-list";
import MemoryEditor from "@/components/memory/memory-editor";
import { MemoryApplyEnabledContext } from "@/components/memory/memory-apply-context";
import {
    filledMemorySections,
    memoryBodyFromSections,
    memorySectionChips,
    type MemoryBody,
    type MemorySectionValues,
} from "@/lib/memory";
import type { PrescriptionResponseType } from "@/types/prescription";
import type { StoredRxItem } from "@/lib/rx-medicine";
import { eligibleFollowUpSources } from "@/hooks/use-patient-consultations";
import type { PatientPrescriptionListItem } from "@/types/patient";
import type { ClinicianConsultationItem } from "@/types/consultation";
import { filterConsultationsByAccess } from "@/components/dashboard/consultations/filters/filter-by-access";
import { mergeClinicianConsultations } from "@/components/dashboard/consultations/use-clinician-consultations";

let failures = 0;
function check(label: string, passed: boolean, detail = "") {
    if (!passed) failures += 1;
    console.log(`${passed ? "  PASS" : "  FAIL"}  ${label}${passed || !detail ? "" : `   -> ${detail}`}`);
}
const section = (title: string) => console.log(`\n${title}`);

const storedMedicine = (tradeName: string): StoredRxItem => ({
    medicine_id: null,
    trade_name: tradeName,
    generic_name: tradeName,
    dosage: "1 tab",
    duration: "1 Months",
    routine: {
        before_breakfast: false, after_breakfast: true, before_lunch: false,
        after_lunch: false, before_dinner: false, after_dinner: false, gap_hour: 0,
    },
    dosage_form: "Tablet",
    type: "tablet",
    route: "P/O",
    site: null,
    dose: null,
    schedule: { timing: "after", morning: 1, noon: null, night: null, gap_hours: null, code: null },
    frequency_code: null,
    duration_value: 1,
    duration_unit: "Months",
    duration_preset: null,
    instructions: null,
});

const ADVICE_MEMORY: MemoryBody = { advice_list: ["Walk 30 minutes daily", "Low salt diet"] };

const DIABETES_MEMORY: MemoryBody = {
    chief_complaints: [{ name_text: "Polyuria", duration: "2 weeks", notes: "" }],
    diagnoses: [{ name_text: "Type 2 diabetes mellitus" }],
    investigations: [{ name_text: "HbA1c", reason: "Glycaemic control", priority: "routine" }],
    rx_list: [storedMedicine("Comet 500")],
    advice_list: ["Foot care every night"],
    follow_up_days: 30,
    follow_up_notes: "Bring the sugar chart",
};

const generatedDraft = (): PrescriptionResponseType => ({
    chief_complaints: [{ complaint_name: "Fever", clinical_note: "" }],
    history: [{ history_name: "Hypertension", clinical_note: "" }],
    diagnoses: [{ diagnosis_name: "Viral fever", icd_code: "", confidence: 0.9, clinical_reasoning: "" }],
    medicines: [{ generic_name: "Paracetamol", trade_name: "Napa", dosage: "1 tab", routine: { gap_hours: 0, meal_times: [] }, duration: "3 days", purpose: "" }],
    investigations: [{ investigation_name: "CBC", reason: "", priority: "routine" }],
    advice: ["Rest and fluids"],
    summary: "Seen for fever",
    safety_net: ["Return if fever persists past 3 days"],
    vitals: { pulse: 88 },
    follow_up: { follow_up_days: 7, follow_up_notes: null },
} as unknown as PrescriptionResponseType);

const store = () => usePrescriptionStore.getState();
const reset = () => store().resetStore();

// ─── DOM harness ────────────────────────────────────────────────────────────

const container = () => document.getElementById("root")!;
const text = () => container().textContent ?? "";
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const flush = async (ms = 0) => { await act(async () => { await wait(ms); }); };

let reactRoot: Root | null = null;

async function render(node: ReactNode) {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    await act(async () => {
        reactRoot ??= createRoot(container());
        reactRoot.render(<QueryClientProvider client={queryClient}>{node}</QueryClientProvider>);
    });
    await flush(20);
}

async function unmount() {
    await act(async () => { reactRoot?.render(null); });
    await flush(20);
}

const buttonLabelled = (label: string) => document.querySelector(`[aria-label="${label}"]`);
const buttonSaying = (label: string) =>
    [...document.querySelectorAll("button")].find((button) => (button.textContent ?? "").includes(label));

const click = async (element: Element | null | undefined) => {
    await act(async () => { (element as HTMLElement | null)?.click(); });
    await flush(20);
};

function StoreBoundAdviceList() {
    const advice = usePrescriptionStore((state) => state.advice);
    const setAdvice = usePrescriptionStore((state) => state.setAdvice);
    return <AdviceList value={advice} onChange={setAdvice} />;
}

// Anything mounted is watching the store, so a reset between scenarios is a render.
const resetMounted = async () => { await act(async () => { reset(); }); };

async function runDomScenarios() {
    section("Memory controls appear on a prescription and nowhere else");
    {
        await resetMounted();
        await render(<StoreBoundAdviceList />);
        check("a plain advice list carries no memory button",
            buttonLabelled("Fill advice from a memory") === null);

        await render(
            <MemoryApplyEnabledContext.Provider value={true}>
                <StoreBoundAdviceList />
            </MemoryApplyEnabledContext.Provider>,
        );
        check("a prescription's advice section offers one",
            buttonLabelled("Fill advice from a memory") !== null);
    }

    section("The undo shows on the section it replaced");
    {
        await resetMounted();
        await act(async () => { store().setAdvice(["Original advice"]); });
        await flush(20);
        check("nothing to undo before a memory is applied", !text().includes("Replaced by"));

        await act(async () => { store().applyMemory("Gastritis diet advice", ADVICE_MEMORY); });
        await flush(20);
        check("the undo names the memory that replaced the section",
            text().includes("Replaced by") && text().includes("Gastritis diet advice"), text().slice(0, 200));

        await click(buttonSaying("Undo"));
        check("clicking undo restores the previous advice",
            JSON.stringify(store().advice) === JSON.stringify(["Original advice"]));
        check("the undo disappears once used", !text().includes("Replaced by"));

        await unmount();
    }

    section("The memory editor says what the memory will fill");
    {
        await resetMounted();
        await render(
            <MemoryEditor
                title="New memory"
                subtitle="Save the prescription for a case you see often"
                submitLabel="Create memory"
                submittingLabel="Creating..."
                isPending={false}
                isError={false}
                onSubmit={() => {}}
            />,
        );
        check("an empty memory says so", text().includes("This memory is empty"), text().slice(0, 160));
        check("the editor offers no memory buttons of its own",
            buttonLabelled("Fill advice from a memory") === null);

        await act(async () => {
            store().setAdvice(["Foot care every night"]);
            store().addDiagnosis({ name: "Type 2 diabetes mellitus" });
        });
        await flush(20);
        check("the line lists what is filled, in prescription order",
            text().includes("Diagnosis · Advice"), text().slice(0, 400));

        await unmount();
    }
}

// ─── Store rules ────────────────────────────────────────────────────────────

async function run() {
    section("Owned consultations and shared Cases stay distinguishable in one list");
    {
        const owned = [{
            prescription_id: "owned",
            created_at: "2026-08-17T09:00:00Z",
            diagnoses_summary: [],
            patient_id: "patient-1",
            access_type: "owned",
        }] as ClinicianConsultationItem[];
        const shared = [{
            prescription_id: "shared-latest",
            created_at: "2026-08-18T09:00:00Z",
            diagnoses_summary: [],
            patient_id: "patient-2",
            access_type: "shared",
            case_root_session_id: "case-root",
        }] as ClinicianConsultationItem[];

        const combined = mergeClinicianConsultations(owned, shared);
        check("the latest shared Case joins the normal consultation list", combined[0]?.prescription_id === "shared-latest");
        check("Mine hides shared Cases", filterConsultationsByAccess(combined, "owned").map((item) => item.prescription_id).join() === "owned");
        check("Shared shows one Case entry", filterConsultationsByAccess(combined, "shared").map((item) => item.case_root_session_id).join() === "case-root");
    }

    section("Follow-up source eligibility keeps only standalone visits and series endpoints");
    {
        const consultation = (
            sessionId: string,
            hasFollowUp: boolean,
            parentId?: string,
        ): PatientPrescriptionListItem => ({
            prescription_id: `prescription-${sessionId}`,
            session_id: sessionId,
            created_at: "2026-08-17T09:00:00+06:00",
            diagnoses_summary: [],
            clinician_id: "clinician-1",
            clinician_name: "Doctor",
            has_follow_up: hasFollowUp,
            follow_up_of_session_id: parentId,
        });
        const eligible = eligibleFollowUpSources([
            consultation("dermatology-root", true),
            consultation("dermatology-latest", false, "dermatology-root"),
            consultation("orthopedic-standalone", false),
        ]);

        check("an intermediate consultation is hidden",
            !eligible.some((item) => item.session_id === "dermatology-root"));
        check("the latest consultation in a series remains available",
            eligible.some((item) => item.session_id === "dermatology-latest"));
        check("a standalone consultation can start its first follow-up",
            eligible.some((item) => item.session_id === "orthopedic-standalone"));
    }

    section("Which sections a memory covers is derived from its contents");
    {
        const values = (partial: Partial<MemorySectionValues>): MemorySectionValues => ({
            chiefComplaint: [], history: [], diagnosis: [], investigation: [],
            medicine: [], advice: [],
            followUp: { follow_up_days: null, follow_up_notes: null },
            ...partial,
        });

        check("an advice-only memory covers advice alone",
            JSON.stringify(filledMemorySections(values({ advice: ["Rest"] }))) === JSON.stringify(["advice"]));

        check("a half-written row does not make a section count as filled",
            filledMemorySections(values({ diagnosis: [{ name: "  " }] })).length === 0);

        check("a zero-day follow-up is not a follow-up",
            filledMemorySections(values({ followUp: { follow_up_days: 0, follow_up_notes: "" } })).length === 0);

        check("a follow-up note alone fills the section",
            JSON.stringify(filledMemorySections(values({ followUp: { follow_up_days: null, follow_up_notes: "Review sooner if worse" } }))) === JSON.stringify(["followUp"]));

        const sevenSections = filledMemorySections(values({
            chiefComplaint: [{ name: "Polyuria" }],
            history: [{ name: "Diabetes" }],
            diagnosis: [{ name: "T2DM" }],
            investigation: [{ name: "HbA1c" }],
            medicine: [{ name: "Comet", value: "Comet", routine: {} }],
            advice: ["Foot care"],
            followUp: { follow_up_days: 30, follow_up_notes: null },
        }));
        check("all seven sections can be covered", sevenSections.length === 7, sevenSections.join(","));

        check("chips read in prescription order",
            JSON.stringify(memorySectionChips(["advice", "diagnosis", "medicine"])) === JSON.stringify(["Dx", "Rx", "Adv"]));
    }

    section("Saving a memory keeps only what belongs in one");
    {
        const body = memoryBodyFromSections({
            chiefComplaint: [],
            history: [],
            diagnosis: [{ name: "Acid peptic disease" }, { name: "   " }],
            investigation: [],
            medicine: [],
            advice: ["Avoid spicy food", "  "],
            followUp: { follow_up_days: 0, follow_up_notes: "  " },
        });

        check("blank sections are left out entirely",
            !("chief_complaints" in body) && !("rx_list" in body) && !("follow_up_days" in body),
            JSON.stringify(Object.keys(body)));
        check("half-written rows are dropped", body.diagnoses?.length === 1 && body.advice_list?.length === 1);
        check("vitals, summary and safety net are never carried",
            !("on_examinations" in body) && !("summary" in body) && !("safety_net" in body));
    }

    section("Applying a whole memory");
    {
        reset();
        store().setAdvice(["Typed by the doctor"]);
        store().addDiagnosis({ name: "Pre-existing diagnosis" });
        store().applyMemory("Type 2 diabetes", DIABETES_MEMORY);

        check("every section the memory carries is written", store().medicine.length === 1 && store().investigation.length === 1);
        check("the doctor's diagnosis is replaced", store().diagnosis[0]?.name === "Type 2 diabetes mellitus");
        check("follow-up comes across whole",
            store().followUp.follow_up_days === 30 && store().followUp.follow_up_notes === "Bring the sugar chart");
        check("a medicine reloads with its schedule intact", store().medicine[0]?.schedule?.morning === 1);

        check("history is untouched, because the memory does not carry it",
            store().history.length === 0 && !store().appliedMemories.history);
    }

    section("A memory that leaves a section blank does not disturb it");
    {
        reset();
        store().addDiagnosis({ name: "Gastritis" });
        store().addMedicine({ name: "Omeprazole", value: "Omeprazole", routine: {} });
        store().applyMemory("Gastritis diet advice", ADVICE_MEMORY);

        check("advice is filled", store().advice.length === 2);
        check("diagnosis is left alone", store().diagnosis[0]?.name === "Gastritis");
        check("medicine is left alone", store().medicine[0]?.name === "Omeprazole");
    }

    section("A memory saved before the blank-row rule cannot drop one on a patient");
    {
        reset();
        store().applyMemory("Older memory", {
            rx_list: [storedMedicine("Comet 500"), storedMedicine("")],
            advice_list: ["Foot care", "   "],
        });

        check("the nameless medicine is dropped on the way in", store().medicine.length === 1);
        check("the blank advice line is dropped too", store().advice.length === 1);
    }

    section("Undo puts back exactly what was replaced");
    {
        reset();
        store().setAdvice(["Original advice"]);
        store().applyMemory("Gastritis diet advice", ADVICE_MEMORY);

        const undo = selectMemoryUndo(store(), "advice");
        check("the replaced section offers an undo naming the memory", undo?.memoryName === "Gastritis diet advice");

        store().undoMemorySection("advice");
        check("undo restores the previous contents",
            JSON.stringify(store().advice) === JSON.stringify(["Original advice"]));
        check("undo clears the section's provenance", !store().appliedMemories.advice);
    }

    section("Undo is offered only where something was actually replaced");
    {
        reset();
        store().applyMemory("Gastritis diet advice", ADVICE_MEMORY);

        check("an empty section shows no undo", selectMemoryUndo(store(), "advice") === null);
        check("but the section is still owned by the memory", !!store().appliedMemories.advice);
    }

    section("Several memories in one session");
    {
        reset();
        store().setAdvice(["Original advice"]);
        store().applyMemory("First memory", ADVICE_MEMORY);
        store().applyMemory("Second memory", { advice_list: ["Second memory advice"] });

        check("the undo names the memory that replaced last",
            selectMemoryUndo(store(), "advice")?.memoryName === "Second memory");

        store().undoMemorySection("advice");
        check("undo steps back one apply, not all the way to the start",
            JSON.stringify(store().advice) === JSON.stringify(ADVICE_MEMORY.advice_list));
    }

    section("The undo goes away once the doctor moves on");
    {
        reset();
        store().setAdvice(["Original advice"]);
        store().applyMemory("Gastritis diet advice", ADVICE_MEMORY);
        check("the undo is there before the edit", selectMemoryUndo(store(), "advice") !== null);

        store().setAdvice([...store().advice, "Added by the doctor"]);
        check("editing the section retires the undo", selectMemoryUndo(store(), "advice") === null);
        check("the section still counts as memory-filled", !!store().appliedMemories.advice);
    }

    section("Applying one section only");
    {
        reset();
        store().addDiagnosis({ name: "Kept diagnosis" });
        store().applyMemory("Type 2 diabetes", DIABETES_MEMORY, ["advice"]);

        check("only the chosen section is filled", store().advice.length === 1 && store().medicine.length === 0);
        check("the rest of the prescription is untouched", store().diagnosis[0]?.name === "Kept diagnosis");
        check("only the chosen section is owned",
            !!store().appliedMemories.advice && !store().appliedMemories.diagnosis);
    }

    section("A generated draft never overwrites a memory");
    {
        reset();
        store().applyMemory("Type 2 diabetes", DIABETES_MEMORY, ["medicine", "advice"]);
        store().getInitialPrescription(generatedDraft());

        check("the memory's medicine survives the draft", store().medicine[0]?.name === "Comet 500");
        check("the memory's advice survives the draft", store().advice[0] === "Foot care every night");
        check("sections the memory left alone take the draft", store().diagnosis[0]?.name === "Viral fever");
        check("the draft still owns the summary and safety net",
            store().summary === "Seen for fever" && store().safetyNet.length === 1);

        store().undoMemorySection("medicine");
        check("undoing after a draft leaves the section empty, as it was before the apply",
            store().medicine.length === 0);
    }

    section("Saving a generated follow-up preserves grounded state metadata");
    {
        reset();
        const draft = generatedDraft();
        draft.session_id = "follow-up-session";
        draft.medicines[0].medicine_id = "medicine-1";
        draft.summary = (
            "S: Fever is improving.\n\nO: Pulse 88 bpm.\n\n"
            + "A: Viral fever improving.\n\nP: Continue hydration and review tomorrow."
        );
        draft.vital_sources = {
            pulse: { observed_at: "2026-08-16T09:00:00+06:00", session_id: "previous-session" },
        };

        await store().getInitialPrescription(draft);
        const payload = store().getSubmitPayload("follow-up-session") as {
            rx_list: StoredRxItem[];
            clinical_note: {
                subjective: string;
                objective: string;
                assessment: string;
                plan: string;
            } | null;
            vital_sources: Record<string, { observed_at: string; session_id: string }>;
        };

        check("the database-grounded medicine id survives review and save",
            payload.rx_list[0]?.medicine_id === "medicine-1");
        check("the encounter note is saved in structured form",
            payload.clinical_note?.assessment === "Viral fever improving."
            && payload.clinical_note?.plan === "Continue hydration and review tomorrow.");
        check("a carried vital keeps its original observation source",
            payload.vital_sources.pulse?.session_id === "previous-session");
    }

    section("A re-generate clears the previous run without touching a memory");
    {
        reset();
        store().applyMemory("Type 2 diabetes", DIABETES_MEMORY, ["medicine"]);
        store().getInitialPrescription(generatedDraft());
        store().setPartialData(generatedDraft());

        check("the generated investigation is cleared while the new draft streams", store().investigation.length === 0);
        check("the memory's medicine is left in place", store().medicine[0]?.name === "Comet 500");
    }

    section("Starting a new prescription forgets the memories applied to the last one");
    {
        reset();
        store().applyMemory("Type 2 diabetes", DIABETES_MEMORY);
        store().initiatePrescription("patient-2", "session-2");

        check("provenance is cleared", Object.keys(store().appliedMemories).length === 0);
        check("sections are cleared", store().medicine.length === 0 && store().advice.length === 0);
    }

    await runDomScenarios();

    console.log(`\n${failures === 0 ? "ALL PASS" : `${failures} FAILURE(S)`}`);
    process.exitCode = failures === 0 ? 0 : 1;
}

export const runTest = run;
