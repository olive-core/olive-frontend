import api from "@/lib/axios";
import { useAuthStore } from "@/stores/auth-store";
import { usePrescriptionStore } from "@/stores/prescription-store";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2Icon } from "lucide-react";


export default function DoctorInfo({ 
    onGenerate, 
    onCancel,
    hasBeenGenerated 
}: { 
    onGenerate?: () => void, 
    onCancel?: () => void,
    hasBeenGenerated?: boolean
}) {

    const { userId, storeClinicianInfo } = useAuthStore();
    const isGenerating = usePrescriptionStore(s => s.isGenerating);
    const setPrescriptionFromTemplate = usePrescriptionStore(s => s.setPrescriptionFromTemplate);

    const [isApplyingTemplate, setIsApplyingTemplate] = useState(false);

    const { data: clinician, isLoading } = useQuery({
        queryKey: ["clinician", userId],
        queryFn: async () => {
            const response = await api.get(`/clinician/${userId}`);
            return response.data
        }
    })

    const { data: templates = [], isLoading: isLoadingTemplates } = useQuery<{template_id: string, template_name: string}[]>({
        queryKey: ["prescription-templates", userId],
        queryFn: async () => {
            const response = await api.get(`/prescription-template/my?clinician_id=${userId}`);
            return response.data;
        },
        enabled: !!userId,
    })

    const handleTemplateSelect = async (templateId: string) => {
        setIsApplyingTemplate(true);
        try {
            const res = await api.get(`/prescription-template/${templateId}`);
            setPrescriptionFromTemplate(res.data.prescription_data);
        } catch (error) {
            console.error("Failed to apply template", error);
        } finally {
            setIsApplyingTemplate(false);
        }
    }


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

            <div className="flex flex-col gap-2">
                {isGenerating ? (
                    <Button variant="destructive" onClick={onCancel}>
                        Cancel
                    </Button>
                ) : (
                    <Button onClick={onGenerate}>
                        {hasBeenGenerated ? 'Re-generate' : 'Generate Draft'}
                    </Button>
                )}
                
                <Select disabled={isLoadingTemplates || templates.length === 0 || isApplyingTemplate} onValueChange={handleTemplateSelect}>
                    <SelectTrigger className="w-full">
                        {isApplyingTemplate ? (
                            <div className="flex items-center gap-2">
                                <Loader2Icon className="h-4 w-4 animate-spin" />
                                Applying...
                            </div>
                        ) : (
                            <SelectValue placeholder="Select Template" />
                        )}
                    </SelectTrigger>
                    <SelectContent>
                        {templates.map(t => (
                            <SelectItem key={t.template_id} value={t.template_id}>
                                {t.template_name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    )
}