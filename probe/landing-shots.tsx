import { useEffect, useState, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import "./probe.css";
import DashboardNavbar from "@/components/dashboard/navbar";
import PatientChip from "@/components/dashboard/consultation/patient-chip";
import RecorderCard from "@/components/dashboard/consultation/recorder-card";
import ConsultationCardMemo from "@/components/dashboard/consultation/consultation-card";
import ConsultationModeBanner from "@/components/consultation-start/consultation-mode-banner";
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
import type { PrescriptionType } from "@/types/patient";
import type { PrescriptionResponseType } from "@/types/prescription";

// Renders the real consultation, editor and printed-prescription screens with a fictional
// patient, so the landing page can show the product as it is. Every name, number and
// clinical detail below is invented and matches the Try Olive sample conversation.
// Captured by probe/capture-landing-shots.mjs.

const PATIENT_ID = "patient-demo";
const PATIENT = { name: "Samira Rahman", age: 32, sex: "female" as const };
const VISIT_DATE = new Date("2026-11-03T18:40:00+06:00");
const DATE_OF_BIRTH = "1994-06-12";

useAuthStore.setState({
    userId: "doctor-demo", isLoggedIn: true, activeView: "doctor",
    clinician: { name: "Ashraful Alam" },
} as never);

// No BMDC number: an invented one could belong to a real doctor. The accent is left to
// the default, so the letterhead shows what a new doctor gets.
const LETTERHEAD = resolveLetterhead({
    clinician_name: "Dr. Ashraful Alam",
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

const tablet = (amount: string) => ({ type: "tablet" as const, dosage_form: "Tablet", route: "P/O", dose: { amount, unit: "tab" } });

const DRAFT = {
    session_id: "demo-session",
    chief_complaints: [
        { complaint_name: "Fever", clinical_note: "3–4 days, worse at night and towards dawn; up to 102°F." },
        { complaint_name: "Headache and body ache", clinical_note: "" },
        { complaint_name: "Dry cough and runny nose", clinical_note: "Mild." },
        { complaint_name: "Nausea", clinical_note: "Vomited once; tolerating oral fluids." },
    ],
    history: [
        { history_name: "Iron deficiency anaemia", clinical_note: "Diagnosed Aug 2026; on iron and folic acid." },
        { history_name: "Family history of diabetes", clinical_note: "Father." },
        { history_name: "No known drug allergy", clinical_note: "" },
    ],
    diagnoses: [
        { diagnosis_name: "Dengue fever (suspected)", icd_code: "A97.9", confidence: 0.7, clinical_reasoning: "Fever in dengue season with myalgia and nausea; confirm with NS1 and CBC." },
        { diagnosis_name: "Viral upper respiratory tract infection", icd_code: "J06.9", confidence: 0.3, clinical_reasoning: "Cough and rhinorrhoea." },
    ],
    medicines: [
        { ...tablet("1"), trade_name: "Napa", generic_name: "Paracetamol 500 mg", dosage: "", duration: "", purpose: "Fever and body ache",
            routine: { gap_hours: 0, meal_times: [] }, schedule: { timing: "after", morning: 1, noon: 1, night: 1 }, duration_value: 5, duration_unit: "Days" },
        { ...tablet("1"), trade_name: "Montelukast", generic_name: "Montelukast 10 mg", dosage: "", duration: "", purpose: "Runny nose",
            routine: { gap_hours: 0, meal_times: [] }, schedule: { timing: "after", morning: 0, noon: 0, night: 1 }, duration_value: 7, duration_unit: "Days" },
        { ...tablet("1"), trade_name: "Fexo", generic_name: "Fexofenadine 180 mg", dosage: "", duration: "", purpose: "Runny nose",
            routine: { gap_hours: 0, meal_times: [] }, schedule: { timing: "after", morning: 1, noon: 0, night: 0 }, duration_value: 7, duration_unit: "Days" },
        { type: "powder", dosage_form: "Oral Saline", route: "P/O", trade_name: "ORS", generic_name: "Oral rehydration salts", dosage: "", duration: "",
            purpose: "Hydration", routine: { gap_hours: 0, meal_times: [] }, instructions: "Mix as directed on the packet; sip through the day.",
            duration_value: 3, duration_unit: "Days" },
    ],
    investigations: [
        { investigation_name: "CBC", reason: "Platelet count and haematocrit.", priority: "routine" },
        { investigation_name: "Dengue NS1 antigen", reason: "", priority: "routine" },
    ],
    advice: [
        "Drink plenty of water and fluids.",
        "Rest for two to three days.",
        "Go to hospital without waiting for severe abdominal pain, repeated vomiting, bleeding or breathing difficulty.",
    ],
    follow_up: { follow_up_days: 1, follow_up_notes: "Bring the test results." },
    summary: "S: Fever for 3–4 days, worse at night, up to 102°F, with headache, body ache, mild dry cough, runny nose and nausea (vomited once). No bleeding, abdominal pain or breathing difficulty.\nO: Vitals to be recorded at the visit.\nA: Suspected dengue fever; viral URTI also possible.\nP: CBC and dengue NS1 today; symptomatic treatment, fluids and rest; review tomorrow with results.",
    safety_net: ["Return immediately for bleeding, severe abdominal pain, repeated vomiting or breathing difficulty."],
} as unknown as PrescriptionResponseType;

const routine = (meals: string[]) => Object.fromEntries(
    ["before_breakfast", "after_breakfast", "before_lunch", "after_lunch", "before_dinner", "after_dinner"]
        .map((meal) => [meal, meals.includes(meal)]).concat([["gap_hour", 0]]),
);

const PREVIOUS_VISIT: PrescriptionType = {
    prescription_id: "rx-previous", session_id: "session-previous", clinician_id: "doctor-demo",
    clinician_name: "Dr. Ashraful Alam", patient_id: PATIENT_ID, patient_name: PATIENT.name,
    created_at: "2026-08-14T19:05:00+06:00", updated_at: "2026-08-14T19:05:00+06:00",
    prescription_data: {
        chief_complaints: [
            { name_text: "Tiredness and dizziness", notes: "", ccn_id: null, duration: "1 month" },
            { name_text: "Sneezing and blocked nose", notes: "", ccn_id: null, duration: "2 weeks" },
        ],
        diagnoses: [{ name_text: "Iron deficiency anaemia", dn_id: null }, { name_text: "Allergic rhinitis", dn_id: null }],
        rx_list: [
            { trade_name: "Ferrous fumarate + Folic acid", generic_name: "Iron with folic acid", medicine_id: null, dosage: "1 capsule", duration: "3 months", routine: routine(["after_breakfast"]) },
            { trade_name: "Fexo", generic_name: "Fexofenadine 120 mg", medicine_id: null, dosage: "1 tablet", duration: "14 days", routine: routine(["after_dinner"]) },
            { trade_name: "Mometasone nasal spray", generic_name: "Mometasone furoate", medicine_id: null, dosage: "2 puffs", duration: "1 month", routine: routine(["after_breakfast"]) },
        ],
        histories: [], advice_list: [], investigations: [], on_examinations: [],
        follow_up_days: 90, follow_up_notes: null,
        summary: "Iron deficiency anaemia (Hb 9.8 g/dL) and seasonal allergic rhinitis. Iron and folic acid for 3 months; recheck CBC at review.",
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

function RecordScreen() {
    return (
        <DoctorScreen>
            <RecordingSessionContext value={RECORDING}>
                <div className="container flex flex-col py-6 md:h-[calc(100svh-136px)]">
                    <div className="mb-5 flex flex-col gap-3">
                        <PatientChip userId={PATIENT_ID} />
                        <ConsultationModeBanner isFollowUp={false} />
                    </div>
                    <div className="grid w-full grid-cols-1 gap-6 md:min-h-0 md:flex-1 md:grid-cols-2 md:grid-rows-[auto_minmax(0,1fr)] md:gap-8">
                        <div className="flex-none md:col-start-1 md:row-start-1"><RecorderCard /></div>
                        <div className="md:col-start-2 md:row-span-2 md:row-start-1 md:min-h-0">
                            <ConsultationCardMemo prescription={PREVIOUS_VISIT} totalHistories={1} currentHistoryIndex={1}
                                handleNext={() => {}} handlePrevious={() => {}} isFirst isLast hasSelection />
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
            store.getState().setVitals({ bp_systolic: 110, bp_diastolic: 70, pulse: 98, temperature: 101.2, spo2: 98, weight: 56 });
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
