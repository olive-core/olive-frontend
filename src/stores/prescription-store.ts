import type { ChiefComplaintType, DiagnosisType, InvestigationType, MeedicineType, HistoryType, PrescriptionResponseType, VitalsType, FollowUpType } from "@/types/prescription";
import { hasAnyVital, vitalsForSubmit } from "@/lib/vitals";
import { create } from "zustand";

const EMPTY_FOLLOW_UP: FollowUpType = { follow_up_days: null, follow_up_notes: null };


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
    advice: string[];
    summary: string;
    safetyNet: string[];
    vitals: VitalsType;
    followUp: FollowUpType;

    templateSelected: boolean;
    generatedMedicine: MeedicineType[];
    generatedInvestigation: InvestigationType[];
    isRevertingTemplate: boolean;

    // methods
    initiatePrescription: (patientId: string, sessionId: string) => void;
    setGenerating: (value: boolean) => void;
    setPartialData: (data: Pick<PrescriptionResponseType, 'chief_complaints' | 'history' | 'summary' | 'safety_net' | 'diagnoses' | 'vitals' | 'follow_up'>) => void;
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
            advice: [],

            templateSelected: false,
            generatedMedicine: [],
            generatedInvestigation: [],
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
                advice: [],
                templateSelected: false,
                generatedMedicine: [],
                generatedInvestigation: [],
                isRevertingTemplate: false,
            }),

            setGenerating: (value) => set({ isGenerating: value }),

            setPartialData: (data) => {
                const chiefComplaint = data.chief_complaints?.map(item => ({
                    name: item.complaint_name,
                    duration: "",
                    notes: item.clinical_note || "",
                })) || []

                const history = data.history?.map(item => ({
                    name: item.history_name,
                    duration: "",
                    notes: item.clinical_note || "",
                })) || []

                const diagnosis = data.diagnoses?.map(item => ({
                    name: item.diagnosis_name,
                    icd_code: item.icd_code || "",
                    confidence: item.confidence,
                    clinical_reasoning: item.clinical_reasoning,
                })).sort((a, b) => (b.confidence || 0) - (a.confidence || 0)) || []

                const summary = data.summary;
                const safetyNet = data.safety_net ?? [];
                const vitals = data.vitals ?? {};
                const followUp = { ...EMPTY_FOLLOW_UP, ...data.follow_up };

                if (get().templateSelected) {
                    set({ chiefComplaint, history, diagnosis, summary, safetyNet, vitals, followUp });
                } else {
                    set({ chiefComplaint, history, diagnosis, medicine: [], investigation: [], summary, safetyNet, vitals, followUp });
                }
            },

            getInitialPrescription: async (data: PrescriptionResponseType) => {
                const chiefComplaint = data.chief_complaints?.map(item => ({
                    name: item.complaint_name,
                    duration: "",
                    notes: item.clinical_note || "",
                })) || []

                const history = data.history?.map(item => ({
                    name: item.history_name,
                    duration: "",
                    notes: item.clinical_note || "",
                })) || []

                const diagnosis = data.diagnoses?.map(item => ({
                    name: item.diagnosis_name,
                    icd_code: item.icd_code,
                    confidence: item.confidence,
                    clinical_reasoning: item.clinical_reasoning
                })).sort((a, b) => (b.confidence || 0) - (a.confidence || 0)) || []

                const generatedMedicine = data.medicines?.map(item => ({
                    name: item.trade_name || item.generic_name,
                    value: item.trade_name || item.generic_name,
                    trade_name: item.trade_name,
                    generic_name: item.generic_name,
                    dosage: item.dosage,
                    notes: item.duration,
                    routine: {
                        beforeBreakfast: item.routine?.meal_times?.includes('before_breakfast'),
                        afterBreakfast: item.routine?.meal_times?.includes('after_breakfast'),
                        beforeLunch: item.routine?.meal_times?.includes('before_lunch'),
                        afterLunch: item.routine?.meal_times?.includes('after_lunch'),
                        beforeDinner: item.routine?.meal_times?.includes('before_dinner'),
                        afterDinner: item.routine?.meal_times?.includes('after_dinner'),
                        gapHours: item.routine?.gap_hours || 0,
                    },
                    reasoning: item.purpose
                })) || []

                const generatedInvestigation = data.investigations?.map(item => ({
                    name: item.investigation_name,
                    notes: item.reason || "",
                    priority: item.priority || "routine"
                })) || []

                const advice = data.advice;
                const summary = data.summary;
                const safetyNet = data.safety_net ?? [];
                const vitals = data.vitals ?? {};
                const followUp = { ...EMPTY_FOLLOW_UP, ...data.follow_up };

                const medicineAndInvestigationUpdate = get().templateSelected
                    ? {}
                    : { medicine: generatedMedicine, investigation: generatedInvestigation };

                set({
                    chiefComplaint,
                    history,
                    diagnosis,
                    advice,
                    summary,
                    safetyNet,
                    vitals,
                    followUp,
                    generatedMedicine,
                    generatedInvestigation,
                    ...medicineAndInvestigationUpdate,
                })
            },

            setPrescriptionFromTemplate: (data: any) => {
                const medicine = data.rx_list?.map((item: any) => ({
                    name: item.trade_name || item.generic_name,
                    value: item.trade_name || item.generic_name,
                    trade_name: item.trade_name,
                    generic_name: item.generic_name,
                    dosage: item.dosage,
                    notes: item.duration,
                    routine: {
                        beforeBreakfast: item.routine?.before_breakfast || false,
                        afterBreakfast: item.routine?.after_breakfast || false,
                        beforeLunch: item.routine?.before_lunch || false,
                        afterLunch: item.routine?.after_lunch || false,
                        beforeDinner: item.routine?.before_dinner || false,
                        afterDinner: item.routine?.after_dinner || false,
                        gapHours: item.routine?.gap_hour || 0,
                    }
                })) || []

                const investigation = data.investigations?.map((item: any) => ({
                    name: item.name_text,
                    notes: item.reason || "",
                    priority: item.priority || "routine"
                })) || []

                set({ medicine, investigation, templateSelected: true })
            },

            revertTemplateSelection: () => {
                const { generatedMedicine, generatedInvestigation } = get();
                set({ isRevertingTemplate: true, templateSelected: false });
                setTimeout(() => {
                    set({
                        medicine: generatedMedicine,
                        investigation: generatedInvestigation,
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
                    rx_list: state.medicine.map(item => ({
                        medicine_id: null,
                        trade_name: item.trade_name || item.value,
                        generic_name: item.generic_name || item.value,
                        dosage: item.dosage,
                        duration: item.notes,
                        routine: {
                            before_breakfast: item.routine?.beforeBreakfast || false,
                            after_breakfast: item.routine?.afterBreakfast || false,
                            before_lunch: item.routine?.beforeLunch || false,
                            after_lunch: item.routine?.afterLunch || false,
                            before_dinner: item.routine?.beforeDinner || false,
                            after_dinner: item.routine?.afterDinner || false,
                            gap_hour: item.routine?.gapHours || 0
                        }
                    })),
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
            addEmptyMedicine: () => set((state) => ({ medicine: [...state.medicine, { name: "", value: "", dosage: "", notes: "", routine: {} }] })),
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


        })
    }
)