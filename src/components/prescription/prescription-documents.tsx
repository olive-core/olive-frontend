import type { ReactNode } from "react";
import { usePrescriptionStore } from "@/stores/prescription-store";
import type { NoteImageType } from "@/types/prescription";
import ListInfo from "./list-info";
import { MedicineContainer } from "./medicine-container";
import AdviceList from "./advice-list";
import PrescriptionPaper from "./paper/prescription-paper";
import ClinicalNotesPanel from "./paper/clinical-notes-panel";
import VitalsBar from "./paper/vitals-bar";
import FollowUpBlock from "./paper/follow-up-block";

// Shared document composition for real consultations and the anonymous practice session.
export function usePrescriptionDocuments({ header, patientStrip, sessionId, saveAndPrintButton,
    onPrintNotes, onAddImages, onRemoveImage, uploadingImages = 0, prescriptionEnabled = true,
}: { header: ReactNode; patientStrip: ReactNode; sessionId?: string; saveAndPrintButton: ReactNode;
    onPrintNotes: () => void; onAddImages?: (files: File[]) => void;
    onRemoveImage?: (image: NoteImageType) => void; uploadingImages?: number; prescriptionEnabled?: boolean;
}) {
    const store = usePrescriptionStore();
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

        noteImages,

        vitals,
        vitalSources,
        setVitals,

        followUp,
        setFollowUp,
    } = store;

    const prescriptionPaper = (
        <PrescriptionPaper
            header={header}
            patientStrip={patientStrip}
            vitalsBar={
                <VitalsBar
                    vitals={vitals}
                    sources={vitalSources}
                    currentSessionId={sessionId}
                    onChange={setVitals}
                />
            }
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
                    <div className="mt-auto flex flex-col gap-3">
                        <AdviceList value={advice} onChange={setAdvice} />
                        <FollowUpBlock value={followUp} onChange={setFollowUp} />
                    </div>
                </>
            }
            footer={saveAndPrintButton}
        />
    );

    const clinicalNotes = (
        <ClinicalNotesPanel
            notes={summary}
            safetyNet={safetyNet}
            onChange={setSummary}
            patientSlot={patientStrip}
            onPrint={onPrintNotes}
            images={noteImages}
            onAddImages={onAddImages}
            onRemoveImage={onRemoveImage}
            uploadingImages={uploadingImages}
            // A note-only consultation saves with its own button below the notes instead.
            footer={prescriptionEnabled ? saveAndPrintButton : undefined}
        />
    );

    return { prescriptionPaper, clinicalNotes };
}
