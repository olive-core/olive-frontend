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
import ChamberControls from "./controls/chamber-controls";
import CustomFieldsControls from "./controls/custom-fields-controls";
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
        <div className="container mx-auto max-w-6xl px-4 py-6">
            <div className="mb-6 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate({ to: "/doctor/profile" })}
                        className="cursor-pointer rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100"
                        aria-label="Back to profile"
                    >
                        <ArrowLeftIcon className="size-4" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">Prescription header</h1>
                        <p className="mt-0.5 text-xs text-slate-400">Design the letterhead printed on every prescription.</p>
                    </div>
                </div>

                <Button onClick={handleSave} isLoading={isSaving} className="px-6 font-bold shadow-sm">
                    <SaveIcon className="size-4" />
                    Save changes
                </Button>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_minmax(0,520px)] lg:items-start">
                <div className="order-1 lg:sticky lg:top-24 lg:order-2">
                    <HeaderLivePreview />
                </div>

                <div className="order-2 flex flex-col gap-4 lg:order-1">
                    <LayoutStyleControls />
                    <DoctorControls />
                    <LogoUploadControl userId={userId} />
                    <ChamberControls />
                    <CustomFieldsControls />
                </div>
            </div>
        </div>
    );
}
