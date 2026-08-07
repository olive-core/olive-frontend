import type { ChiefComplaintType, DiagnosisType, InvestigationType, MeedicineType, HistoryType, PrescriptionResponseType, VitalsType, FollowUpType } from "@/types/prescription";
import { hasAnyVital, vitalsForSubmit } from "@/lib/vitals";
import { composeDose, parseDuration } from "@/lib/rx-compose";
import { scheduleFromRoutine, scheduleFromStored } from "@/lib/rx-format";
import { serializeMedicine } from "@/lib/rx-medicine";
import {
    EMPTY_FOLLOW_UP,
    filledMemorySectionValues,
    isMemorySectionFilled,
    omitMemoryOwnedSections,
    type AppliedMemories,
    type AppliedMemory,
    type MemoryBody,
    type MemorySectionKey,
    type MemorySectionValues,
} from "@/lib/memory";
import { create } from "zustand";

function routineForGenerated(routine?: { gap_hours?: number; meal_times?: string[] }) {
    const meals = routine?.meal_times ?? [];
    return {
        beforeBreakfast: meals.includes("before_breakfast"),
        afterBreakfast: meals.includes("after_breakfast"),
        beforeLunch: meals.includes("before_lunch"),
        afterLunch: meals.includes("after_lunch"),
        beforeDinner: meals.includes("before_dinner"),
        afterDinner: meals.includes("after_dinner"),
        gapHours: routine?.gap_hours || 0,
    };
}

function mapGeneratedChiefComplaints(items: PrescriptionResponseType["chief_complaints"] | undefined) {
    return items?.map(item => ({
        name: item.complaint_name,
        duration: "",
        notes: item.clinical_note || "",
    })) || [];
}

function mapGeneratedHistory(items: PrescriptionResponseType["history"] | undefined) {
    return items?.map(item => ({
        name: item.history_name,
        duration: "",
        notes: item.clinical_note || "",
    })) || [];
}

function mapGeneratedDiagnoses(items: PrescriptionResponseType["diagnoses"] | undefined) {
    return items?.map(item => ({
        name: item.diagnosis_name,
        icd_code: item.icd_code || "",
        confidence: item.confidence,
        clinical_reasoning: item.clinical_reasoning,
    })).sort((a, b) => (b.confidence || 0) - (a.confidence || 0)) || [];
}

function mapGeneratedMedicines(items: PrescriptionResponseType["medicines"] | undefined) {
    return items?.map(item => {
        // Prefer the structured fields ARIS emits; fall back to deriving from the flat
        // dosage/routine/duration for older variants or drafts.
        const routine = routineForGenerated(item.routine);
        const hasStructuredDuration = item.duration_value != null || !!item.duration_unit || !!item.duration_preset;
        const hasStructuredFields = !!(item.type || item.route || item.dose || item.schedule);
        return {
            name: item.trade_name || item.generic_name,
            value: item.trade_name || item.generic_name,
            trade_name: item.trade_name,
            generic_name: item.generic_name,
            type: item.type,
            dosage_form: item.dosage_form,
            route: item.route,
            site: item.site,
            dose: item.dose,
            instructions: item.instructions,
            frequencyCode: item.frequency_code,
            // The read card shows `dosage` directly, so compose it from the structured
            // fields when provided — otherwise the stale flat string leaks.
            dosage: hasStructuredFields ? composeDose({ dose: item.dose, route: item.route, site: item.site }) : item.dosage,
            duration: hasStructuredDuration
                ? { value: item.duration_value ?? undefined, unit: item.duration_unit, preset: item.duration_preset }
                : parseDuration(item.duration),
            routine,
            // A schedule is sent only when there is a regular rhythm; an as-needed drug
            // (SOS/Stat duration) intentionally has none, so don't resurrect a stale
            // routine. The legacy routine fallback is only for drafts/old variants.
            schedule: item.schedule
                ? scheduleFromStored({ schedule: item.schedule })
                : hasStructuredFields ? {} : scheduleFromRoutine(routine),
            reasoning: item.purpose,
        };
    }) || [];
}

function mapGeneratedInvestigations(items: PrescriptionResponseType["investigations"] | undefined) {
    return items?.map(item => ({
        name: item.investigation_name,
        notes: item.reason || "",
        priority: item.priority || "routine",
    })) || [];
}


export interface PrescriptionStoreType {
    patientId: string | null;
    sessionId: string | null;
    // patient TODO

    isGenerating: boolean;

    chiefComplaint: ChiefComplaintType[];
    history: HistoryType[];
    diagnosis: DiagnosisType[];
    investigation: InvestigationType[];

