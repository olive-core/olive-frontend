import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import PatientStrip from "./paper/patient-strip";

type SessionType = {
    patient_id: string;
};

type PatientInfoType = {
    name:          string;
    date_of_birth: string;
    sex:           string;
};

export default function PatientInfo({ sessionId }: { sessionId: string }) {
    const { data: session } = useQuery({
        queryKey: ["session", sessionId],
        queryFn: async () => {
            const { data } = await api.get<SessionType>(`/session/${sessionId}`);
            return data;
        },
        enabled: !!sessionId,
    });

    const patientId = session?.patient_id;

    const { data: patient, isLoading } = useQuery({
        queryKey: ["patient", patientId],
        queryFn: async () => {
            const { data } = await api.get<PatientInfoType>(`/patient/${patientId}`);
            return data;
        },
        enabled: !!patientId,
    });

    if (isLoading || !patient) return null;

    return (
        <PatientStrip
            name={patient.name}
            dateOfBirth={patient.date_of_birth}
            sex={patient.sex}
            dateTime={new Date()}
        />
    );
}