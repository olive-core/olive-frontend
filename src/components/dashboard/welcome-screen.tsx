
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

export default function WelcomeScreen() {

    const [showContent, setShowContent] = useState<"NOTHING" | "PATIENT_INFO" | "PATIENT_CREATE" | "LOADING" | { status: "ERROR", message: string }>("NOTHING");
    const [phoneNumber, setPhoneNumber] = useState<string[]>(["0", "1"].concat(Array(9).fill(" ")));

    const handlePhoneComplete = useCallback(async (isComplete: boolean) => {

        if (!isComplete) {
            setShowContent("NOTHING");
            return;
        }

        try {
            setShowContent("LOADING");
            const response = await api.post("/patient/by-phone", { phone: phoneNumber.join("").trim() });
            console.log(response.data);
            setShowContent("PATIENT_INFO");
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response) {
                    if (error.response.status === 404) {
                        setShowContent("PATIENT_CREATE");
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
                animate={{ marginTop: showContent !== "NOTHING" ? "0%" : "15%" }}
                key="phone-input"
            />

            <motion.div className="flex flex-col items-center justify-center mb-10">
                <TextAnimate animation="blurInUp" by="character" once as="h3" className="font-display text-3xl md:text-xl leading-10 font-light text-center">
                    Welcome, Dr. Smith!
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
                {showContent !== "NOTHING" ? (
                    <motion.div
                        initial={{ opacity: 0, }}
                        animate={{ opacity: 1, }}
                        key="content"
                        className="mt-10 max-w-xl mx-auto"
                    >
                        {showContent === "PATIENT_INFO" && <PatientInfo phone={phoneNumber.join("").trim()} />}
                        {showContent === "PATIENT_CREATE" && <NewPatient phone={phoneNumber.join("").trim()} />}
                        {showContent === "LOADING" && <PatientSkeleton />}
                        {typeof showContent === "object" && showContent.status === "ERROR" && (
                            <div className="text-rose-500 text-center bg-rose-100 p-4 rounded">{showContent.message}</div>
                        )}
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </div>
    )
}