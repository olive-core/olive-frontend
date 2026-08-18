import { usePrescriptionStore } from "@/stores/prescription-store";
import DoctorInfo from "./doctor-info";
import PrescriptionActions from "./prescription-actions";
import ListInfo from "./list-info";
import PatientInfo from "./patient-info";
import { MedicineContainer } from "./medicine-container";
import api from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
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
import { useClinicianProfile } from "@/hooks/use-clinician-profile";
import { useNoteImageUpload } from "@/hooks/use-note-image-upload";
import { MemoryApplyEnabledContext } from "@/components/memory/memory-apply-context";
import { clearSyncedSessionChunks } from "@/lib/audio-queue";
import { cn } from "@/lib/utils";

interface PrescriptionProps {
    onGenerate:       () => void;
    onCancel:         () => void;
    hasBeenGenerated: boolean;
}

export default function Prescription({ onGenerate, onCancel, hasBeenGenerated }: PrescriptionProps) {
    const store = usePrescriptionStore();
    const navigate = useNavigate();
    const { consultationId } = useParams({ from: "/doctor/prescribe/$consultationId" });

    const [activeDocument, setActiveDocument] = useState<PrescriptionDocument>("prescription");

    // Doctors who prescribe on another system run Olive for the clinical note only.
    const { data: clinicianProfile } = useClinicianProfile();
    const prescriptionEnabled = clinicianProfile?.prescription_enabled !== false;

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
        addNoteImages,
        removeNoteImage,

        vitals,
        vitalSources,
        setVitals,

        followUp,
        setFollowUp,
    } = store;

    // Photos upload as soon as they are picked; the note carries only their blob names,
    // which ride along with the rest of the prescription on save.
    const noteImageUpload = useNoteImageUpload({
        sessionId:  consultationId,
        current:    noteImages,
        onUploaded: addNoteImages,
        onRemoved:  (image) => removeNoteImage(image.blob_name),
    });

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
            await api.post("/prescription", { ...payload, includes_prescription: prescriptionEnabled });
        },
        onSuccess: () => {
            // The consultation is saved, so its upload receipts have nothing left to prove.
            // Audio the server never confirmed is deliberately left alone.
            void clearSyncedSessionChunks(consultationId);

            // A note-only consultation has nothing to hand the patient, so finishing it
            // returns to the dashboard instead of opening the print dialog.
            if (prescriptionEnabled) requestPrint("prescription");
            else navigate({ to: "/doctor" });
        },
    });

    const prescriptionPaper = (
        <PrescriptionPaper
            header={<DoctorInfo sessionId={consultationId} />}
            patientStrip={<PatientInfo sessionId={consultationId} />}
            vitalsBar={
                <VitalsBar
                    vitals={vitals}
                    sources={vitalSources}
                    currentSessionId={consultationId}
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
            footer={
                <Button
                    onClick={() => confirmMutation.mutate()}
                    isLoading={confirmMutation.isPending}
                    className="h-12 w-full px-8 font-bold shadow-md sm:h-9 sm:w-auto"
                >
                    Save &amp; Print
                </Button>
            }
        />
    );

    const clinicalNotes = (
        <ClinicalNotesPanel
            notes={summary}
            safetyNet={safetyNet}
            onChange={setSummary}
            patientSlot={<PatientInfo sessionId={consultationId} />}
            onPrint={() => requestPrint("note")}
            images={noteImages}
            onAddImages={noteImageUpload.addImages}
            onRemoveImage={noteImageUpload.removeImage}
            uploadingImages={noteImageUpload.uploadingCount}
        />
    );

    const sessionActions = (
        <PrescriptionActions
            onGenerate={onGenerate}
            onCancel={onCancel}
            hasBeenGenerated={hasBeenGenerated}
        />
    );

    return (
        <>
            {prescriptionEnabled && (
                <div className={cn("rx-print-mount", printTarget !== "prescription" && "print:hidden")} aria-hidden>
                    <PrescriptionView />
                </div>
            )}
            <div className={cn("rx-print-mount", printTarget !== "note" && "print:hidden")} aria-hidden>
                <ClinicalNoteView />
            </div>

            <div className="print:hidden">
                {prescriptionEnabled ? (
                    // Memory fills prescription sections, so its controls appear only here —
                    // never in a note-only consultation, which has no sections to fill.
                    <MemoryApplyEnabledContext.Provider value={true}>
                        <DocumentSwitcher
                            value={activeDocument}
                            onValueChange={setActiveDocument}
                            notesHasContent={!!summary?.trim() || safetyNet.length > 0 || noteImages.length > 0}
                            actions={sessionActions}
                            prescription={prescriptionPaper}
                            notes={clinicalNotes}
                        />
                    </MemoryApplyEnabledContext.Provider>
                ) : (
                    <>
                        <div className="container mt-3 flex justify-center">{sessionActions}</div>
                        {/* Explains the missing prescription where the doctor would notice it
                            missing, so the dashboard never has to carry that reminder. */}
                        <p className="mx-auto w-full max-w-3xl px-4 pt-4 text-xs text-slate-700">
                            Note-only consultation &middot; prescriptions are off in your{" "}
                            <Link to="/doctor/profile" className="font-medium text-emerald-700 underline-offset-2 hover:underline">
                                profile settings
                            </Link>
                            .
                        </p>
                        {clinicalNotes}
                        <div className="mx-auto flex w-full max-w-3xl justify-end px-4 pb-12">
                            <Button
                                onClick={() => confirmMutation.mutate()}
                                isLoading={confirmMutation.isPending}
                                className="h-12 w-full px-8 font-bold shadow-md sm:h-9 sm:w-auto"
                            >
                                Save consultation
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}
