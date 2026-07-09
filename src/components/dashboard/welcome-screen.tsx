
import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import PatientInfo from "./patient/patient-info";
import { cn, handleError } from "@/lib/utils";
import { lookupByPhone } from "@/lib/patient";
import NumberGroupInputMemo from "./number-group-input";
import PatientSkeleton from "./patient/skeleton";
import NewPatient from "./patient/new-patient";
import PatientPicker from "@/components/shared/patient-picker";
import type { ShowContentStatus } from "@/types/patient";
import { useAuthStore } from "@/stores/auth-store";
import { useStartConsultation } from "@/hooks/use-start-consultation";
import DoctorQueuePanel from "./queue/doctor-queue-panel";

export default function WelcomeScreen() {

    const clinician = useAuthStore(state => state.clinician);
    const { start, startingId, graceDialog } = useStartConsultation();

    const [showContent, setShowContent] = useState<ShowContentStatus>({ status: "NOTHING" });
    const [phoneNumber, setPhoneNumber] = useState<string[]>(["0", "1"].concat(Array(9).fill("")));
    const [queueState, setQueueState] = useState({ ready: false, hasWaiting: false });

    // Wait until the queue is known before offering manual entry, then hide it
    // whenever a patient is waiting — one action on screen, no refresh flicker.
    const showManualEntry = queueState.ready && !queueState.hasWaiting;

    const handlePhoneComplete = useCallback(async (isComplete: boolean) => {

        if (!isComplete) {
            setShowContent({ status: "NOTHING" });
            return;
        }

        try {
            setShowContent({ status: "LOADING" });
            const found = await lookupByPhone("+88" + phoneNumber.join("").trim());
            // A phone may already reach one or more patients; always show the picker so
            // "New patient" stays available even when there's exactly one.
            if (found.length === 0) {
                setShowContent({ status: "PATIENT_CREATE", initialValues: { name: "", age: "", sex: "male" } });
            } else {
                setShowContent({ status: "PATIENT_PICK", candidates: found });
            }
        } catch (error) {
            setShowContent({ status: "ERROR", message: "An error occurred while fetching patient data." });
            handleError(error, "An error occurred while fetching patient data.");
            return;
        }

    }, [phoneNumber])


    return (
        <div className="">
            {/* With the phone entry hidden, the live queue becomes the focal point,
                so it drops toward the vertical center like the phone entry does. */}
            <div className={cn(queueState.hasWaiting && "mt-[12vh]")}>
                <DoctorQueuePanel onStateChange={setQueueState} />
            </div>

            {showManualEntry && (
                <>
                    <motion.div
                        initial={{ marginTop: "30%" }}
                        animate={{ marginTop: showContent.status !== "NOTHING" ? "0%" : "15%" }}
                        key="phone-input"
                    />

                    <motion.div className="flex flex-col items-center justify-center mb-10">
                        <p className="mb-6 text-lg text-center text-gray-500 font-light">
                            {clinician?.firstName
                                ? `Dr. ${clinician.firstName}, enter your patient's phone number`
                                : "Enter your patient's phone number"}
                        </p>
                        <div className="w-full max-w-md px-4 sm:px-0">
                            <NumberGroupInputMemo
                                onComplete={handlePhoneComplete}
                                numberInput={phoneNumber}
                                setNumberInput={setPhoneNumber}
                            />
                        </div>
                    </motion.div>
                </>
            )}


            <AnimatePresence initial={false}>
                {showManualEntry && showContent.status !== "NOTHING" && (
                    <motion.div
                        key={showContent.status}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="mt-10 max-w-xl mx-auto"
                    >
                        {(() => {
                            switch (showContent.status) {
                                case "PATIENT_INFO":
                                    return (
                                        <PatientInfo
                                            userId={showContent.userId}
                                            phone={phoneNumber.join("").trim()}
                                            setShowContent={setShowContent}
                                        />
                                    );

                                case "PATIENT_PICK":
                                    return (
                                        <PatientPicker
                                            candidates={showContent.candidates}
                                            actionLabel="Start Consultation"
                                            onAction={(patient) => start(patient.patient_id, "+88" + phoneNumber.join("").trim())}
                                            busyPatientId={startingId}
                                            onSelect={(patient) => setShowContent({ status: "PATIENT_INFO", userId: patient.patient_id })}
                                            onNew={() => setShowContent({ status: "PATIENT_CREATE", initialValues: { name: "", age: "", sex: "male" } })}
                                        />
                                    );

                                case "PATIENT_CREATE":
                                    return (
                                        <NewPatient
                                            phone={phoneNumber.join("").trim()}
                                            name={showContent.initialValues?.name}
                                            age={showContent.initialValues?.age}
                                            sex={showContent.initialValues?.sex}
                                            userId={showContent.userId}
                                        />
                                    );

                                case "LOADING":
                                    return <PatientSkeleton />;

                                case "ERROR":
                                    return (
                                        <div className="text-rose-500 text-center bg-rose-100 p-4 rounded">
                                            {showContent.message}
                                        </div>
                                    );

                                default:
                                    return null;
                            }
                        })()}
                    </motion.div>
                )}
            </AnimatePresence>

            {graceDialog}
        </div>
    )
}