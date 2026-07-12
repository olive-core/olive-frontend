import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { CalendarIcon, MarsIcon, MicIcon, PenIcon, TransgenderIcon, VenusIcon } from "lucide-react";
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
import { getAgeFromDOB } from "@/lib/utils";
import { useStartConsultation } from "@/hooks/use-start-consultation";
import PatientSkeleton from "./skeleton";


interface PatientInfoProps {
    userId: string;
    phone?: string;
    setShowContent: React.Dispatch<React.SetStateAction<ShowContentStatus>>;
}

export default function PatientInfo({ userId: patientId, phone, setShowContent }: PatientInfoProps) {

    const { start, startingId, graceDialog } = useStartConsultation();

    const { data: patientData, isLoading, isError } = useQuery({
        queryKey: ['patient-info', patientId],
        queryFn: async () => {
            const response = await api.get<PatientInfoType>(`/patient/${patientId}`);
            return response.data;
        }
    });

    if (isLoading) {
        return <PatientSkeleton />;
    }

    const handleStartConsultation = () => start(patientId, phone ? `+88${phone}` : undefined);

    if (isError || !patientData) {
        return <div className="py-4 px-6 bg-rose-100 text-rose-500 rounded-lg border-rose-300 border-2">Error loading patient info.</div>;
    }

    const handleEdit = () => {
        setShowContent({
            status: "PATIENT_CREATE",
            initialValues: {
                name: patientData.name,
                age: getAgeFromDOB(patientData.date_of_birth).years.toString(),
                sex: patientData.sex
            },
            userId: patientId
        });
    };

    const renderSexIcon = () => {
        if (!patientData.sex) return null;

        if (patientData.sex === "male") {
            return <MarsIcon className="inline-block mr-1 size-4 text-blue-500" />;
        }

        if (patientData.sex === "female") {
            return <VenusIcon className="inline-block mr-1 size-4 text-pink-500" />;
        }

        if (patientData.sex === "non_binary") {
            return <TransgenderIcon className="inline-block mr-1 size-4 text-purple-500" />;
        }

        return null;
    }

    return (
        <div className="flex w-full max-w-md flex-col gap-6 mx-auto">
            <Item variant="outline">
                <ItemContent>
                    {/* TODO: fetch and display real data */}
                    <ItemTitle className="text-lg">{patientData.name}</ItemTitle>
                    <ItemDescription>
                        <div className="flex flex-col space-y-1 text-slate-600 text-sm">
                            <div className="flex">
                                <CalendarIcon className="inline-block mr-1 size-4" />
                                <span>{format(new Date(patientData.date_of_birth), "MMM d, yyyy")} ({getAgeFromDOB(patientData.date_of_birth).years}y {getAgeFromDOB(patientData.date_of_birth).months}m)</span>
                            </div>
                            <div className="flex items-center">
                                {renderSexIcon()}
                                <span className="capitalize">{patientData.sex}</span>
                            </div>
                        </div>
                    </ItemDescription>
                </ItemContent>
                <ItemActions>
                    <Button variant="outline" size="sm" onClick={handleEdit}>
                        <PenIcon className="inline-block mr-1 size-3" /> Edit
                    </Button>
                </ItemActions>

                <Button className="w-full" onClick={handleStartConsultation} isLoading={startingId === patientId} disabled={startingId === patientId}>
                    <MicIcon className="inline-block size-4" />
                    Start Consultation
                </Button>
            </Item>
            {graceDialog}
        </div>
    )
}