import { usePrescriptionStore } from "@/stores/prescription-store";
import DoctorInfo from "./doctor-info";
import ListInfo from "./list-info";
import PatientInfo from "./patient-info";
import { MedicineContainer } from "./medicine-container";
import api from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useReactToPrint } from 'react-to-print';
import { useRef } from "react";

export default function Prescription() {

    const store = usePrescriptionStore();
    const navigate = useNavigate();
    const { consultationId } = useParams({ from: '/dashboard/prescribe/$consultationId' });

    const prescriptionRef = useRef(null);

    const {
        // chiefComplaint
        chiefComplaint,
        addEmptyChiefComplaint,
        updateChiefComplaint,
        removeChiefComplaint,

        // history
        history,
        addEmptyHistory,
        updateHistory,
        removeHistory,

        // diagnosis
        diagnosis,
        addEmptyDiagnosis,
        updateDiagnosis,
        removeDiagnosis,

        // investigation
        investigation,
        addEmptyInvestigation,
        updateInvestigation,
        removeInvestigation,

    } = store;

    const confirmMutation = useMutation({
        mutationFn: async () => {
            const payload = store.getSubmitPayload(consultationId);
            await api.post('/prescription/complete', payload);
        },
        onSuccess: () => {
            // TODO: remove editing details
            // print the prescription
            handlePrint();
            navigate({ to: '/dashboard' });
        }
    });

    const handlePrint = useReactToPrint({
        contentRef: prescriptionRef,
        documentTitle: "Prescription_Report",
        // Optional: logic to run after print
        onAfterPrint: () => console.log("Print completed"),
    });

    return (
        <div className="container rounded-xl border flex flex-col mt-4 mb-12">
            <div className="m-4" ref={prescriptionRef}>
                <DoctorInfo />
                <PatientInfo />

                <div className="grid grid-cols-1 md:grid-cols-3">
                    {/* left */}
                    <div className="h-full md:border-r md:col-span-1 border-b md:border-b-0 py-4 flex flex-col gap-2">
                        <ListInfo
                            title="Chief Complaints"
                            info={chiefComplaint}
                            fieldName="chief-complaint"
                            addEmptyItem={addEmptyChiefComplaint}
                            updateItem={updateChiefComplaint}
                            removeItem={removeChiefComplaint}
                            suggestionList={[]}
                        />
                        <ListInfo
                            title="History"
                            info={history}
                            fieldName="history"
                            addEmptyItem={addEmptyHistory}
                            updateItem={updateHistory}
                            removeItem={removeHistory}
                            suggestionList={[]}
                        />

                        <ListInfo
                            title="Diagnosis"
                            info={diagnosis}
                            fieldName="diagnosis"
                            addEmptyItem={addEmptyDiagnosis}
                            updateItem={updateDiagnosis}
                            removeItem={removeDiagnosis}
                            suggestionList={[]}
                        />

                        <ListInfo
                            title="Investigation"
                            info={investigation}
                            fieldName="investigation"
                            addEmptyItem={addEmptyInvestigation}
                            updateItem={updateInvestigation}
                            removeItem={removeInvestigation}
                            suggestionList={[]} // NOT AVAILABLE IN CURRENT API
                        />
                    </div>

                    {/* right */}
                    <MedicineContainer />
                </div>
            </div>

            {/* Master Confirm Button */}
            <div className="p-4 border-t flex justify-end bg-slate-50 rounded-b-xl">
                <button
                    onClick={() => confirmMutation.mutate()}
                    disabled={confirmMutation.isPending}
                    className="h-9 px-8 font-bold bg-slate-900 text-white hover:bg-slate-800 rounded-lg shadow-md transition-colors disabled:opacity-50"
                >
                    {confirmMutation.isPending ? 'Saving...' : 'Confirm'}
                </button>
            </div>
        </div>
    );
}