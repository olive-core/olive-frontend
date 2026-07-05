import { useRef, useState } from "react";
import { ImageUpIcon, Loader2Icon, XIcon } from "lucide-react";
import toast from "react-hot-toast";

import api from "@/lib/axios";
import { handleError } from "@/lib/utils";
import { headerConfigFromApi } from "@/lib/header-config";
import { useHeaderConfigStore } from "@/stores/header-config-store";
import { Button } from "@/components/ui/button";
import { ControlSection } from "./control-primitives";

// Uploads the center logo to GCS via the clinician header-logo endpoint. Uploads persist
// immediately (the returned signed URL is stored on the config); the rest of the letterhead
// is saved with the page's Save button.
export default function LogoUploadControl({ userId }: { userId: string }) {
    const logoUrl = useHeaderConfigStore((state) => state.config.logoUrl);
    const showLogo = useHeaderConfigStore((state) => state.config.showLogo);
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
        <ControlSection title="Center logo" description="PNG or JPG, up to 2 MB.">
            <div className="flex items-center gap-4">
                <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-slate-50">
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
        </ControlSection>
    );
}
