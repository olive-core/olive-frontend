import { useEffect, useState, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import "./probe.css";
import DashboardNavbar from "@/components/dashboard/navbar";
import PatientChip from "@/components/dashboard/consultation/patient-chip";
import RecorderCard from "@/components/dashboard/consultation/recorder-card";
import ConsultationCardMemo from "@/components/dashboard/consultation/consultation-card";
import ConsultationModeBanner from "@/components/consultation-start/consultation-mode-banner";
import HistoryContainer from "@/components/dashboard/consultation/history-container";
import DocumentSwitcher, { type PrescriptionDocument } from "@/components/prescription/document-switcher";
import PrescriptionActions from "@/components/prescription/prescription-actions";
import { usePrescriptionDocuments } from "@/components/prescription/prescription-documents";
import PatientStrip from "@/components/prescription/paper/patient-strip";
import PrescriptionPrintDocument from "@/components/prescription/paper/prescription-print-document";
import { ResolvedPrescriptionHeader } from "@/components/prescription/header/clinician-prescription-header";
import { MemoryApplyEnabledContext } from "@/components/memory/memory-apply-context";
import { Button } from "@/components/ui/button";
import { RecordingSessionContext, type RecordingSession } from "@/hooks/use-recording-session";
import { resolveLetterhead } from "@/lib/header-config";
import { createPrescriptionStore, PrescriptionStoreContext } from "@/stores/prescription-store";
import { useAuthStore } from "@/stores/auth-store";
import type { HistoryType, PrescriptionType } from "@/types/patient";
import type { PrescriptionResponseType } from "@/types/prescription";

// Renders the real consultation, editor and printed-prescription screens with a fictional
// patient, so the landing page can show the product as it is. Every name, date and
// clinical detail below is invented. One follow-up visit runs through all three screens:
// a man with diabetes and high blood pressure, back with burning feet.
// Captured by probe/capture-landing-shots.mjs.

const PATIENT_ID = "patient-demo";
const PATIENT = { name: "Rafiqul Islam", age: 56, sex: "male" as const };
const VISIT_DATE = new Date("2026-11-03T18:40:00+06:00");
const DATE_OF_BIRTH = "1970-04-20";
const DOCTOR = "Dr. Ashraful Alam";

useAuthStore.setState({
    userId: "doctor-demo", isLoggedIn: true, activeView: "doctor",
    clinician: { name: "Ashraful Alam" },
} as never);

// No BMDC number: an invented one could belong to a real doctor. The accent is left to
// the default, so the letterhead shows what a new doctor gets.
const LETTERHEAD = resolveLetterhead({
    clinician_name: DOCTOR,
    qualification: "MBBS, FCPS (Medicine)",
    clinician_header_config: {
        preset: "classic-split", show_medical_symbol: true,
        designation: "Consultant, Internal Medicine",
        chamber_name: "Evening Chamber, Dhanmondi",
        contact_lines: [
            { id: "demo-address", kind: "address", value: "Dhanmondi, Dhaka" },
            { id: "demo-hours", kind: "hours", value: "Saturday–Thursday · 5:00–9:00 PM" },
            { id: "demo-serial", kind: "serial", value: "Serial: 01XXX-XXXXXX" },
        ],
    },
});

const tablet = (strength: string, trade_name: string, generic_name: string, purpose: string,
    schedule: { morning: number; noon: number; night: number }, duration_value: number, duration_unit: string) => ({
    type: "tablet", dosage_form: "Tablet", route: "P/O", dose: { amount: "1", unit: "tab" },
    trade_name, generic_name: `${generic_name} ${strength}`, purpose, dosage: "", duration: "",
    routine: { gap_hours: 0, meal_times: [] }, schedule: { timing: "after", ...schedule }, duration_value, duration_unit,
});

const DRAFT = {
    session_id: "demo-session",
    chief_complaints: [
        { complaint_name: "Burning and tingling in both feet", clinical_note: "2 months; worse at night." },
        { complaint_name: "Blood sugar not well controlled", clinical_note: "Home fasting readings 9–10 mmol/L." },
    ],
    history: [
        { history_name: "Type 2 diabetes mellitus", clinical_note: "6 years; on metformin and linagliptin." },
        { history_name: "Hypertension", clinical_note: "On amlodipine 5 mg." },
        { history_name: "No known drug allergy", clinical_note: "" },
    ],
    diagnoses: [
        { diagnosis_name: "Type 2 diabetes with peripheral neuropathy (suspected)", icd_code: "E11.42", confidence: 0.75, clinical_reasoning: "Burning, tingling feet worse at night in long-standing diabetes with poor control." },
        { diagnosis_name: "Essential hypertension", icd_code: "I10", confidence: 0.9, clinical_reasoning: "Known hypertension, on treatment." },
    ],
    medicines: [
        tablet("500 mg", "Metformin", "Metformin", "Diabetes", { morning: 1, noon: 0, night: 1 }, 3, "Months"),
        tablet("5 mg", "Linagliptin", "Linagliptin", "Diabetes", { morning: 1, noon: 0, night: 0 }, 3, "Months"),
        tablet("5 mg", "Amlodipine", "Amlodipine", "Blood pressure", { morning: 1, noon: 0, night: 0 }, 3, "Months"),
        tablet("10 mg", "Atorvastatin", "Atorvastatin", "Cholesterol", { morning: 0, noon: 0, night: 1 }, 3, "Months"),
        tablet("75 mg", "Pregabalin", "Pregabalin", "Nerve pain in the feet", { morning: 0, noon: 0, night: 1 }, 1, "Months"),
    ],
    investigations: [
        { investigation_name: "HbA1c", reason: "Diabetes control over 3 months.", priority: "routine" },
        { investigation_name: "Serum creatinine", reason: "", priority: "routine" },
        { investigation_name: "Urine for microalbumin", reason: "", priority: "routine" },
        { investigation_name: "Fasting lipid profile", reason: "", priority: "routine" },
    ],
    advice: [
        "Check both feet every day; wear soft, closed shoes.",
        "Walk for 30 minutes a day.",
        "Less rice and no sweets or sugary drinks.",
    ],
    follow_up: { follow_up_days: 30, follow_up_notes: "Bring the test reports." },
    summary: "S: Burning and tingling in both feet for 2 months, worse at night. Home fasting glucose 9–10 mmol/L.\nO: BP 138/86 mmHg, weight 74 kg.\nA: Type 2 diabetes, suboptimally controlled, with suspected peripheral neuropathy. Hypertension.\nP: Continue current medicines; add pregabalin at night. HbA1c, creatinine, urine microalbumin and lipids. Review in 1 month.",
    safety_net: ["Return early for a foot wound, blister or colour change."],
} as unknown as PrescriptionResponseType;

const routine = (meals: string[]) => Object.fromEntries(
    ["before_breakfast", "after_breakfast", "before_lunch", "after_lunch", "before_dinner", "after_dinner"]
        .map((meal) => [meal, meals.includes(meal)]).concat([["gap_hour", 0]]),
);

const VISITS = [
    { id: "rx-aug", date: "2026-08-14T19:05:00+06:00", diagnoses: ["Type 2 diabetes mellitus", "Hypertension"], complaints: ["Diabetes and BP review"] },
    { id: "rx-may", date: "2026-05-12T18:20:00+06:00", diagnoses: ["Type 2 diabetes mellitus", "Hypertension"], complaints: ["High sugar readings"] },
    { id: "rx-feb", date: "2026-02-03T19:40:00+06:00", diagnoses: ["Hypertension"], complaints: ["Headache", "High BP at pharmacy check"] },
    { id: "rx-nov", date: "2025-11-21T18:10:00+06:00", diagnoses: ["Type 2 diabetes mellitus"], complaints: ["Diabetes review"] },
];

const HISTORIES: HistoryType[] = VISITS.map((visit) => ({
    prescription_id: visit.id, session_id: `session-${visit.id}`, created_at: visit.date,
    diagnoses_summary: visit.diagnoses, chief_complaints_summary: visit.complaints,
    clinician_id: "doctor-demo", clinician_name: DOCTOR,
}));

// The most recent visit, which the consultation screen opens on for a follow-up.
const PREVIOUS_VISIT: PrescriptionType = {
    prescription_id: "rx-aug", session_id: "session-rx-aug", clinician_id: "doctor-demo",
    clinician_name: DOCTOR, patient_id: PATIENT_ID, patient_name: PATIENT.name,
    created_at: VISITS[0].date, updated_at: VISITS[0].date,
    prescription_data: {
        chief_complaints: [{ name_text: "Diabetes and BP review", notes: "", ccn_id: null, duration: "" }],
        diagnoses: [{ name_text: "Type 2 diabetes mellitus", dn_id: null }, { name_text: "Hypertension", dn_id: null }],
        rx_list: [
            { trade_name: "Metformin 500 mg", generic_name: "Metformin", medicine_id: null, dosage: "1 tablet", duration: "3 months", routine: routine(["after_breakfast", "after_dinner"]) },
            { trade_name: "Linagliptin 5 mg", generic_name: "Linagliptin", medicine_id: null, dosage: "1 tablet", duration: "3 months", routine: routine(["after_breakfast"]) },
            { trade_name: "Amlodipine 5 mg", generic_name: "Amlodipine", medicine_id: null, dosage: "1 tablet", duration: "3 months", routine: routine(["after_breakfast"]) },
            { trade_name: "Atorvastatin 10 mg", generic_name: "Atorvastatin", medicine_id: null, dosage: "1 tablet", duration: "3 months", routine: routine(["after_dinner"]) },
        ],
        histories: [], advice_list: [], investigations: [], on_examinations: [],
        follow_up_days: 90, follow_up_notes: null,
        summary: "HbA1c 7.9%. BP 142/88 mmHg. Linagliptin added in May; continue. Recheck HbA1c in 3 months.",
    },
} as unknown as PrescriptionType;

const RECORDING: RecordingSession = {
    target: { sessionId: "demo-session", patientId: PATIENT_ID },
    status: "listening", duration: 134,
    queue: { health: "secured", pending: 0, rejected: 0 },
    hasInlineRecorder: true,
    hasFinished: () => false, startRecording: () => {}, retryRecording: () => {},
    pauseRecording: () => {}, resumeRecording: () => {}, finishRecording: () => {},
    discardRecording: async () => {}, registerInlineRecorder: () => () => {},
};

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Infinity } } });
queryClient.setQueryData(["patient-info", PATIENT_ID], { name: PATIENT.name, date_of_birth: DATE_OF_BIRTH, sex: PATIENT.sex });

