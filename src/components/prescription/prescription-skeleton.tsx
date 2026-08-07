import { useEffect, useState } from "react";
import { SparklesIcon, LockIcon } from "lucide-react";
import DoctorInfo from "./doctor-info";
import PrescriptionActions from "./prescription-actions";
import PatientInfo from "./patient-info";
import { usePrescriptionStore } from "@/stores/prescription-store";
import { hasAnyVital } from "@/lib/vitals";
import ListInfo from "./list-info";
import VitalsBar from "./paper/vitals-bar";
import ClinicalNotesPanel from "./paper/clinical-notes-panel";
import DocumentSwitcher, { type PrescriptionDocument } from "./document-switcher";
import { useClinicianProfile } from "@/hooks/use-clinician-profile";

// ─── Sliding AI text phrases ───────────────────────────────────────────────────
const PRESCRIPTION_PHRASES = [
  "Analyzing conversation...",
  "Identifying chief complaints...",
  "Cross-referencing symptoms...",
  "Evaluating diagnosis criteria...",
  "Consulting clinical knowledge base...",
  "Scoring differential diagnoses...",
  "Reviewing drug interactions...",
  "Calculating dosage parameters...",
  "Drafting prescription...",
  "Finalizing recommendations...",
];

// Note-only consultations never draft an Rx, so the status never claims to.
const NOTE_PHRASES = [
  "Analyzing conversation...",
  "Identifying chief complaints...",
  "Summarizing history...",
  "Recording examination findings...",
  "Forming the assessment...",
  "Flagging safety concerns...",
  "Finalizing your note...",
];

// ─── Cycling AI status text ────────────────────────────────────────────────────
function AiStatusText({ phrases }: { phrases: string[] }) {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setPhraseIndex((prev) => (prev + 1) % phrases.length);
        setVisible(true);
      }, 400);
    }, 2200);

    return () => clearInterval(intervalId);
  }, [phrases.length]);

  return (
    <span
      className="text-emerald-600 text-sm font-semibold tracking-wide transition-all duration-400"
      style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(6px)" }}
    >
      {phrases[phraseIndex]}
    </span>
  );
}

function AiStatusBlock({ phrases }: { phrases: string[] }) {
  return (
    <div className="flex items-center gap-3 py-3 px-4 my-3 rounded-xl bg-gradient-to-r from-emerald-50 to-slate-50 border border-emerald-100">
      <SparklesIcon className="w-4 h-4 text-emerald-500 animate-pulse shrink-0" />
      <AiStatusText phrases={phrases} />
      <span className="flex gap-1 ml-auto">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce"
            style={{ animationDelay: `${i * 0.18}s` }}
          />
        ))}
      </span>
    </div>
  );
}

// ─── Shimmer line ──────────────────────────────────────────────────────────────
function ShimmerLine({ width = "100%", thin = false }: { width?: string; thin?: boolean }) {
  return (
    <div
      className={`relative overflow-hidden rounded-full bg-slate-100 ${thin ? "h-2" : "h-3"}`}
      style={{ width }}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-white/70 to-transparent" />
    </div>
  );
}

// ─── Section header ────────────────────────────────────────────────────────────
function SectionHeader({ label, highlight = false }: { label: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between px-1 mb-2">
      <h3
        className={`font-bold text-xs uppercase tracking-widest ${highlight ? "text-emerald-400" : "text-slate-300"
          }`}
      >
        {label}
      </h3>
      <SparklesIcon className="w-3 h-3 text-emerald-300 animate-pulse" />
    </div>
  );
}

