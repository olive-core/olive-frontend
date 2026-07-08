import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeftIcon, SaveIcon } from "lucide-react";

import api from "@/lib/axios";
import { handleError } from "@/lib/utils";
import {
    buildHeaderUpdatePayload,
    clinicianStyleConfig,
    type ClinicianHeaderUpdate,
    type HeaderConfigApi,
} from "@/lib/header-config";
import { padToApi } from "@/lib/chamber-pad";
import { listChambers } from "@/lib/attendant-queue";
import { useHeaderConfigStore, type EditorTab } from "@/stores/header-config-store";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import LayoutStyleControls from "./controls/layout-style-controls";
import DoctorControls from "./controls/doctor-controls";
import ChambersTab from "./controls/chambers-tab";
import FooterTab from "./controls/footer-tab";
import HeaderLivePreview from "./header-live-preview";
import { focusField, registerFocusResolver } from "./focus-field";

export interface HeaderEditorProfile {
    first_name?:    string | null;
    last_name?:     string | null;
    qualification?: string | null;
    bmdc_no?:       string | null;
    header_config?: HeaderConfigApi | null;
}

interface HeaderEditorProps {
    initialProfile: HeaderEditorProfile;
    isSaving:       boolean;
    onSave:         (payload: ClinicianHeaderUpdate) => void;
}

// The two-pane layout needs real width; below this the editor stacks (preview pinned on
// top, controls below) exactly like the previous single-column editor.
function useIsWide(): boolean {
    const [isWide, setIsWide] = useState(
        () => typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches,
    );
    useEffect(() => {
        const query = window.matchMedia("(min-width: 1024px)");
        const onChange = () => setIsWide(query.matches);
        query.addEventListener("change", onChange);
        return () => query.removeEventListener("change", onChange);
    }, []);
    return isWide;
}

// Maps a preview focus key to the tab (and accordion pad) that hosts its control, so
// click-to-edit works across the tabbed layout. Chamber/contact regions only ever render
// when a chamber's pad has content, so they always belong to that chamber's editor.
function resolveFocusTarget(key: string, previewChamberId: string | null): {
    tab: EditorTab;
    targetKey: string;
    openPadId?: string | null;
} {
    if (key.startsWith("footer-chamber-")) {
        return { tab: "footer", targetKey: key };
    }
    if ((key === "chamberName" || key.startsWith("contact-")) && previewChamberId) {
        return {
            tab: "chambers",
            openPadId: previewChamberId,
            targetKey: key === "chamberName" ? `pad-${previewChamberId}-name` : key,
        };
    }
    if (key === "medicalSymbol" || key === "logo") {
        return { tab: "style", targetKey: key };
    }
    // firstName, nameBn, qualification, designation, bmdcNo
    return { tab: "doctor", targetKey: key };
}

function ControlTabs() {
    const activeTab = useHeaderConfigStore((state) => state.activeTab);
    const setActiveTab = useHeaderConfigStore((state) => state.setActiveTab);

    return (
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as EditorTab)}>
            <TabsList className="w-full">
                <TabsTrigger value="style">Style</TabsTrigger>
                <TabsTrigger value="doctor">Doctor</TabsTrigger>
                <TabsTrigger value="chambers">Chambers</TabsTrigger>
                <TabsTrigger value="footer">Footer</TabsTrigger>
            </TabsList>
            <TabsContent value="style" className="mt-2.5 flex flex-col gap-3">
                <LayoutStyleControls />
            </TabsContent>
            <TabsContent value="doctor" className="mt-2.5 flex flex-col gap-3">
                <DoctorControls />
            </TabsContent>
            <TabsContent value="chambers" className="mt-2.5">
                <ChambersTab />
            </TabsContent>
            <TabsContent value="footer" className="mt-2.5">
                <FooterTab />
            </TabsContent>
        </Tabs>
    );
}

