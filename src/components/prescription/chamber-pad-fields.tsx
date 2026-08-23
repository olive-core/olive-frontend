import { useRef, useState } from "react";
import { ImageUpIcon, Loader2Icon, XIcon } from "lucide-react";
import toast from "react-hot-toast";

import api from "@/lib/axios";
import { handleError } from "@/lib/utils";
import { newContactLine } from "@/lib/header-config";
import { padFromApi, type ChamberPad, type PadConfigApi } from "@/lib/chamber-pad";
import { Button } from "@/components/ui/button";
import ContactLinesEditor from "./header/editor/controls/contact-lines-editor";
import { FieldGroup, LabeledInput } from "./header/editor/controls/control-primitives";
import ChamberPaperFields from "./chamber-paper-fields";
import { isPrePrinted } from "@/lib/print-paper";

// Everything a doctor sets for one chamber's pad, in the order the questions actually
// depend on each other: the paper first (it decides whether Olive draws a letterhead at
// all), then what that letterhead says. Fully controlled, so the editor's Zustand store
// and plain local state can both drive it — both write the same `pad_config`.

interface ChamberPadLogoControlProps {
    chamberId:    string;
    chamberLabel: string;
    logoUrl:      string | null;
    onChange:     (fields: Pick<ChamberPad, "logoBlobName" | "logoUrl">) => void;
}

export function ChamberPadLogoControl({ chamberId, chamberLabel, logoUrl, onChange }: ChamberPadLogoControlProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isBusy, setIsBusy] = useState(false);

    const syncLogo = (padConfig?: PadConfigApi | null) => {
        const fresh = padFromApi(padConfig);
        onChange({ logoBlobName: fresh.logoBlobName, logoUrl: fresh.logoUrl });
    };

    const handleFile = async (file?: File) => {
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            toast.error("Please choose an image file");
            return;
        }
        setIsBusy(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            const response = await api.post(`/chamber/${chamberId}/pad-logo`, formData);
            syncLogo(response.data.pad_config);
            toast.success("Logo uploaded");
        } catch (error) {
            handleError(error, "Failed to upload logo");
        } finally {
            setIsBusy(false);
            if (inputRef.current) inputRef.current.value = "";
        }
    };

    const handleRemove = async () => {
        setIsBusy(true);
        try {
            await api.delete(`/chamber/${chamberId}/pad-logo`);
            onChange({ logoBlobName: null, logoUrl: null });
            toast.success("Logo removed");
        } catch (error) {
            handleError(error, "Failed to remove logo");
        } finally {
            setIsBusy(false);
        }
    };

    return (
        <div className="flex items-center gap-3">
            <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-slate-50 p-1">
                {logoUrl
                    ? <img src={logoUrl} alt={`${chamberLabel} logo`} className="h-full w-full object-contain" />
                    : <ImageUpIcon className="size-5 text-slate-300" />}
            </div>
            <div className="flex flex-col items-start gap-1.5">
                <input ref={inputRef} type="file" accept="image/*" hidden onChange={(event) => handleFile(event.target.files?.[0])} />
                <Button type="button" variant="outline" size="sm" className="min-h-11 sm:min-h-8" disabled={isBusy} onClick={() => inputRef.current?.click()}>
                    {isBusy ? <Loader2Icon className="size-4 animate-spin" /> : <ImageUpIcon className="size-4" />}
                    {logoUrl ? "Replace logo" : "Upload logo"}
                </Button>
                {logoUrl && (
                    <Button type="button" variant="ghost" size="sm" disabled={isBusy} className="min-h-11 text-slate-500 sm:min-h-8" onClick={handleRemove}>
                        <XIcon className="size-4" />
                        Remove
                    </Button>
                )}
            </div>
        </div>
    );
}

interface ChamberPadFieldsProps {
    chamberId:    string;
    chamberLabel: string;
    pad:          ChamberPad;
    onChange:     (patch: Partial<ChamberPad>) => void;
    nameFieldId?: string;
    /**
     * False when none of the doctor's chambers print Olive's letterhead. A logo and
     * contact lines then reach paper nowhere — not on this pad's header, not in another
     * chamber's footer — so they are not offered. The name stays: it labels the chamber
     * throughout Olive, printed or not.
     */
    printsLetterhead?: boolean;
}

export default function ChamberPadFields({
    chamberId,
    chamberLabel,
    pad,
    onChange,
    nameFieldId,
    printsLetterhead = true,
}: ChamberPadFieldsProps) {
    return (
        <div className="flex flex-col gap-5">
            <FieldGroup label="What paper do you print on?">
                <ChamberPaperFields
                    paper={pad.paper}
                    printsLetterhead={printsLetterhead}
                    onChange={(paper) => onChange({ paper })}
                />
            </FieldGroup>

            <FieldGroup
                label={isPrePrinted(pad.paper) ? "Details of this chamber" : "What prints at the top"}
                hint={isPrePrinted(pad.paper)
                    ? "Not printed here — your own pad already carries them. They appear in the footer of your other chambers' pads."
                    : "The chamber block beside your name on every prescription written here."}
            >
                <LabeledInput
                    id={nameFieldId}
                    label="Name on the pad"
                    value={pad.displayName}
                    onChange={(displayName) => onChange({ displayName })}
                    placeholder={chamberLabel}
                />
                {printsLetterhead && (
                    <>
                        <ChamberPadLogoControl
                            chamberId={chamberId}
                            chamberLabel={chamberLabel}
                            logoUrl={pad.logoUrl}
                            onChange={onChange}
                        />
                        <ContactLinesEditor
                            lines={pad.contactLines}
                            onAdd={(kind) => onChange({ contactLines: [...pad.contactLines, newContactLine(kind)] })}
                            onUpdate={(lineId, changes) => onChange({
                                contactLines: pad.contactLines.map((line) => (line.id === lineId ? { ...line, ...changes } : line)),
                            })}
                            onRemove={(lineId) => onChange({ contactLines: pad.contactLines.filter((line) => line.id !== lineId) })}
                            onReorder={(lines) => onChange({ contactLines: lines })}
                        />
                    </>
                )}
            </FieldGroup>
        </div>
    );
}