// ─── Skeleton list section ─────────────────────────────────────────────────────
function SkeletonListSection({
  label,
  itemCount = 2,
  highlight = false,
}: {
  label: string;
  itemCount?: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex flex-col gap-2 p-2 rounded-xl ${highlight ? "bg-emerald-50/30 border-2 border-emerald-200/60" : ""
        }`}
    >
      <SectionHeader label={label} highlight={highlight} />
      <div className="flex flex-col gap-1.5">
        {Array.from({ length: itemCount }).map((_, i) => (
          <div
            key={i}
            className="py-1 px-2 rounded-lg border border-slate-100 bg-slate-50 flex flex-col gap-1"
          >
            <ShimmerLine width={i % 2 === 0 ? "70%" : "55%"} />
            {highlight && <ShimmerLine width="80%" thin />}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Skeleton vitals bar ───────────────────────────────────────────────────────
function SkeletonVitals() {
  return (
    <div className="flex flex-col gap-2.5 border-y py-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-[11px] uppercase tracking-widest text-slate-300">On Examination</h3>
        <SparklesIcon className="w-3 h-3 text-emerald-300 animate-pulse" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5">
            <ShimmerLine width="50%" thin />
            <ShimmerLine width="75%" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Skeleton clinical notes (until the summary streams in) ─────────────────────
function SkeletonNotes() {
  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LockIcon className="size-4 text-slate-300" />
          <h3 className="font-bold text-sm uppercase tracking-widest text-slate-300">Clinical Notes</h3>
        </div>
        <SparklesIcon className="w-3 h-3 text-emerald-300 animate-pulse" />
      </div>
      <p className="text-xs text-slate-700">
        Private &middot; only you can see this. Never shared with the patient.
      </p>
      <div className="rounded-xl border border-border bg-muted/50 px-4 py-3 min-h-[280px] flex flex-col gap-2.5">
        <ShimmerLine width="90%" />
        <ShimmerLine width="80%" />
        <ShimmerLine width="85%" />
        <ShimmerLine width="60%" />
      </div>
    </div>
  );
}

// ─── Skeleton medicine card ────────────────────────────────────────────────────
function SkeletonMedicineCard({ index }: { index: number }) {
  const widths = ["65%", "80%", "50%", "72%"];
  return (
    <div className="border border-slate-100 rounded-xl p-3 flex flex-col gap-2 bg-white/60">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1.5 flex-1">
          <ShimmerLine width={widths[index % widths.length]} />
          <ShimmerLine width="40%" thin />
        </div>
        <div className="h-5 w-16 rounded-full bg-emerald-50 border border-emerald-100 animate-pulse" />
      </div>
      <div className="flex gap-2 pt-1 border-t border-slate-50">
        <ShimmerLine width="45%" thin />
        <ShimmerLine width="30%" thin />
      </div>
    </div>
  );
}

interface SkeletonProps {
  onCancel?: () => void;
  sessionId: string;
}

// ─── Note-only generation ──────────────────────────────────────────────────────
// Doctors who prescribe elsewhere never see a prescription being drafted: the note
// is the whole document, so it is the whole loading screen.
function ClinicalNoteSkeleton({ onCancel, sessionId }: SkeletonProps) {
  const summary = usePrescriptionStore((s) => s.summary);
  const safetyNet = usePrescriptionStore((s) => s.safetyNet);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col px-4">
      <PatientInfo sessionId={sessionId} />
      <AiStatusBlock phrases={NOTE_PHRASES} />

      {summary.length > 0 || safetyNet.length > 0
        ? <ClinicalNotesPanel notes={summary} safetyNet={safetyNet} />
        : <SkeletonNotes />}

      <div className="flex justify-center py-4">
        <PrescriptionActions onCancel={onCancel} hasBeenGenerated={false} />
      </div>

      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
}

// ─── Main PrescriptionSkeleton ─────────────────────────────────────────────────
export default function PrescriptionSkeleton({ onCancel, sessionId }: SkeletonProps) {
  const { data: clinician } = useClinicianProfile();

  if (clinician?.prescription_enabled === false) {
    return <ClinicalNoteSkeleton onCancel={onCancel} sessionId={sessionId} />;
  }

  return <FullPrescriptionSkeleton onCancel={onCancel} sessionId={sessionId} />;
}

function FullPrescriptionSkeleton({ onCancel, sessionId }: SkeletonProps) {

  const store = usePrescriptionStore();
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

    // summary
    summary,
    safetyNet,

    // vitals
    vitals,
    setVitals,
  } = store;

  const [activeDocument, setActiveDocument] = useState<PrescriptionDocument>("prescription");

  const hasNotesContent = summary.length > 0 || safetyNet.length > 0;
  const notesContent = hasNotesContent
    ? <ClinicalNotesPanel notes={summary} safetyNet={safetyNet} />
    : <SkeletonNotes />;

  const prescriptionContent = (
    <div className="container rounded-xl border flex flex-col mt-4 mb-12 overflow-hidden">
      <div className="m-4">
        {/* ── Real Doctor & Patient info ─────────────────────────── */}
        <DoctorInfo sessionId={sessionId} />
        <PatientInfo sessionId={sessionId} />

        {/* ── Vitals (real once streamed, skeleton until then) ───── */}
        {hasAnyVital(vitals)
          ? <VitalsBar vitals={vitals} onChange={setVitals} />
          : <SkeletonVitals />}

        {/* ── AI Status block ────────────────────────────────────── */}
        <AiStatusBlock phrases={PRESCRIPTION_PHRASES} />

        {/* ── Skeleton clinical content ──────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3">
          {/* Left panel */}
          <div className="h-full md:border-r md:col-span-1 border-b md:border-b-0 py-4 flex flex-col gap-2">

            {chiefComplaint.length > 0
              ? (
                <ListInfo
                  title="Chief Complaints"
                  info={chiefComplaint}
                  fieldName="chief-complaint"
                  addEmptyItem={addEmptyChiefComplaint}
                  updateItem={updateChiefComplaint}
                  removeItem={removeChiefComplaint}
                />
              )
              : (
                <SkeletonListSection label="Chief Complaints" itemCount={2} />
              )}
            {history.length > 0
              ? (
                <ListInfo
                  title="History"
                  info={history}
                  fieldName="history"
                  addEmptyItem={addEmptyHistory}
                  updateItem={updateHistory}
                  removeItem={removeHistory}
                />
              )
              : (
                <SkeletonListSection label="History" itemCount={1} />
              )}
            {diagnosis.length > 0
              ? (
                <ListInfo
                  title="Diagnosis"
                  info={diagnosis}
                  fieldName="diagnosis"
                  addEmptyItem={addEmptyDiagnosis}
                  updateItem={updateDiagnosis}
                  removeItem={removeDiagnosis}
                />
              )
              : (
                <SkeletonListSection label="Diagnosis" itemCount={2} highlight />
              )}
            {investigation.length > 0
              ? (
                <ListInfo
                  title="Investigation"
                  info={investigation}
                  fieldName="investigation"
                  addEmptyItem={addEmptyInvestigation}
                  updateItem={updateInvestigation}
                  removeItem={removeInvestigation}
                />
              )
              : (
                <SkeletonListSection label="Investigation" itemCount={2} />
              )}
          </div>

          {/* Right panel – Medicines */}
          <div className="md:col-span-2 py-4 px-4 md:px-8">
            <div className="pt-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-md text-emerald-300">Medicine (Rx)</h3>
                <SparklesIcon className="w-3.5 h-3.5 text-emerald-300 animate-pulse" />
              </div>
              <div className="flex flex-col gap-2">
                {[0, 1, 2, 3].map((i) => (
                  <SkeletonMedicineCard key={i} index={i} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save & Print's spot is a shimmer placeholder so there's no layout jump once
          generation finishes; the session actions (Cancel) sit under the document tabs. */}
      <div className="sticky bottom-0 z-20 flex items-center justify-end gap-4 rounded-b-xl border-t bg-white/85 px-4 py-3 backdrop-blur sm:justify-between">
        <span className="hidden text-xs text-slate-400 sm:block">Generating your draft...</span>
        <div className="h-9 w-28 rounded-lg bg-slate-200 animate-pulse" />
      </div>

      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );

  return (
    <DocumentSwitcher
      value={activeDocument}
      onValueChange={setActiveDocument}
      notesHasContent={hasNotesContent}
      actions={<PrescriptionActions onCancel={onCancel} hasBeenGenerated={false} />}
      prescription={prescriptionContent}
      notes={notesContent}
    />
  );
}
