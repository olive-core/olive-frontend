import { usePrescriptionStore } from "@/stores/prescription-store";
import DoctorInfo from "./doctor-info";
import ListInfo from "./list-info";
import PatientInfo from "./patient-info";
import { MedicineContainer } from "./medicine-container";
import api from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useReactToPrint } from "react-to-print";
import { useRef } from "react";
import AdviceList from "./advice-list";
import { PrescriptionView } from "./view";
import PrescriptionPaper from "./paper/prescription-paper";
import SummaryBlock from "./paper/summary-block";

interface PrescriptionProps {
    onGenerate:       () => void;
    onCancel:         () => void;
    hasBeenGenerated: boolean;
}

export default function Prescription({ onGenerate, onCancel, hasBeenGenerated }: PrescriptionProps) {
    const store = usePrescriptionStore();
    const navigate = useNavigate();
    const { consultationId } = useParams({ from: "/dashboard/prescribe/$consultationId" });

    const prescriptionRef = useRef(null);

    const {
        chiefComplaint,
        addEmptyChiefComplaint,
        updateChiefComplaint,
        removeChiefComplaint,

        history,
        addEmptyHistory,
        updateHistory,
        removeHistory,

        diagnosis,
        addEmptyDiagnosis,
        updateDiagnosis,
        removeDiagnosis,

        investigation,
        addEmptyInvestigation,
        updateInvestigation,
        removeInvestigation,

        advice,
        setAdvice,

        summary,
    } = store;

    const handlePrint = useReactToPrint({
        contentRef:    prescriptionRef,
        documentTitle: `Prescription_Report_${consultationId}`,
    });

    const confirmMutation = useMutation({
        mutationFn: async () => {
            const payload = store.getSubmitPayload(consultationId);
            await api.post("/prescription", payload);
        },
        onSuccess: () => {
            handlePrint();
            navigate({ to: "/dashboard" });
        },
    });

    return (
        <>
            <div className="fixed top-0 left-[-9999px] print:left-0 print:block pb-8" ref={prescriptionRef}>
                <PrescriptionView />
            </div>

            <PrescriptionPaper
                header={
                    <DoctorInfo
                        onGenerate={onGenerate}
                        onCancel={onCancel}
                        hasBeenGenerated={hasBeenGenerated}
                    />
                }
                patientStrip={<PatientInfo sessionId={consultationId} />}
                leftColumn={
                    <>
                        <SummaryBlock summary={summary} />

                        <ListInfo
                            title="Chief Complaints"
                            info={chiefComplaint}
                            fieldName="chief-complaint"
                            addEmptyItem={addEmptyChiefComplaint}
                            updateItem={updateChiefComplaint}
                            removeItem={removeChiefComplaint}
                        />

                        <ListInfo
                            title="History"
                            info={history}
                            fieldName="history"
                            addEmptyItem={addEmptyHistory}
                            updateItem={updateHistory}
                            removeItem={removeHistory}
                        />

                        <ListInfo
                            title="Diagnosis"
                            info={diagnosis}
                            fieldName="diagnosis"
                            addEmptyItem={addEmptyDiagnosis}
                            updateItem={updateDiagnosis}
                            removeItem={removeDiagnosis}
                        />

                        <ListInfo
                            title="Investigation"
                            info={investigation}
                            fieldName="investigation"
                            addEmptyItem={addEmptyInvestigation}
                            updateItem={updateInvestigation}
                            removeItem={removeInvestigation}
                        />
                    </>
                }
                rightColumn={
                    <>
                        <MedicineContainer />
                        <div className="mt-auto">
                            <AdviceList value={advice} onChange={setAdvice} />
                        </div>
                    </>
                }
                footer={
                    <button
                        onClick={() => confirmMutation.mutate()}
                        disabled={confirmMutation.isPending}
                        className="h-9 px-8 font-bold bg-slate-900 text-white hover:bg-slate-800 rounded-lg shadow-md transition-colors disabled:opacity-50"
                    >
                        {confirmMutation.isPending ? "Saving..." : "Confirm"}
                    </button>
                }
            />
        </>
    );
}
