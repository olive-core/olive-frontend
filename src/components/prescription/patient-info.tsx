import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import api from "@/lib/axios";

type SessionType = {
    patient_id: string;
};

type PatientInfoType = {
    first_name: string;
    last_name: string;
    date_of_birth: string;
    sex: string;
};

export default function PatientInfo({ sessionId }: { sessionId: string }) {

    // 1️⃣ Fetch session
    const { data: session } = useQuery({
        queryKey: ["session", sessionId],
        queryFn: async () => {
            const { data } = await api.get<SessionType>(`/session/${sessionId}`);
            return data;
        },
        enabled: !!sessionId,
    });

    const patientId = session?.patient_id;

    // 2️⃣ Fetch patient (depends on session)
    const { data: patient, isLoading } = useQuery({
        queryKey: ["patient", patientId],
        queryFn: async () => {
            const { data } = await api.get<PatientInfoType>(`/patient/${patientId}`);
            return data;
        },
        enabled: !!patientId, // 🔥 important
    });

    // helper: calculate age
    const getAge = (dob: string) => {
        const birth = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();

        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
            age--;
        }

        return age;
    };

    if (isLoading || !patient) return null;

    return (
        <div className="border-y py-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-sm mt-5">

            <div className="flex gap-4">
                <p className="text-slate-500">
                    Name:{" "}
                    <span className="font-semibold">
                        {patient.first_name} {patient.last_name}
                    </span>
                </p>

                <p className="text-slate-500">
                    Age:{" "}
                    <span className="font-semibold">
                        {getAge(patient.date_of_birth)}y
                    </span>
                </p>

                <p className="text-slate-500">
                    Sex:{" "}
                    <span className="font-semibold">
                        {patient.sex}
                    </span>
                </p>
            </div>

            <div className="flex gap-2">
                <p className="text-slate-500">
                    Date:{" "}
                    <span className="font-semibold">
                        {format(new Date(), "MMM dd, yyyy")}
                    </span>
                </p>

                <p className="text-slate-500">
                    <span className="font-semibold">
                        {format(new Date(), "hh:mm a")}
                    </span>
                </p>
            </div>
        </div>
    );
}