    medicine: MeedicineType[];
    unresolvedMedicines: string[];
    advice: string[];
    summary: string;
    safetyNet: string[];
    vitals: VitalsType;
    followUp: FollowUpType;

    // Which memory each section currently holds, if any. Never persisted — it lives for
    // the editing session, which is all undo needs.
    appliedMemories: AppliedMemories;

    // methods
    initiatePrescription: (patientId: string, sessionId: string) => void;
    setGenerating: (value: boolean) => void;
    setPartialData: (data: Pick<PrescriptionResponseType, 'chief_complaints' | 'history' | 'summary' | 'safety_net' | 'diagnoses' | 'vitals' | 'follow_up'>) => void;
    applyScribeData: (data: Pick<PrescriptionResponseType, 'chief_complaints' | 'history' | 'summary' | 'safety_net' | 'vitals' | 'follow_up' | 'advice'>) => void;
    applyDecideData: (data: Pick<PrescriptionResponseType, 'diagnoses' | 'medicines' | 'investigations' | 'unresolved_mentions'>) => void;
    getInitialPrescription: (data: PrescriptionResponseType) => Promise<void>;
    applyMemory: (memoryName: string, body: MemoryBody, sections?: MemorySectionKey[]) => void;
    undoMemorySection: (section: MemorySectionKey) => void;
    getSubmitPayload: (sessionId: string) => Record<string, any>;

    // chief complaint methods
    addChiefComplaint: (data: ChiefComplaintType) => void;
    addEmptyChiefComplaint: () => void;
    updateChiefComplaint: (index: number, data: Partial<ChiefComplaintType>) => void;
    removeChiefComplaint: (index: number) => void;

    // history methods
    addHistory: (data: HistoryType) => void;
    addEmptyHistory: () => void;
    updateHistory: (index: number, data: Partial<HistoryType>) => void;
    removeHistory: (index: number) => void;

    // diagnosis methods
    addDiagnosis: (data: DiagnosisType) => void;
    addEmptyDiagnosis: () => void;
    updateDiagnosis: (index: number, data: Partial<DiagnosisType>) => void;
    removeDiagnosis: (index: number) => void;

    // investigation methods
    addInvestigation: (data: InvestigationType) => void;
    addEmptyInvestigation: () => void;
    updateInvestigation: (index: number, data: Partial<InvestigationType>) => void;
    removeInvestigation: (index: number) => void;

    setSummary: (value: string) => void;

    // vitals methods
    setVitals: (data: Partial<VitalsType>) => void;

    // follow-up methods
    setFollowUp: (data: Partial<FollowUpType>) => void;

    // advice methods
    setAdvice: (data: string[]) => void;

    // medicine methods
    addMedicine: (data: MeedicineType) => void;
    addEmptyMedicine: () => void;
    updateMedicine: (index: number, data: Partial<MeedicineType>) => void;
    removeMedicine: (index: number) => void;
    moveMedicine: (from: number, to: number) => void;

    // unresolved-medicine methods
    resolveUnresolvedMedicine: (index: number) => number;
    dismissUnresolvedMedicine: (index: number) => void;

    resetStore: () => void;
}

