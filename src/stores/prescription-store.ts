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
                            dosage: "40mg",
                            notes: "ব্যথা হলে খাবেন",
                            routine: {
                                afterBreakfast: true,
                                afterDinner: true,
                            }
                        },
                        {
                            name: "Fexo",
                            dosage: "20mg",
                            notes: "ব্যথা হলে খাবেন",
                            routine: {
                                gapHours: 6,
                            }
                        }
                    ]
                })
            }

        })
    }
)