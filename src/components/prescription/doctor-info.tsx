import api from "@/lib/axios";
import { useAuthStore } from "@/stores/auth-store";
import { usePrescriptionStore } from "@/stores/prescription-store";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2Icon, Undo2Icon } from "lucide-react";
import ClinicianHeader from "./paper/clinician-header";


export default function DoctorInfo({
    onGenerate,
    onCancel,
    hasBeenGenerated,
    hideActions = false
}: {
    onGenerate?: () => void,
    onCancel?: () => void,
    hasBeenGenerated?: boolean,
    hideActions?: boolean
}) {

    const { userId, storeClinicianInfo } = useAuthStore();
    const isGenerating = usePrescriptionStore(s => s.isGenerating);
    const templateSelected = usePrescriptionStore(s => s.templateSelected);
    const generatedSections = usePrescriptionStore(s => s.generatedSections);
    const setPrescriptionFromTemplate = usePrescriptionStore(s => s.setPrescriptionFromTemplate);
    const revertTemplateSelection = usePrescriptionStore(s => s.revertTemplateSelection);

    const [isApplyingTemplate, setIsApplyingTemplate] = useState(false);
    const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

    const hasGeneratedData = Object.values(generatedSections).some(items => items.length > 0);

    useEffect(() => {
        if (!templateSelected) {
            setSelectedTemplateId(null);
        }
    }, [templateSelected]);

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

    const handleTemplateSelect = async (value: string) => {
        if (value === "__revert__") {
            revertTemplateSelection();
            return;
        }

        setIsApplyingTemplate(true);
        setSelectedTemplateId(value);

        try {
            const res = await api.get(`/prescription-template/${value}`);
            setPrescriptionFromTemplate(res.data.prescription_data);
        } catch (error) {
            console.error("Failed to apply template", error);
            setSelectedTemplateId(null);
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
            <ClinicianHeader
                firstName={clinician.first_name}
                lastName={clinician.last_name}
                qualification={clinician.qualification}
                bmdcNo={clinician.bmdc_no}
            />

            {!hideActions && (
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

                    <Select
                        disabled={isLoadingTemplates || templates.length === 0 || isApplyingTemplate}
                        value={selectedTemplateId ?? ""}
                        onValueChange={handleTemplateSelect}
                    >
                        <SelectTrigger className="w-full">
                            {isApplyingTemplate ? (
                                <div className="flex items-center gap-2">
                                    <Loader2Icon className="h-4 w-4 animate-spin" />
                                    Applying...
                                </div>
                            ) : (
                                <SelectValue placeholder="Select RxMemory" />
                            )}
                        </SelectTrigger>
                        <SelectContent>
                            {templateSelected && hasGeneratedData && (
                                <SelectItem value="__revert__" className="text-amber-600">
                                    <div className="flex items-center gap-2">
                                        <Undo2Icon className="h-4 w-4" />
                                        Revert to Generated
                                    </div>
                                </SelectItem>
                            )}
                            {templates.map(t => (
                                <SelectItem key={t.template_id} value={t.template_id}>
                                    {t.template_name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}
        </div>
    )
}
