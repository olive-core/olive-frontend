import { useRef, useState } from "react";
import { ImageIcon, ImageUpIcon, Loader2Icon, XIcon } from "lucide-react";
import toast from "react-hot-toast";

import api from "@/lib/axios";
import { cn, handleError } from "@/lib/utils";
import { clampLogoSize, headerConfigFromApi, MAX_LOGO_SIZE, MIN_LOGO_SIZE, type LogoShape } from "@/lib/header-config";
import { useHeaderConfigStore } from "@/stores/header-config-store";
import { Button } from "@/components/ui/button";
import { controlId } from "../focus-field";
import { ControlSection } from "./control-primitives";

const LOGO_SHAPES: { value: LogoShape; label: string; frameClass: string }[] = [
    { value: "circle",  label: "Circle",  frameClass: "rounded-full" },
    { value: "rounded", label: "Rounded", frameClass: "rounded-md" },
    { value: "square",  label: "Square",  frameClass: "rounded-none" },
];

function ShapePicker({ value, onChange }: { value: LogoShape; onChange: (shape: LogoShape) => void }) {
    return (
        <div className="flex items-center gap-1.5">
            {LOGO_SHAPES.map((shape) => (
                <button
                    key={shape.value}
                    type="button"
                    title={shape.label}
                    aria-label={`${shape.label} logo frame`}
                    onClick={() => onChange(shape.value)}
                    className={cn(
                        "flex size-9 items-center justify-center rounded-lg border transition-colors",
                        value === shape.value
                            ? "border-emerald-500 bg-emerald-50/60 ring-1 ring-emerald-500/30"
                            : "border-slate-200 hover:border-slate-300",
                    )}
                >
                    <span className={cn("size-5 border-[1.5px] border-slate-400", shape.frameClass)} />
                </button>
            ))}
        </div>
    );
}

// Uploads the center logo to GCS via the clinician header-logo endpoint. Uploads persist
// immediately (the returned signed URL is stored on the config); the rest of the letterhead
// is saved with the page's Save button.
export default function LogoUploadControl({ userId }: { userId: string }) {
    const logoUrl = useHeaderConfigStore((state) => state.config.logoUrl);
    const showLogo = useHeaderConfigStore((state) => state.config.showLogo);
    const logoSize = useHeaderConfigStore((state) => state.config.logoSize);
    const logoShape = useHeaderConfigStore((state) => state.config.logoShape);
    const patch = useHeaderConfigStore((state) => state.patch);

    const inputRef = useRef<HTMLInputElement>(null);
    const [isBusy, setIsBusy] = useState(false);

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
            const response = await api.post(`/clinician/${userId}/header-logo`, formData);
            const config = headerConfigFromApi(response.data.header_config);
            patch({ logoBlobName: config.logoBlobName, logoUrl: config.logoUrl });
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
            await api.delete(`/clinician/${userId}/header-logo`);
            patch({ logoBlobName: null, logoUrl: null });
            toast.success("Logo removed");
        } catch (error) {
            handleError(error, "Failed to remove logo");
        } finally {
            setIsBusy(false);
        }
    };

    return (
        <ControlSection title="Center logo" description="PNG or JPG, up to 2 MB." icon={ImageIcon}>
            <div className="flex items-center gap-4">
                <div
                    className={cn(
                        "flex size-20 shrink-0 items-center justify-center overflow-hidden border bg-slate-50 p-1",
                        LOGO_SHAPES.find((shape) => shape.value === logoShape)?.frameClass,
                    )}
                >
                    {logoUrl
                        ? <img src={logoUrl} alt="Center logo" className="h-full w-full object-contain" />
                        : <ImageUpIcon className="size-6 text-slate-300" />}
                </div>

                <div className="flex flex-col items-start gap-2">
                    <input ref={inputRef} type="file" accept="image/*" hidden onChange={(event) => handleFile(event.target.files?.[0])} />
                    <Button type="button" variant="outline" size="sm" disabled={isBusy} onClick={() => inputRef.current?.click()}>
                        {isBusy ? <Loader2Icon className="size-4 animate-spin" /> : <ImageUpIcon className="size-4" />}
                        {logoUrl ? "Replace logo" : "Upload logo"}
                    </Button>
                    {logoUrl && (
                        <Button type="button" variant="ghost" size="sm" disabled={isBusy} className="text-slate-500" onClick={handleRemove}>
                            <XIcon className="size-4" />
                            Remove
                        </Button>
                    )}
                    {!showLogo && <p className="text-xs text-amber-600">Logo is hidden — enable "Show center logo" above.</p>}
                </div>
            </div>

            {logoUrl && (
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-col gap-1.5">
                        <span className="text-xs font-medium text-slate-500">Frame</span>
                        <ShapePicker value={logoShape} onChange={(shape) => patch({ logoShape: shape })} />
                    </div>

                    <label className="flex min-w-48 flex-1 flex-col gap-1.5">
                        <span className="text-xs font-medium text-slate-500">Size</span>
                        <span className="flex items-center gap-3">
                            <input
                                id={controlId("logo")}
                                type="range"
                                min={MIN_LOGO_SIZE}
                                max={MAX_LOGO_SIZE}
                                step={2}
                                value={logoSize}
                                onChange={(event) => patch({ logoSize: clampLogoSize(Number(event.target.value)) })}
                                className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-slate-200 accent-emerald-500"
                            />
                            <span className="w-12 text-right text-xs tabular-nums text-slate-400">{logoSize}px</span>
                        </span>
                    </label>
                </div>
            )}
        </ControlSection>
    );
}