export default function HeaderEditor({ initialProfile, isSaving, onSave }: HeaderEditorProps) {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const isWide = useIsWide();
    const hydrate = useHeaderConfigStore((state) => state.hydrate);
    const hydratePads = useHeaderConfigStore((state) => state.hydratePads);
    const reset = useHeaderConfigStore((state) => state.reset);
    const dirtyPadCount = useHeaderConfigStore((state) => state.dirtyPadIds.length);
    const initialized = useRef(false);

    const chambersQuery = useQuery({ queryKey: ["chambers"], queryFn: listChambers });

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
            clinicianStyleConfig(initialProfile.header_config),
        );
        initialized.current = true;
    }, [initialProfile, hydrate]);

    // Pads hydrate whenever the chambers query resolves; unsaved edits survive refetches.
    useEffect(() => {
        if (chambersQuery.data) hydratePads(chambersQuery.data);
    }, [chambersQuery.data, hydratePads]);

    useEffect(() => reset, [reset]);

    // Click-to-edit across tabs: switch to the hosting tab (and open the right chamber
    // accordion), then focus once the control has mounted.
    useEffect(() => {
        return registerFocusResolver((key) => {
            const state = useHeaderConfigStore.getState();
            const { tab, targetKey, openPadId } = resolveFocusTarget(key, state.previewChamberId);
            state.setActiveTab(tab);
            if (openPadId !== undefined) state.setOpenPadId(openPadId);
            window.setTimeout(() => focusField(targetKey), openPadId !== undefined ? 260 : 60);
        });
    }, []);

    const handleSave = async () => {
        const { identity, config, pads, dirtyPadIds, markPadsClean } = useHeaderConfigStore.getState();

        // Chamber pads save directly; the clinician part goes through the route's
        // mutation (which owns the toast + cache invalidation for the profile).
        const savedPadIds: string[] = [];
        await Promise.all(
            dirtyPadIds.map(async (chamberId) => {
                try {
                    await api.put(`/chamber/${chamberId}`, { pad_config: padToApi(pads[chamberId]) });
                    savedPadIds.push(chamberId);
                } catch (error) {
                    handleError(error, "Could not save a chamber pad");
                }
            }),
        );
        if (savedPadIds.length > 0) {
            markPadsClean(savedPadIds);
            queryClient.invalidateQueries({ queryKey: ["chambers"] });
        }

        onSave(buildHeaderUpdatePayload(identity, config));
    };

    const topBar = (
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
                    <h1 className="text-base font-bold leading-tight text-slate-900">Prescription pad</h1>
                    <p className="text-[11px] text-slate-400">Header, footer and every chamber's pad.</p>
                </div>
            </div>

            <Button onClick={handleSave} isLoading={isSaving} className="px-5 font-bold shadow-sm">
                <SaveIcon className="size-4" />
                Save{dirtyPadCount > 0 ? ` (${dirtyPadCount + 1})` : ""}
            </Button>
        </div>
    );

    if (isWide) {
        return (
            <div className="mx-auto max-w-[1400px] px-4 pb-24">
                {topBar}
                <ResizablePanelGroup
                    direction="horizontal"
                    autoSaveId="rx-header-editor-panes"
                    className="mt-3 !h-auto items-stretch"
                >
                    <ResizablePanel defaultSize={58} minSize={35} className="pr-3">
                        <div data-sticky-preview className="sticky top-[61px]">
                            <HeaderLivePreview />
                        </div>
                    </ResizablePanel>
                    <ResizableHandle withHandle />
                    <ResizablePanel defaultSize={42} minSize={28} className="pl-3">
                        <ControlTabs />
                    </ResizablePanel>
                </ResizablePanelGroup>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-[860px] px-4 pb-24">
            {topBar}
            <div data-sticky-preview className="sticky top-[53px] z-20 -mx-4 bg-gradient-to-b from-slate-50 via-slate-50 to-slate-50/0 px-4 pb-4 pt-3">
                <HeaderLivePreview />
            </div>
            <div className="mt-2">
                <ControlTabs />
            </div>
        </div>
    );
}
