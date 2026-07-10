import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2Icon, Undo2Icon } from "lucide-react";

import api from "@/lib/axios";
import { useAuthStore } from "@/stores/auth-store";
import { usePrescriptionStore } from "@/stores/prescription-store";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// The session-level controls (AI draft generation, RxMemory templates), shown right
// under the document tabs — kept separate from `DoctorInfo` so the letterhead can
// always render at the paper's full width.
export default function PrescriptionActions({
    onGenerate,
    onCancel,
    hasBeenGenerated,
}: {
    onGenerate?:       () => void;
    onCancel?:         () => void;
    hasBeenGenerated?: boolean;
}) {
    const { userId } = useAuthStore();
    const isGenerating = usePrescriptionStore((s) => s.isGenerating);
    const templateSelected = usePrescriptionStore((s) => s.templateSelected);
    const generatedSections = usePrescriptionStore((s) => s.generatedSections);
    const setPrescriptionFromTemplate = usePrescriptionStore((s) => s.setPrescriptionFromTemplate);
    const revertTemplateSelection = usePrescriptionStore((s) => s.revertTemplateSelection);

    const [isApplyingTemplate, setIsApplyingTemplate] = useState(false);
    const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

    const hasGeneratedData = Object.values(generatedSections).some((items) => items.length > 0);

    useEffect(() => {
        if (!templateSelected) {
            setSelectedTemplateId(null);
        }
    }, [templateSelected]);

    const { data: templates = [], isLoading: isLoadingTemplates } = useQuery<{ template_id: string, template_name: string }[]>({
        queryKey: ["prescription-templates", userId],
        queryFn: async () => {
            const response = await api.get(`/prescription-template/my?clinician_id=${userId}`);
            return response.data;
        },
        enabled: !!userId,
    });

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
    };

    return (
        <div className="flex w-full flex-wrap items-center justify-center gap-3">
            {isGenerating ? (
                <Button variant="destructive" onClick={onCancel}>
                    Cancel
                </Button>
            ) : (
                <Button onClick={onGenerate}>
                    {hasBeenGenerated ? "Re-generate" : "Generate Draft"}
                </Button>
            )}

            <Select
                disabled={isLoadingTemplates || templates.length === 0 || isApplyingTemplate}
                value={selectedTemplateId ?? ""}
                onValueChange={handleTemplateSelect}
            >
                <SelectTrigger className="w-full sm:w-56">
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
                    {templates.map((t) => (
                        <SelectItem key={t.template_id} value={t.template_id}>
                            {t.template_name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
