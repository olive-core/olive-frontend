import { useEffect, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeftIcon, SaveIcon } from "lucide-react";

import {
    buildHeaderUpdatePayload,
    headerConfigFromApi,
    type ClinicianHeaderUpdate,
    type HeaderConfigApi,
} from "@/lib/header-config";
import { useHeaderConfigStore } from "@/stores/header-config-store";
import { Button } from "@/components/ui/button";
import LayoutStyleControls from "./controls/layout-style-controls";
import DoctorControls from "./controls/doctor-controls";
import LogoUploadControl from "./controls/logo-upload-control";
import ContactLinesControls from "./controls/contact-lines-controls";
import HeaderLivePreview from "./header-live-preview";

export interface HeaderEditorProfile {
    first_name?:    string | null;
    last_name?:     string | null;
    qualification?: string | null;
    bmdc_no?:       string | null;
    header_config?: HeaderConfigApi | null;
}

interface HeaderEditorProps {
    userId:         string;
    initialProfile: HeaderEditorProfile;
    isSaving:       boolean;
    onSave:         (payload: ClinicianHeaderUpdate) => void;
}

export default function HeaderEditor({ userId, initialProfile, isSaving, onSave }: HeaderEditorProps) {
    const navigate = useNavigate();
    const hydrate = useHeaderConfigStore((state) => state.hydrate);
    const reset = useHeaderConfigStore((state) => state.reset);
    const initialized = useRef(false);

    // Populate the store from the loaded profile once, then reset on unmount so the
    // letterhead never bleeds into another page.
    useEffect(() => {
        if (initialized.current) return;
        hydrate(
            {
                firstName:     initialProfile.first_name ?? "",
                lastName:      initialProfile.last_name ?? "",
                qualification: initialProfile.qualification ?? "",
                bmdcNo:        initialProfile.bmdc_no ?? "",
            },
            headerConfigFromApi(initialProfile.header_config),
        );
        initialized.current = true;
    }, [initialProfile, hydrate]);

    useEffect(() => reset, [reset]);

    const handleSave = () => {
        const { identity, config } = useHeaderConfigStore.getState();
        onSave(buildHeaderUpdatePayload(identity, config));
    };

    return (
        <div className="mx-auto max-w-[860px] px-4 pb-24">
            <div className="sticky top-0 z-30 -mx-4 flex items-center justify-between gap-3 border-b bg-white/95 px-4 py-2.5 backdrop-blur">
                <div className="flex items-center gap-2.5">
                    <button
                        onClick={() => navigate({ to: "/doctor/profile" })}
                        className="cursor-pointer rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100"
                        aria-label="Back to profile"
                    >
                        <ArrowLeftIcon className="size-4" />
                    </button>
                    <div>
                        <h1 className="text-base font-bold leading-tight text-slate-900">Prescription header</h1>
                        <p className="text-[11px] text-slate-400">The letterhead printed on every prescription.</p>
                    </div>
                </div>

                <Button onClick={handleSave} isLoading={isSaving} className="px-5 font-bold shadow-sm">
                    <SaveIcon className="size-4" />
                    Save
                </Button>
            </div>

            <div data-sticky-preview className="sticky top-[53px] z-20 -mx-4 bg-gradient-to-b from-slate-50 via-slate-50 to-slate-50/0 px-4 pb-4 pt-3">
                <HeaderLivePreview />
            </div>

            <div className="mt-2 flex flex-col gap-3">
                <LayoutStyleControls />
                <DoctorControls />
                <LogoUploadControl userId={userId} />
                <ContactLinesControls />
            </div>
        </div>
    );
}
