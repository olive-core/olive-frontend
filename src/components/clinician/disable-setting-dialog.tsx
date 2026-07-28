import { useState } from "react";
import { AlertTriangleIcon } from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import type { ConsultationSetting } from "./consultation-settings";

interface DisableSettingDialogProps {
    setting:   ConsultationSetting | null;
    isSaving:  boolean;
    onCancel:  () => void;
    onConfirm: (reason: string) => void;
}

// Turning a consultation setting off is deliberate: the doctor reads what changes for
// their patients and names the gap that drove it. Turning one back on takes a single
// tap — the friction is asymmetric on purpose, never hidden.
export default function DisableSettingDialog({ setting, isSaving, onCancel, onConfirm }: DisableSettingDialogProps) {
    const [reason, setReason] = useState("");

    const close = () => {
        setReason("");
        onCancel();
    };

    if (!setting) return null;

    return (
        <Dialog open onOpenChange={(open) => !open && close()}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Turn off &ldquo;{setting.label}&rdquo;?</DialogTitle>
                    <DialogDescription>
                        You can turn this back on at any time from your profile.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                    <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-800">
                        <AlertTriangleIcon className="size-4" />
                        What changes
                    </h4>
                    <ul className="flex list-disc flex-col gap-1 pl-5 text-sm text-amber-900">
                        {setting.consequences.map((consequence) => (
                            <li key={consequence}>{consequence}</li>
                        ))}
                    </ul>
                </div>

                <div className="flex flex-col gap-3">
                    <p className="text-sm font-semibold text-slate-900">
                        What is prompting this? <span className="font-normal text-slate-700">Required.</span>
                    </p>
                    <RadioGroup value={reason} onValueChange={setReason} className="gap-2">
                        {setting.reasons.map((option) => (
                            <div key={option} className="flex items-center gap-2.5">
                                <RadioGroupItem value={option} id={option} />
                                <Label htmlFor={option} className="text-sm font-normal text-slate-900">
                                    {option}
                                </Label>
                            </div>
                        ))}
                    </RadioGroup>
                </div>

                <DialogFooter className="gap-2 sm:justify-between">
                    <Button
                        variant="outline"
                        onClick={() => onConfirm(reason)}
                        disabled={!reason || isSaving}
                        isLoading={isSaving}
                    >
                        Turn it off
                    </Button>
                    <Button onClick={close} autoFocus>
                        Keep it on
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
