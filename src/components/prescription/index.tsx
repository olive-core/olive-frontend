import { usePrescriptionStore } from "@/stores/prescription-store";
import DoctorInfo from "./doctor-info";
import ListInfo from "./list-info";
import Medicine from "./medicine";
import PatientInfo from "./patient-info";

export default function Prescription() {

    const { chiefComplaint } = usePrescriptionStore();


    return (
        <div className="container rounded-xl border">
            <div className="m-4">
                <DoctorInfo />
                <PatientInfo />

                <div className="grid grid-cols-3">
                    {/* left */}
                    <div className="h-full border-r col-span-1 py-4 flex flex-col gap-2">
                        <ListInfo
                            title="Chief Complaints"
                            info={chiefComplaint}
                            fieldName="chief-complaint"
                        />
                        <ListInfo
                            title="History"
                            info={[
                                { name: "Diabetes", duration: "5 years", notes: "On medication" },
                                { name: "Hypertension", duration: "3 years", notes: "Regular check-ups" },
                            ]}
                            fieldName="history"
                        />

                        <ListInfo
                            title="Diagnosis"
                            info={[
                                { name: "Migraine" },
                                { name: "Viral Fever" },
                            ]}
                            fieldName="diagnosis"
                        />

                        <ListInfo
                            title="Investigation"
                            info={[
                                { name: "Blood Test", notes: "CBC, Blood Sugar" },
                                { name: "MRI Brain", notes: "To rule out other causes" },
                            ]}
                            fieldName="investigation"
                        />
                    </div>

                    {/* right */}
                    <div className="col-span-2 py-4 px-8">
                        <Medicine />
                    </div>
                </div>
            </div>
        </div>
    );
}