function DoctorScreen({ children }: { children: ReactNode }) {
    return (
        <div className="doctor-portal">
            <main className="flex min-h-svh w-full flex-col pt-[var(--doctor-header-height)]">
                <DashboardNavbar />
                <div className="flex w-full flex-1 flex-col">{children}</div>
            </main>
        </div>
    );
}

// The consultation screen as the route lays it out: recorder, then the open visit, then
// the visit history (the DOM order is the phone order).
function RecordScreen() {
    return (
        <DoctorScreen>
            <RecordingSessionContext value={RECORDING}>
                <div className="container flex flex-col py-6 md:h-[calc(100svh-136px)]">
                    <div className="mb-5 flex flex-none flex-col gap-3">
                        <PatientChip userId={PATIENT_ID} />
                        <ConsultationModeBanner isFollowUp followUpSource={HISTORIES[0]} onViewSource={() => {}} />
                    </div>
                    <div className="grid w-full grid-cols-1 gap-6 md:min-h-0 md:flex-1 md:grid-cols-2 md:grid-rows-[auto_minmax(0,1fr)] md:gap-8">
                        <div className="flex-none md:col-start-1 md:row-start-1"><RecorderCard /></div>
                        <div className="md:col-start-2 md:row-span-2 md:row-start-1 md:min-h-0">
                            <ConsultationCardMemo prescription={PREVIOUS_VISIT} totalHistories={HISTORIES.length} currentHistoryIndex={1}
                                handleNext={() => {}} handlePrevious={() => {}} isFirst isLast={false} hasSelection />
                        </div>
                        <div className="h-[60svh] md:col-start-1 md:row-start-2 md:h-auto md:min-h-0">
                            <HistoryContainer histories={HISTORIES} activeHistoryId={PREVIOUS_VISIT.prescription_id} setActiveHistoryId={() => {}} />
                        </div>
                    </div>
                </div>
            </RecordingSessionContext>
        </DoctorScreen>
    );
}

