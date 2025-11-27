
import { PhoneIcon } from "lucide-react";
import { useState } from "react";
import { TextAnimate } from "../ui/text-animate";
import { AnimatePresence, motion } from "motion/react";
import PatientInfo from "./patient/patient-info";
import NumberGroupInput from "./number-group-input";

export default function WelcomeScreen() {

    const [showContent, setShowContent] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState<string[]>(["0", "1"].concat(Array(9).fill(" ")));

    const handlePhoneComplete = (isComplete: boolean) => {
        setShowContent(isComplete);
    }


    return (
        <div className="">
            <motion.div
                initial={{ marginTop: "30%" }}
                animate={{ marginTop: showContent ? "0%" : "15%" }}
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
                <NumberGroupInput
                    onComplete={handlePhoneComplete}
                    numberInput={phoneNumber}
                    setNumberInput={setPhoneNumber}
                />
            </motion.div>

            <AnimatePresence initial={false}>
                {showContent ? (
                    <motion.div
                        initial={{ opacity: 0, }}
                        animate={{ opacity: 1, }}
                        key="content"
                        className="container mt-10"
                    >
                        <PatientInfo phone={phoneNumber.join("").trim()} />
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </div>
    )
}