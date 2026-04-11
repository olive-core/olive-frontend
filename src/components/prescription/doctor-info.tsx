import api from "@/lib/axios";
import { useAuthStore } from "@/stores/auth-store";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Button } from "../ui/button";


export default function DoctorInfo() {

    const { userId, storeClinicianInfo } = useAuthStore();

    const { data: clinician, isLoading } = useQuery({
        queryKey: ["clinician", userId],
        queryFn: async () => {
            const response = await api.get(`/clinician/${userId}`);
            return response.data
        }
    })


    useEffect(() => {
        storeClinicianInfo({
            firstName: clinician?.first_name ?? "",
            lastName: clinician?.last_name ?? "",
            bmdcNo: clinician?.bmdc_no ?? "",
            qualification: clinician?.qualification ?? "",
            generate_ai_draft: clinician?.generate_ai_draft ?? true
        })
    }, [clinician])

    if (isLoading || !clinician) return null;

    return (
        <div className="flex justify-between">
            <div className="pt-2">
                <h3 className="text-xl text-emerald-600 font-display">{(clinician.first_name ?? "") + " " + (clinician.last_name ?? "")}</h3>
                <p className="text-sm text-slate-500">{clinician.qualification}</p>

                <p className="mt-2 text-slate-600">
                    BMDC: <span className="font-semibold">{clinician.bmdc_no}</span>
                </p>
            </div>

            {!clinician.generate_ai_draft && (
                <div className="flex flex-col gap-2">
                    {/* 2 btns -> 1. generate, 2. select template */}
                    <Button>
                        Generate Draft
                    </Button>
                    <Button variant="outline">
                        Select Template
                    </Button>
                </div>
            )}
        </div>
    )
}