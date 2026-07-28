import { usePrescriptionStore } from "@/stores/prescription-store";
import DoctorInfo from "./doctor-info";
import PrescriptionActions from "./prescription-actions";
import ListInfo from "./list-info";
import PatientInfo from "./patient-info";
import { MedicineContainer } from "./medicine-container";
import api from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useState } from "react";
import AdviceList from "./advice-list";
import { PrescriptionView } from "./view";
import { ClinicalNoteView } from "./note-view";
import PrescriptionPaper from "./paper/prescription-paper";
import ClinicalNotesPanel from "./paper/clinical-notes-panel";
import DocumentSwitcher, { type PrescriptionDocument } from "./document-switcher";
import VitalsBar from "./paper/vitals-bar";
import FollowUpBlock from "./paper/follow-up-block";
import { Button } from "@/components/ui/button";
import { useTargetedPrint } from "@/hooks/use-targeted-print";
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
    const { consultationId } = useParams({ from: "/doctor/prescribe/$consultationId" });

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

    // Navigate to the dashboard only after printing finishes — doing it immediately would
    // swap out the DOM before the browser captures the prescription. Printing the note is
    // a side action that keeps the doctor in the session.
    const { printTarget, requestPrint } = useTargetedPrint({
        documentTitles: {
            prescription: `Prescription_Report_${consultationId}`,
            note:         `Clinical_Note_${consultationId}`,
        },
        onAfterPrint: (target) => {
            if (target === "prescription") navigate({ to: "/doctor" });
        },
    });

    const confirmMutation = useMutation({
        mutationFn: async () => {
            const payload = store.getSubmitPayload(consultationId);
            await api.post("/prescription", payload);
        },
        onSuccess: () => {
            requestPrint("prescription");
        },
    });

    const prescriptionPaper = (
        <PrescriptionPaper
            header={<DoctorInfo sessionId={consultationId} />}
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
                <Button
                    onClick={() => confirmMutation.mutate()}
                    isLoading={confirmMutation.isPending}
                    className="px-8 font-bold shadow-md"
                >
                    Save &amp; Print
                </Button>
            }
        />
    );

    return (
        <>
            <div className={cn("rx-print-mount", printTarget !== "prescription" && "print:hidden")} aria-hidden>
                <PrescriptionView />
            </div>
            <div className={cn("rx-print-mount", printTarget !== "note" && "print:hidden")} aria-hidden>
                <ClinicalNoteView />
            </div>

            <div className="print:hidden">
                <DocumentSwitcher
                    value={activeDocument}
                    onValueChange={setActiveDocument}
                    notesHasContent={!!summary?.trim() || safetyNet.length > 0}
                    actions={
                        <PrescriptionActions
                            onGenerate={onGenerate}
                            onCancel={onCancel}
                            hasBeenGenerated={hasBeenGenerated}
                        />
                    }
                    prescription={prescriptionPaper}
                    notes={
                        <ClinicalNotesPanel
                            notes={summary}
                            safetyNet={safetyNet}
                            onChange={setSummary}
                            patientSlot={<PatientInfo sessionId={consultationId} />}
                            onPrint={() => requestPrint("note")}
                        />
                    }
                />
            </div>
        </>
    );
}
