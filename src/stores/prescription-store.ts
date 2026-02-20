import type { ChiefComplaintType, DiagnosisType, InvestigationType, MeedicineType, HistoryType } from "@/types/prescription";
import { create } from "zustand";


interface PrescriptionStoreType {
    patientId: string | null;
    sessionId: string | null;
    // patient TODO

    chiefComplaint: ChiefComplaintType[];
    history: HistoryType[];
    diagnosis: DiagnosisType[];
    investigation: InvestigationType[];

    medicine: MeedicineType[]
    // advice

    // methods
    initiatePrescription: (patientId: string, sessionId: string) => void;
    getInitialPrescription: (prescriptionId: string) => Promise<void>;

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

    // medicine methods
    addMedicine: (data: MeedicineType) => void;
    addEmptyMedicine: () => void;
    updateMedicine: (index: number, data: Partial<MeedicineType>) => void;
    removeMedicine: (index: number) => void;
}

export const usePrescriptionStore = create<PrescriptionStoreType>(
    (set) => {
        return ({
            patientId: null,
            sessionId: null,

            chiefComplaint: [],
            history: [],
            diagnosis: [],
            investigation: [],

            medicine: [],

            initiatePrescription: (patientId, sessionId) => {
                set({ patientId, sessionId });
            },

            getInitialPrescription: async (prescriptionId) => {
                // const response = await api.get('get-prescription');
                console.log(prescriptionId)
                // DUMMY
                set({
                    chiefComplaint: [
                        {
                            name: "Headache",
                            duration: "2 days",
                            notes: "Severe pain in the morning",
                        },
                        {
                            name: "Fever",
                            duration: "3 days",
                            notes: "Mild fever"
                        }
                    ],
                    history: [
                        {
                            name: "Diabetes",
                            duration: "5 years",
                            notes: "On medication"
                        },
                        {
                            name: "Hypertension",
                            duration: "3 years",
                        },
                    ],
                    diagnosis: [
                        { name: "Migraine" },
                        { name: "Viral Fever" }
                    ],
                    medicine: [
                        {
                            name: "Paracetamol",
                            value: "paracetamol",
                            dosage: "40_mg",
                            notes: "ব্যথা হলে খাবেন",
                            routine: {
                                afterBreakfast: true,
                                afterDinner: true,
                            }
                        },
                        {
                            name: "Ibuprofen",
                            value: "ibuprofen",
                            notes: "ব্যথা হলে খাবেন",
                            routine: {
                                gapHours: 6,
                            }
                        }
                    ]
                })
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