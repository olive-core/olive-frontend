import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { CalendarIcon, MarsIcon, PenIcon } from "lucide-react";
import {
    Item,
    ItemActions,
    ItemContent,
    ItemDescription,
    ItemTitle,
} from "@/components/ui/item"
import { format } from "date-fns";


interface PatientInfoProps {
    phone: string;
}

export default function PatientInfo({ phone }: PatientInfoProps) {

    const { data: patientData, isLoading, isError } = useQuery({
        queryKey: ['patient-info', phone],
        queryFn: async () => {
            await new Promise(resolve => setTimeout(resolve, 1000));
            return {
                firstName: "John",
                lastName: "Doe",
                dateOfBirth: "1980-01-01",
                sex: "Male",
                contact_no: phone
            };
        }
    });

    if (isLoading) {
        return <div>Loading patient info...</div>;
    }

    if (isError || !patientData) {
        return <div>Error loading patient info.</div>;
    }

    return (
        <div className="flex w-full max-w-md flex-col gap-6 mx-auto">
            <Item variant="outline">
                <ItemContent>
                    <ItemTitle className="text-lg">{patientData.firstName} {patientData.lastName}</ItemTitle>
                    <ItemDescription>
                        <div className="flex space-x-4 text-slate-600 text-sm">
                            <div className="flex items-center">
                                <CalendarIcon className="inline-block mr-1 size-4" />
                                <span>{format(new Date(patientData.dateOfBirth), "MMM d, yyyy")}</span>
                            </div>
                            <div className="flex items-center">
                                <MarsIcon className="inline-block mr-1 size-4 text-blue-500" />
                                <span>{patientData.sex}</span>
                            </div>
                        </div>
                    </ItemDescription>
                </ItemContent>
                <ItemActions>
                    <Button variant="outline" size="sm">
                        <PenIcon className="inline-block mr-1 size-3" /> Edit
                    </Button>
                </ItemActions>
            </Item>
        </div>
    )
}