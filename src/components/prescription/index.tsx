import { usePrescriptionStore } from "@/stores/prescription-store";
import DoctorInfo from "./doctor-info";
import ListInfo from "./list-info";
import PatientInfo from "./patient-info";
import { MedicineContainer } from "./medicine-container";
import api from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useReactToPrint } from "react-to-print";
import { useRef, useState } from "react";
import AdviceList from "./advice-list";
import { PrescriptionView } from "./view";
import PrescriptionPaper from "./paper/prescription-paper";
import ClinicalNotesPanel from "./paper/clinical-notes-panel";
import DocumentSwitcher, { type PrescriptionDocument } from "./document-switcher";
import VitalsBar from "./paper/vitals-bar";
import FollowUpBlock from "./paper/follow-up-block";
import { cn } from "@/lib/utils";

interface PrescriptionProps {
    onGenerate:       () => void;
    onCancel:         () => void;
    hasBeenGenerated: boolean;
}

export default function Prescription({ onGenerate, onCancel, hasBeenGenerated }: PrescriptionProps) {
    const store = usePrescriptionStore();
    const isRevertingTemplate = usePrescriptionStore(s => s.isRevertingTemplate);
    const navigate = useNavigate();
    const { consultationId } = useParams({ from: "/dashboard/prescribe/$consultationId" });

    const prescriptionRef = useRef(null);
    const [activeDocument, setActiveDocument] = useState<PrescriptionDocument>("prescription");

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
        setSummary,
        safetyNet,

        vitals,
        setVitals,

        followUp,
        setFollowUp,
    } = store;

    const handlePrint = useReactToPrint({
        contentRef:    prescriptionRef,
        documentTitle: `Prescription_Report_${consultationId}`,
        // Navigate only after the print dialog closes — on mobile, navigating immediately
        // swaps the DOM (to the dashboard's phone-number screen) before print captures.
        onAfterPrint:  () => navigate({ to: "/dashboard" }),
    });

    const confirmMutation = useMutation({
        mutationFn: async () => {
            const payload = store.getSubmitPayload(consultationId);
            await api.post("/prescription", payload);
        },
        onSuccess: () => {
            handlePrint();
        },
    });

    const prescriptionPaper = (
        <PrescriptionPaper
            header={
                <DoctorInfo
                    onGenerate={onGenerate}
                    onCancel={onCancel}
                    hasBeenGenerated={hasBeenGenerated}
                />
            }
            patientStrip={<PatientInfo sessionId={consultationId} />}
            vitalsBar={<VitalsBar vitals={vitals} onChange={setVitals} />}
            leftColumn={
                <>
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

                    <div className={cn("transition-opacity duration-300", isRevertingTemplate ? "opacity-0" : "opacity-100")}>
                        <ListInfo
                            title="Investigation"
                            info={investigation}
                            fieldName="investigation"
                            addEmptyItem={addEmptyInvestigation}
                            updateItem={updateInvestigation}
                            removeItem={removeInvestigation}
                        />
                    </div>
                </>
            }
            rightColumn={
                <>
                    <MedicineContainer />
                    <div className="mt-auto flex flex-col gap-3">
                        <AdviceList value={advice} onChange={setAdvice} />
                        <FollowUpBlock value={followUp} onChange={setFollowUp} />
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
    );

    return (
        <>
            <div className="fixed top-0 left-[-9999px] print:left-0 print:block pb-8" ref={prescriptionRef}>
                <PrescriptionView />
            </div>

            <DocumentSwitcher
                value={activeDocument}
                onValueChange={setActiveDocument}
                notesHasContent={!!summary?.trim() || safetyNet.length > 0}
                prescription={prescriptionPaper}
                notes={<ClinicalNotesPanel notes={summary} safetyNet={safetyNet} onChange={setSummary} />}
            />
        </>
    );
}
