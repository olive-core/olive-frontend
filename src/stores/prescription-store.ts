import api from "@/lib/axios";
import type { ChiefComplaintType, DiagnosisType, InvestigationType, MeedicineType, HistoryType } from "@/types/prescription";
import { create } from "zustand";


interface PrescriptionStoreType {
    patientId: string;
    sessionId: string;
    // patient TODO

    chiefComplaint: ChiefComplaintType[];
    history: HistoryType[];
    diagnosis: DiagnosisType[];
    investigation: InvestigationType[];

    medicine: MeedicineType[]
    // advice

    // methods
    initiatePrescription: (patientId: string, sessionId: string) => void;
    getInitialPrescription: () => Promise<void>;
}

export const usePrescriptionStore = create<PrescriptionStoreType>(
    (set, get) => {
        return ({
            patientId: null,
            sessionId: null,

            chiefComplaints: [],
            history: [],
            diagnosis: [],
            investigation: [],

            medicine: [],

            initiatePrescription: (patientId, sessionId) => {
                set({ patientId, sessionId });
            },

            getInitialPrescription: async () => {
                // const response = await api.get('get-prescription');

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

                        }
                    ]
                })
            }

        })
    }
)