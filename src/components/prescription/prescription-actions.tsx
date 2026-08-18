import { usePrescriptionStore } from "@/stores/prescription-store";
import { Button } from "@/components/ui/button";
import { ApplyMemoryButton } from "@/components/memory/apply-memory-button";

// The session-level controls (AI draft generation, memory), shown right under the
// document tabs — kept separate from `DoctorInfo` so the letterhead can always render
// at the paper's full width.
export default function PrescriptionActions({
    onGenerate,
    onCancel,
    hasBeenGenerated,
}: {
    onGenerate?:       () => void;
    onCancel?:         () => void;
    hasBeenGenerated?: boolean;
}) {
    const isGenerating = usePrescriptionStore((state) => state.isGenerating);

    return (
        <div className="flex w-full flex-wrap items-center justify-center gap-3">
            {isGenerating ? (
                <Button variant="destructive" className="h-11 sm:h-9" onClick={onCancel}>
                    Cancel
                </Button>
            ) : (
                <Button className="h-11 sm:h-9" onClick={onGenerate}>
                    {hasBeenGenerated ? "Re-generate" : "Generate Draft"}
                </Button>
            )}

            <ApplyMemoryButton />
        </div>
    );
}