const patientStrip = <PatientStrip name={PATIENT.name} dateOfBirth={DATE_OF_BIRTH} sex={PATIENT.sex} dateTime={VISIT_DATE} />;

function ReviewScreen() {
    const [document, setDocument] = useState<PrescriptionDocument>("prescription");
    const { prescriptionPaper, clinicalNotes } = usePrescriptionDocuments({
        header: <ResolvedPrescriptionHeader letterhead={LETTERHEAD} responsive />,
        patientStrip,
        sessionId: DRAFT.session_id,
        saveAndPrintButton: <Button className="h-12 w-full px-8 font-bold shadow-md sm:h-9 sm:w-auto">Save &amp; Print</Button>,
        onPrintNotes: () => {},
    });
    return (
        <DoctorScreen>
            <MemoryApplyEnabledContext value={true}>
                <DocumentSwitcher value={document} onValueChange={setDocument} notesHasContent
                    actions={<PrescriptionActions onGenerate={() => {}} onCancel={() => {}} hasBeenGenerated />}
                    prescription={prescriptionPaper} notes={clinicalNotes} />
            </MemoryApplyEnabledContext>
        </DoctorScreen>
    );
}

function PrintScreen({ store }: { store: ReturnType<typeof createPrescriptionStore> }) {
    return (
        <div id="print-shot" className="w-fit bg-white py-[8mm]">
            <PrescriptionPrintDocument letterhead={LETTERHEAD} data={store.getState().getSubmitPayload("demo-session")} patientSlot={patientStrip} />
        </div>
    );
}

function Page() {
    const [store] = useState(createPrescriptionStore);
    const [ready, setReady] = useState(false);
    useEffect(() => {
        void store.getState().getInitialPrescription(DRAFT).then(() => {
            // Vitals are typed in by the doctor during the visit, not drafted.
            store.getState().setVitals({ bp_systolic: 138, bp_diastolic: 86, pulse: 78, temperature: 98.4, spo2: 98, weight: 74 });
            setReady(true);
        });
    }, [store]);
    if (!ready) return null;

    const screen = window.location.hash.slice(1);
    return (
        <PrescriptionStoreContext value={store}>
            {screen === "record" && <RecordScreen />}
            {screen === "review" && <ReviewScreen />}
            {screen === "print" && <PrintScreen store={store} />}
            <span id="shot-ready" hidden />
        </PrescriptionStoreContext>
    );
}

createRoot(document.getElementById("root")!).render(
    <QueryClientProvider client={queryClient}><Page /></QueryClientProvider>,
);
