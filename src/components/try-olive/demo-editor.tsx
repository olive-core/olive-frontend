import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { BookOpenIcon } from "lucide-react";
import toast from "react-hot-toast";
import { usePrescriptionStore } from "@/stores/prescription-store";
import { MemoryApplyEnabledContext } from "@/components/memory/memory-apply-context";
import { SampleMemoryContext } from "@/components/memory/sample-memory-context";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import DocumentSwitcher, { type PrescriptionDocument } from "@/components/prescription/document-switcher";
import PrescriptionActions from "@/components/prescription/prescription-actions";
import { usePrescriptionDocuments } from "@/components/prescription/prescription-documents";
import PatientStrip from "@/components/prescription/paper/patient-strip";
import { ResolvedPrescriptionHeader } from "@/components/prescription/header/clinician-prescription-header";
import { resolveLetterhead } from "@/lib/header-config";
import { MAX_NOTE_IMAGES, noteImageRejection } from "@/lib/note-images";
import type { DemoPatient } from "@/lib/try-olive";
import SampleConversation from "./sample-conversation";
import { SAMPLE_MEMORIES } from "./sample-content";

const DEMO_LETTERHEAD = resolveLetterhead({
    clinician_name: "Dr. Farhan Ahmed",
    qualification: "MBBS (Dhaka Medical College)\nFCPS (Medicine)",
    bmdc_no: "DEMO-0000",
    clinician_header_config: {
        preset: "classic-split", accent_color: "#0f766e", show_medical_symbol: true,
        designation: "Consultant, Internal Medicine",
        chamber_name: "Olive Demo Medical Centre",
        contact_lines: [
            { id: "demo-address", kind: "address", value: "Suite 201, Example Road, Dhaka" },
            { id: "demo-hours", kind: "hours", value: "Saturday–Thursday · 5:00–9:00 PM" },
            { id: "demo-serial", kind: "serial", value: "01XXX-XXXXXX" },
        ],
    },
});

export function DemoDoctorInfo() {
    return <div className="space-y-2">
        <ResolvedPrescriptionHeader letterhead={DEMO_LETTERHEAD} responsive />
        <p className="text-[11px] text-slate-500">Fictional doctor and chamber · Sample prescription header</p>
    </div>;
}
export function DemoPatientInfo({ patient }: { patient: DemoPatient }) {
    const [dateTime] = useState(() => new Date());
    const birth = new Date(dateTime); birth.setFullYear(birth.getFullYear() - patient.age);
    return <PatientStrip name={patient.name} dateOfBirth={birth.toISOString()} sex={patient.sex} dateTime={dateTime} />;
}

const GUIDE = [
    { title: "Edit your draft", text: "Click any prescription entry to edit it. Use the + controls to add entries and × to remove them." },
    { title: "Try the Dengue Fever memory", text: "In your own account, you’ll create memories for your common cases and reuse them in future consultations. For now, click Apply Memory and choose Dengue Fever. It contains medicines, investigations and follow-up. You can also use a section’s Memory control to replace only that section. Review the changes, then try Undo." },
    { title: "Review clinical notes", text: "Switch to Clinical Notes to edit the note or attach a practice image." },
    { title: "Save & Print", text: "When you are ready, Save & Print opens registration. This fictional consultation will not be saved to your account." },
];

export default function DemoEditor({ patient, onGenerate, onCancel }: { patient: DemoPatient; onGenerate: () => void; onCancel: () => void }) {
    const store = usePrescriptionStore();
    const [document, setDocument] = useState<PrescriptionDocument>("prescription");
    const [guideStep, setGuideStep] = useState<number | null>(0);
    const [registerOpen, setRegisterOpen] = useState(false);
    const imageUrls = useRef(new Set<string>());
    useEffect(() => () => { for (const url of imageUrls.current) URL.revokeObjectURL(url); }, []);
    const addImages = (files: File[]) => {
        const room = MAX_NOTE_IMAGES - store.noteImages.length;
        if (files.length > room) toast.error(`Up to ${MAX_NOTE_IMAGES} photos per note`);
        const images = files.slice(0, Math.max(0, room)).flatMap(file => {
            const rejection = noteImageRejection(file);
            if (rejection) { toast.error(rejection); return []; }
            const url = URL.createObjectURL(file); imageUrls.current.add(url);
            return [{ blob_name: url, url }];
        });
        store.addNoteImages(images);
    };
    const saveAndPrintButton = <Button onClick={() => setRegisterOpen(true)} className="h-12 w-full px-8 font-bold shadow-md sm:h-9 sm:w-auto">Save &amp; Print</Button>;
    const { prescriptionPaper, clinicalNotes } = usePrescriptionDocuments({
        header: <DemoDoctorInfo />, patientStrip: <DemoPatientInfo patient={patient} />,
        saveAndPrintButton, onPrintNotes: () => setRegisterOpen(true), onAddImages: addImages,
        onRemoveImage: image => { URL.revokeObjectURL(image.blob_name); imageUrls.current.delete(image.blob_name); store.removeNoteImage(image.blob_name); },
    });
    const showStep = (step: number) => { setGuideStep(step); setDocument(step === 2 ? "notes" : "prescription"); };
    return <SampleMemoryContext value={SAMPLE_MEMORIES}>
        <MemoryApplyEnabledContext value={true}>
            <div className="px-4"><SampleConversation review /></div>
            <DocumentSwitcher value={document} onValueChange={setDocument}
                notesHasContent={!!store.summary?.trim() || store.safetyNet.length > 0 || store.noteImages.length > 0}
                actions={<PrescriptionActions onGenerate={onGenerate} onCancel={onCancel} hasBeenGenerated />}
                prescription={prescriptionPaper} notes={clinicalNotes} />
            <div className="flex justify-center pb-6"><Button variant="ghost" onClick={() => showStep(0)}><BookOpenIcon /> Show quick guide</Button></div>
            <Dialog open={guideStep !== null} onOpenChange={open => { if (!open) setGuideStep(null); }}>
                <DialogContent>
                    <DialogHeader><p className="text-xs font-semibold text-emerald-700">QUICK GUIDE · {(guideStep ?? 0) + 1} / {GUIDE.length}</p>
                        <DialogTitle>{GUIDE[guideStep ?? 0].title}</DialogTitle><DialogDescription>{GUIDE[guideStep ?? 0].text}</DialogDescription>
                    </DialogHeader>
                    <DialogFooter><Button variant="ghost" onClick={() => setGuideStep(null)}>Skip guide</Button>
                        <Button variant="outline" disabled={guideStep === 0} onClick={() => showStep(Math.max(0, (guideStep ?? 0) - 1))}>Back</Button>
                        <Button onClick={() => guideStep === GUIDE.length - 1 ? setGuideStep(null) : showStep((guideStep ?? 0) + 1)}>{guideStep === GUIDE.length - 1 ? "Done" : "Next"}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <Dialog open={registerOpen} onOpenChange={setRegisterOpen}>
                <DialogContent><DialogHeader><DialogTitle>Start saving your consultations</DialogTitle><DialogDescription>Create an account as a doctor, patient, or attendant. This fictional practice session will not be saved or added to your records.</DialogDescription></DialogHeader>
                    <DialogFooter className="gap-2"><Button variant="outline" onClick={() => setRegisterOpen(false)}>Keep exploring</Button><Button asChild><Link to="/sign-in">Register or sign in</Link></Button></DialogFooter>
                </DialogContent>
            </Dialog>
        </MemoryApplyEnabledContext>
    </SampleMemoryContext>;
}
