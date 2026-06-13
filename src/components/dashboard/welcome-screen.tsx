
import { PhoneIcon } from "lucide-react";
import { useCallback, useState } from "react";
import { TextAnimate } from "../ui/text-animate";
import { AnimatePresence, motion } from "motion/react";
import PatientInfo from "./patient/patient-info";
import api from "@/lib/axios";
import axios from "axios";
import { handleError } from "@/lib/utils";
import NumberGroupInputMemo from "./number-group-input";
import PatientSkeleton from "./patient/skeleton";
import NewPatient from "./patient/new-patient";
import type { ShowContentStatus } from "@/types/patient";
import { useAuthStore } from "@/stores/auth-store";

export default function WelcomeScreen() {

    const clinician = useAuthStore(state => state.clinician);

    const [showContent, setShowContent] = useState<ShowContentStatus>({ status: "NOTHING" });
    const [phoneNumber, setPhoneNumber] = useState<string[]>(["0", "1"].concat(Array(9).fill("")));

    const handlePhoneComplete = useCallback(async (isComplete: boolean) => {

        if (!isComplete) {
            setShowContent({ status: "NOTHING" });
            return;
        }

        try {
            setShowContent({ status: "LOADING" });
            const response = await api.post("/patient/by-phone", { phone: "+88" + phoneNumber.join("").trim() });
            setShowContent({ status: "PATIENT_INFO", userId: response.data.user_id });
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response) {
                    if (error.response.status === 404) {
                        setShowContent({ status: "PATIENT_CREATE", initialValues: { name: "", age: "", sex: "male" } });
                        return;
                    }
                }
            }

            setShowContent({ status: "ERROR", message: "An error occurred while fetching patient data." });
            handleError(error, "An error occurred while fetching patient data.");
            return;
        }

    }, [phoneNumber])


    return (
        <div className="">
            <motion.div
                initial={{ marginTop: "30%" }}
                animate={{ marginTop: showContent.status !== "NOTHING" ? "0%" : "15%" }}
                key="phone-input"
            />

            <motion.div className="flex flex-col items-center justify-center mb-10">
                <TextAnimate animation="blurInUp" by="character" once as="h3" className="font-display text-3xl md:text-xl leading-10 font-light text-center">
                    {`Welcome, Dr. ${clinician?.firstName ?? ""} ${clinician?.lastName ?? ""!}`}
                </TextAnimate>
                <p className="my-4 text-center text-gray-600">
                    <PhoneIcon className="inline-block mr-1 size-4" />
                    Enter patient's phone number to get started:
                </p>
                <NumberGroupInputMemo
                    onComplete={handlePhoneComplete}
                    numberInput={phoneNumber}
                    setNumberInput={setPhoneNumber}
                />
            </motion.div>


            <AnimatePresence initial={false}>
                {showContent.status !== "NOTHING" && (
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
                                            setShowContent={setShowContent}
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

        </div>
    )
}