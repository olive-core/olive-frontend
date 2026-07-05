import type { ChiefComplaintType, DiagnosisType, InvestigationType, MeedicineType, HistoryType, PrescriptionResponseType, VitalsType, FollowUpType } from "@/types/prescription";
import { hasAnyVital, vitalsForSubmit } from "@/lib/vitals";
import { composeDose, parseDuration } from "@/lib/rx-compose";
import { scheduleFromRoutine, scheduleFromStored } from "@/lib/rx-format";
import { serializeMedicine } from "@/lib/rx-medicine";
import {
    applyRxMemoryToStore,
    clearedRxMemorySections,
    omitRxMemorySections,
    pickRxMemorySections,
} from "@/lib/rx-memory";
import { create } from "zustand";

const EMPTY_FOLLOW_UP: FollowUpType = { follow_up_days: null, follow_up_notes: null };

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


interface PrescriptionStoreType {
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

    templateSelected: boolean;
    generatedSections: Record<string, unknown[]>;
    isRevertingTemplate: boolean;

    // methods
    initiatePrescription: (patientId: string, sessionId: string) => void;
    setGenerating: (value: boolean) => void;
    setPartialData: (data: Pick<PrescriptionResponseType, 'chief_complaints' | 'history' | 'summary' | 'safety_net' | 'diagnoses' | 'vitals' | 'follow_up'>) => void;
    applyScribeData: (data: Pick<PrescriptionResponseType, 'chief_complaints' | 'history' | 'summary' | 'safety_net' | 'vitals' | 'follow_up' | 'advice'>) => void;
    applyDecideData: (data: Pick<PrescriptionResponseType, 'diagnoses' | 'medicines' | 'investigations' | 'unresolved_mentions'>) => void;
    getInitialPrescription: (data: PrescriptionResponseType) => Promise<void>;
    setPrescriptionFromTemplate: (data: any) => void;
    revertTemplateSelection: () => void;
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

            templateSelected: false,
            generatedSections: {},
            isRevertingTemplate: false,

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
                templateSelected: false,
                generatedSections: {},
                isRevertingTemplate: false,
            }),

            setGenerating: (value) => set({ isGenerating: value }),

            setPartialData: (data) => {
                // Covered sections are cleared until the full draft arrives — unless an RxMemory is
                // applied, in which case its values must survive the partial update.
                set({
                    chiefComplaint: mapGeneratedChiefComplaints(data.chief_complaints),
                    history: mapGeneratedHistory(data.history),
                    diagnosis: mapGeneratedDiagnoses(data.diagnoses),
                    summary: data.summary,
                    safetyNet: data.safety_net ?? [],
                    vitals: data.vitals ?? {},
                    followUp: { ...EMPTY_FOLLOW_UP, ...data.follow_up },
                    ...(get().templateSelected ? {} : clearedRxMemorySections()),
                });
            },

            applyScribeData: (data) => {
                set({
                    chiefComplaint: mapGeneratedChiefComplaints(data.chief_complaints),
                    history: mapGeneratedHistory(data.history),
                    summary: data.summary ?? "",
                    safetyNet: data.safety_net ?? [],
                    vitals: data.vitals ?? {},
                    followUp: { ...EMPTY_FOLLOW_UP, ...data.follow_up },
                    advice: data.advice ?? [],
                });
            },

            applyDecideData: (data) => {
                // Decide's medicines arrive already gated (database-verified), so they use the
                // same mapping as the final draft. RxMemory-covered sections stay guarded.
                const medicine = mapGeneratedMedicines(data.medicines);
                const investigation = mapGeneratedInvestigations(data.investigations);
                const generatedSections = {
                    ...get().generatedSections,
                    ...pickRxMemorySections({ medicine, investigation }),
                };
                set({
                    diagnosis: mapGeneratedDiagnoses(data.diagnoses),
                    generatedSections,
                    unresolvedMedicines: data.unresolved_mentions ?? [],
                    ...(get().templateSelected ? {} : { medicine, investigation }),
                });
            },

            getInitialPrescription: async (data: PrescriptionResponseType) => {
                const chiefComplaint = mapGeneratedChiefComplaints(data.chief_complaints);
                const history = mapGeneratedHistory(data.history);
                const diagnosis = mapGeneratedDiagnoses(data.diagnoses);
                const generatedMedicine = mapGeneratedMedicines(data.medicines);
                const generatedInvestigation = mapGeneratedInvestigations(data.investigations);

                const advice = data.advice;
                const summary = data.summary;
                const safetyNet = data.safety_net ?? [];
                const vitals = data.vitals ?? {};
                const followUp = { ...EMPTY_FOLLOW_UP, ...data.follow_up };

                const generatedByKey = { medicine: generatedMedicine, investigation: generatedInvestigation, chiefComplaint, history, diagnosis, advice };
                const generatedSections = pickRxMemorySections(generatedByKey);

                set({
                    // Sections the draft owns outright are always written; covered sections are snapshotted
                    // and applied only when no RxMemory is already in place (so it isn't clobbered).
                    ...(omitRxMemorySections({ chiefComplaint, history, diagnosis, advice }) as Partial<PrescriptionStoreType>),
                    summary,
                    safetyNet,
                    vitals,
                    followUp,
                    generatedSections,
                    unresolvedMedicines: data.unresolved_mentions ?? [],
                    ...(get().templateSelected ? {} : (generatedSections as Partial<PrescriptionStoreType>)),
                })
            },

            setPrescriptionFromTemplate: (data: any) => {
                const patch = applyRxMemoryToStore(data, get() as unknown as Record<string, unknown[]>);
                set({ ...(patch as Partial<PrescriptionStoreType>), templateSelected: true });
            },

            revertTemplateSelection: () => {
                const { generatedSections } = get();
                set({ isRevertingTemplate: true, templateSelected: false });
                setTimeout(() => {
                    set({
                        ...(generatedSections as Partial<PrescriptionStoreType>),
                        isRevertingTemplate: false,
                    });
                }, 300);
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