export const usePrescriptionStore = create<PrescriptionStoreType>(
    (set, get) => {
        return ({
            patientId: null,
            sessionId: null,

            isGenerating: false,

            chiefComplaint: [],
            history: [],
            diagnosis: [],
            investigation: [],

            summary: "",
            safetyNet: [],
            vitals: {},
            followUp: EMPTY_FOLLOW_UP,

            medicine: [],
            unresolvedMedicines: [],
            advice: [],

            appliedMemories: {},

            initiatePrescription: (patientId, sessionId) => {
                get().resetStore();
                set({ patientId, sessionId });
            },

            resetStore: () => set({
                isGenerating: false,
                chiefComplaint: [],
                history: [],
                diagnosis: [],
                investigation: [],
                summary: "",
                safetyNet: [],
                vitals: {},
                followUp: EMPTY_FOLLOW_UP,
                medicine: [],
                unresolvedMedicines: [],
                advice: [],
                appliedMemories: {},
            }),

            setGenerating: (value) => set({ isGenerating: value }),

            setPartialData: (data) => {
                // Medicine and investigation are blanked until the full draft arrives, so a
                // re-generate never leaves the previous run's list on screen.
                set({
                    summary: data.summary,
                    safetyNet: data.safety_net ?? [],
                    vitals: data.vitals ?? {},
                    ...omitMemoryOwnedSections({
                        chiefComplaint: mapGeneratedChiefComplaints(data.chief_complaints),
                        history: mapGeneratedHistory(data.history),
                        diagnosis: mapGeneratedDiagnoses(data.diagnoses),
                        followUp: { ...EMPTY_FOLLOW_UP, ...data.follow_up },
                        medicine: [],
                        investigation: [],
                    }, get().appliedMemories),
                });
            },

            applyScribeData: (data) => {
                set({
                    summary: data.summary ?? "",
                    safetyNet: data.safety_net ?? [],
                    vitals: data.vitals ?? {},
                    ...omitMemoryOwnedSections({
                        chiefComplaint: mapGeneratedChiefComplaints(data.chief_complaints),
                        history: mapGeneratedHistory(data.history),
                        followUp: { ...EMPTY_FOLLOW_UP, ...data.follow_up },
                        advice: data.advice ?? [],
                    }, get().appliedMemories),
                });
            },

            applyDecideData: (data) => {
                // Decide's medicines arrive already gated (database-verified), so they use the
                // same mapping as the final draft.
                set({
                    unresolvedMedicines: data.unresolved_mentions ?? [],
                    ...omitMemoryOwnedSections({
                        diagnosis: mapGeneratedDiagnoses(data.diagnoses),
                        medicine: mapGeneratedMedicines(data.medicines),
                        investigation: mapGeneratedInvestigations(data.investigations),
                    }, get().appliedMemories),
                });
            },

            getInitialPrescription: async (data: PrescriptionResponseType) => {
                set({
                    summary: data.summary,
                    safetyNet: data.safety_net ?? [],
                    vitals: data.vitals ?? {},
                    unresolvedMedicines: data.unresolved_mentions ?? [],
                    ...omitMemoryOwnedSections({
                        chiefComplaint: mapGeneratedChiefComplaints(data.chief_complaints),
                        history: mapGeneratedHistory(data.history),
                        diagnosis: mapGeneratedDiagnoses(data.diagnoses),
                        investigation: mapGeneratedInvestigations(data.investigations),
                        medicine: mapGeneratedMedicines(data.medicines),
                        advice: data.advice ?? [],
                        followUp: { ...EMPTY_FOLLOW_UP, ...data.follow_up },
                    }, get().appliedMemories),
                })
            },

            // Writes every section the memory carries — or just the ones asked for, when the
            // doctor applies it from a single section's button. Sections the memory leaves
            // blank are untouched, and each section it replaces keeps what it replaced.
            applyMemory: (memoryName, body, sections) => {
                const state = get();
                const patch = filledMemorySectionValues(body, sections);
                const appliedMemories = { ...state.appliedMemories };

                for (const key of Object.keys(patch) as MemorySectionKey[]) {
                    appliedMemories[key] = {
                        memoryName,
                        replaced: state[key],
                        applied: patch[key] as AppliedMemory["applied"],
                    };
                }

                set({ ...(patch as Partial<PrescriptionStoreType>), appliedMemories });
            },

            undoMemorySection: (section) => {
                const { appliedMemories } = get();
                const entry = appliedMemories[section];
                if (!entry) return;

                const remaining = { ...appliedMemories };
                delete remaining[section];
                set({
                    [section]: entry.replaced,
                    appliedMemories: remaining,
                } as Partial<PrescriptionStoreType>);
            },

            getSubmitPayload: (sessionId: string) => {
                const state = get()
                return {
                    session_id: sessionId,
                    chief_complaints: state.chiefComplaint.map(item => ({
                        ccn_id: null,
                        name_text: item.name,
                        duration: item.duration,
                        notes: item.notes
                    })),
                    histories: state.history.map(item => ({
                        hn_id: null,
                        name_text: item.name,
                        duration: item.duration,
                        notes: item.notes
                    })),
                    diagnoses: state.diagnosis.map(item => ({
                        dn_id: null,
                        name_text: item.name
                    })),
                    investigations: state.investigation.map(item => ({
                        investigation_name_id: null,
                        name_text: item.name,
                        reason: item.notes,
                        priority: "routine"
                    })),
                    rx_list: state.medicine.map(serializeMedicine),
                    advice_list: state.advice,
                    on_examinations: hasAnyVital(state.vitals) ? [vitalsForSubmit(state.vitals)] : [],
                    follow_up_days: state.followUp.follow_up_days,
                    follow_up_notes: state.followUp.follow_up_notes || null,
                    summary: state.summary || null,
                    safety_net: state.safetyNet,
                }
            },

            // chief complaint methods
            addChiefComplaint: (data) => set((state) => ({ chiefComplaint: [...state.chiefComplaint, data] })),
            addEmptyChiefComplaint: () => set((state) => ({ chiefComplaint: [...state.chiefComplaint, { name: "", duration: "", notes: "" }] })),
            updateChiefComplaint: (index, data) => set((state) => {
                const updated = [...state.chiefComplaint];
                updated[index] = { ...updated[index], ...data };
                return { chiefComplaint: updated };
            }),
            removeChiefComplaint: (index) => set((state) => {
                const updated = [...state.chiefComplaint];
                updated.splice(index, 1);
                return { chiefComplaint: updated };
            }),

            // history methods
            addHistory: (data) => set((state) => ({ history: [...state.history, data] })),
            addEmptyHistory: () => set((state) => ({ history: [...state.history, { name: "", duration: "", notes: "" }] })),
            updateHistory: (index, data) => set((state) => {
                const updated = [...state.history];
                updated[index] = { ...updated[index], ...data };
                return { history: updated };
            }),
            removeHistory: (index) => set((state) => {
                const updated = [...state.history];
                updated.splice(index, 1);
                return { history: updated };
            }),

            // diagnosis methods
            addDiagnosis: (data) => set((state) => ({ diagnosis: [...state.diagnosis, data] })),
            addEmptyDiagnosis: () => set((state) => ({ diagnosis: [...state.diagnosis, { name: "" }] })),
            updateDiagnosis: (index, data) => set((state) => {
                const updated = [...state.diagnosis];
                updated[index] = { ...updated[index], ...data };
                return { diagnosis: updated };
            }),
            removeDiagnosis: (index) => set((state) => {
                const updated = [...state.diagnosis];
                updated.splice(index, 1);
                return { diagnosis: updated };
            }),

            // investigation methods
            addInvestigation: (data) => set((state) => ({ investigation: [...state.investigation, data] })),
            addEmptyInvestigation: () => set((state) => ({ investigation: [...state.investigation, { name: "", notes: "" }] })),
            updateInvestigation: (index, data) => set((state) => {
                const updated = [...state.investigation];
                updated[index] = { ...updated[index], ...data };
                return { investigation: updated };
            }),
            removeInvestigation: (index) => set((state) => {
                const updated = [...state.investigation];
                updated.splice(index, 1);
                return { investigation: updated };
            }),

            setSummary: (value) => set({ summary: value }),

            // vitals methods
            setVitals: (data) => set((state) => ({ vitals: { ...state.vitals, ...data } })),

            // follow-up methods
            setFollowUp: (data) => set((state) => ({ followUp: { ...state.followUp, ...data } })),

            // advice methods
            setAdvice: (data) => set({ advice: data }),

            // medicine methods
            addMedicine: (data) => set((state) => ({ medicine: [...state.medicine, data] })),
            addEmptyMedicine: () => set((state) => ({ medicine: [...state.medicine, { name: "", value: "", dosage: "", routine: {}, schedule: {}, dose: {}, duration: {} }] })),
            updateMedicine: (index, data) => set((state) => {
                const updated = [...state.medicine];
                updated[index] = { ...updated[index], ...data };

                return { medicine: updated };
            }),
            removeMedicine: (index) => set((state) => {
                const updated = [...state.medicine];
                updated.splice(index, 1);
                return { medicine: updated };
            }),
            moveMedicine: (from, to) => set((state) => {
                if (to < 0 || to >= state.medicine.length) return {};
                const updated = [...state.medicine];
                const [moved] = updated.splice(from, 1);
                updated.splice(to, 0, moved);
                return { medicine: updated };
            }),

            // Promote an unresolved mention into a fresh, empty medicine row and open it. The
            // search starts blank — the heard text is the garble the search already failed on,
            // so the doctor types the real name; returns the new row's index for the editor.
            resolveUnresolvedMedicine: (index) => {
                set((state) => ({
                    unresolvedMedicines: state.unresolvedMedicines.filter((_, i) => i !== index),
                    medicine: [...state.medicine, { name: "", value: "", dosage: "", routine: {}, schedule: {}, dose: {}, duration: {} }],
                }));
                return get().medicine.length - 1;
            },
            dismissUnresolvedMedicine: (index) => set((state) => ({
                unresolvedMedicines: state.unresolvedMedicines.filter((_, i) => i !== index),
            })),

        })
    }
)

// The undo a section should offer. It appears only where the memory actually replaced
// something, and only until the doctor edits past it — every edit builds a new value, so
// comparing against what the apply wrote is enough to tell that they have moved on.
export function selectMemoryUndo(
    state: PrescriptionStoreType,
    section: MemorySectionKey,
): AppliedMemory | null {
    const entry = state.appliedMemories[section];
    if (!entry || entry.applied !== state[section]) return null;
    return isMemorySectionFilled(section, entry.replaced as MemorySectionValues[MemorySectionKey]) ? entry : null;
}