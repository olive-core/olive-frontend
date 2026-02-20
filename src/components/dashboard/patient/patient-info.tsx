import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { CalendarIcon, MarsIcon, MicIcon, PenIcon } from "lucide-react";
import {
    Item,
    ItemActions,
    ItemContent,
    ItemDescription,
    ItemTitle,
} from "@/components/ui/item"
import { format } from "date-fns";
import api from "@/lib/axios";
import type { PatientInfoType, ShowContentStatus } from "@/types/patient";
import { getAgeFromDOB, handleError } from "@/lib/utils";
import PatientSkeleton from "./skeleton";
import { useAuthStore } from "@/stores/auth-store";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";


interface PatientInfoProps {
    userId: string;
    setShowContent: React.Dispatch<React.SetStateAction<ShowContentStatus>>;
}

export default function PatientInfo({ userId: patientId, setShowContent }: PatientInfoProps) {

    const [isCreatingConsultation, setIsCreatingConsultation] = useState(false);
    const navigate = useNavigate();


    const { data: patientData, isLoading, isError } = useQuery({
        queryKey: ['patient-info', patientId],
        queryFn: async () => {
            const response = await api.get<PatientInfoType>(`/patient/${patientId}`);
            return response.data;
        }
    });

    const { userId: clinicianId } = useAuthStore();


    if (isLoading) {
        return <PatientSkeleton />;
    }

    const handleStartConsultation = async () => {
        try {
            //  create consultation -> navigate to consultation page
            setIsCreatingConsultation(true);

            const sessionCreateResponse = await api.post("/session", {
                patient_id: patientId,
                clinician_id: clinicianId,
            });

            const sessionId = sessionCreateResponse.data.session_id;

            navigate({ to: "/dashboard/consultation/$userId/$consultationId", params: { userId: patientId, consultationId: sessionId } });

        } catch (error) {
            handleError(error, "An error occurred while creating the patient.");
        } finally {
            setIsCreatingConsultation(false);
        }
    }

    if (isError || !patientData) {
        return <div className="py-4 px-6 bg-rose-100 text-rose-500 rounded-lg border-rose-300 border-2">Error loading patient info.</div>;
    }

    const handleEdit = () => {
        setShowContent({
            status: "PATIENT_CREATE",
            initialValues: {
                name: "Patient Name", // TODO: replace with real data
                age: getAgeFromDOB(patientData.date_of_birth).toString(),
                sex: 'male' // TODO: replace with real data
            },
            userId: patientId
        });
    };

    return (
        <div className="flex w-full max-w-md flex-col gap-6 mx-auto">
            <Item variant="outline">
                <ItemContent>
                    {/* TODO: fetch and display real data */}
                    <ItemTitle className="text-lg">Patient Name</ItemTitle>
                    <ItemDescription>
                        <div className="flex flex-col space-y-1 text-slate-600 text-sm">
                            <div className="flex">
                                <CalendarIcon className="inline-block mr-1 size-4" />
                                <span>{format(new Date(patientData.date_of_birth), "MMM d, yyyy")}</span>
                            </div>
                            <div className="flex items-center">
                                {/* TODO: fetch and display real data */}
                                <MarsIcon className="inline-block mr-1 size-4 text-blue-500" />
                                <span>Male</span>
                            </div>
                        </div>
                    </ItemDescription>
                </ItemContent>
                <ItemActions>
                    <Button variant="outline" size="sm" onClick={handleEdit}>
                        <PenIcon className="inline-block mr-1 size-3" /> Edit
                    </Button>
                </ItemActions>

                <Button className="w-full" onClick={handleStartConsultation} isLoading={isCreatingConsultation} disabled={isCreatingConsultation}>
                    <MicIcon className="inline-block size-4" />
                    Start Consultation
                </Button>
            </Item>
        </div>
    )
}