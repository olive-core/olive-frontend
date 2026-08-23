import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeftIcon, SaveIcon } from "lucide-react";

import api from "@/lib/axios";
import { handleError } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
    buildHeaderUpdatePayload,
    clinicianStyleConfig,
    type ClinicianHeaderUpdate,
    type HeaderConfigApi,
} from "@/lib/header-config";
import { padToApi } from "@/lib/chamber-pad";
import { listChambers } from "@/lib/attendant-queue";
import { useHeaderConfigStore } from "@/stores/header-config-store";
import { Button } from "@/components/ui/button";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import HeaderLivePreview from "./header-live-preview";
import PadPreviewSheet from "./preview-sheet";
import PadSectionList from "./pad-section-list";
import PadSetupWizard from "./pad-setup-wizard";
import { sectionForFocusKey } from "./pad-sections";
import { focusField, registerFocusResolver } from "./focus-field";

export interface HeaderEditorProfile {
    name?:            string | null;
    qualification?:   string | null;
    specializations?: string[] | null;
    bmdc_no?:         string | null;
    header_config?:   HeaderConfigApi | null;
}

interface HeaderEditorProps {
    initialProfile: HeaderEditorProfile;
    isSaving:       boolean;
    onSave:         (payload: ClinicianHeaderUpdate) => void;
}

// The two-pane layout needs real width. Below it the page stacks, and only a phone gives
// the preview up to a sheet — the same definition the prescription editor uses, because a
// phone turned sideways has the width for a preview and nowhere near the height. A window
// between the two keeps the paper in view above the form.
const WIDE_EDITOR_VIEWPORT = "(min-width: 1024px)";
const PHONE_EDITOR_VIEWPORT = "(max-width: 767px), (max-height: 500px)";

// A doctor with no chambers has never set a pad up, so they are walked through it rather
// than dropped into the full editor. The decision is taken once, when the chambers first
// load, because step one creates a chamber and would otherwise end the flow it starts.
function useFirstRunSetup(chamberCount: number | undefined): { isGuided: boolean; finish: () => void } {
    const [isGuided, setIsGuided] = useState(false);
    const decided = useRef(false);

    useEffect(() => {
        if (decided.current || chamberCount === undefined) return;
        decided.current = true;
        setIsGuided(chamberCount === 0);
    }, [chamberCount]);

    return { isGuided, finish: () => setIsGuided(false) };
}

function EditorHeading() {
    const navigate = useNavigate();

    return (
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
                <p className="text-[11px] text-slate-400">What prints on the paper you hand a patient.</p>
            </div>
        </div>
    );
}

function SaveButton({ isSaving, onSave, className }: { isSaving: boolean; onSave: () => void; className?: string }) {
    return (
        <Button onClick={onSave} isLoading={isSaving} className={className}>
            <SaveIcon className="size-4" />
            Save
        </Button>
    );
}

function WideEditor({ isSaving, onSave }: { isSaving: boolean; onSave: () => void }) {
    return (
        <div className="mx-auto w-full max-w-[1400px] px-4 pb-24">
            <div className="sticky top-0 z-30 -mx-4 flex items-center justify-between gap-3 border-b bg-white/95 px-4 py-2.5 backdrop-blur">
                <EditorHeading />
                <SaveButton isSaving={isSaving} onSave={onSave} className="px-5 font-bold shadow-sm" />
            </div>
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
                    <PadSectionList />
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    );
}

function StackedEditor({ isPhone, isSaving, onSave }: {
    isPhone:  boolean;
    isSaving: boolean;
    onSave:   () => void;
}) {
    return (
        <div className="mx-auto w-full max-w-[860px] px-4 pb-32">
            <div className="-mx-4 flex items-center border-b bg-white px-4 py-2.5">
                <EditorHeading />
            </div>
            {!isPhone && (
                <div className="mt-3">
                    <HeaderLivePreview />
                </div>
            )}
            <div className="mt-3">
                <PadSectionList />
            </div>

            {/* The navbar owns the top of the screen, so the things a doctor always needs —
                seeing the paper and keeping their work — live in their own bottom bar,
                reachable even mid-form with the keyboard open. */}
            <div
                className="fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t bg-white/95 px-4 pt-3 backdrop-blur"
                style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
            >
                {isPhone && <PadPreviewSheet />}
                <SaveButton isSaving={isSaving} onSave={onSave} className="flex-1 font-bold shadow-sm" />
            </div>
        </div>
    );
}

export default function HeaderEditor({ initialProfile, isSaving, onSave }: HeaderEditorProps) {
    const queryClient = useQueryClient();
    const isWide = useMediaQuery(WIDE_EDITOR_VIEWPORT);
    const isPhone = useMediaQuery(PHONE_EDITOR_VIEWPORT);
    const hydrate = useHeaderConfigStore((state) => state.hydrate);
    const hydratePads = useHeaderConfigStore((state) => state.hydratePads);
    const reset = useHeaderConfigStore((state) => state.reset);
    const initialized = useRef(false);

    const chambersQuery = useQuery({ queryKey: ["chambers"], queryFn: listChambers });
    const firstRun = useFirstRunSetup(chambersQuery.data?.length);

    // Populate the store from the loaded profile once, then reset on unmount so the
    // letterhead never bleeds into another page. Designation and the profile's
    // specializations are the same field: profiles from before that merge get their
    // specializations offered as the designation, and every save re-syncs both.
    useEffect(() => {
        if (initialized.current) return;
        const config = clinicianStyleConfig(initialProfile.header_config);
        if (!config.designation.trim()) {
            config.designation = (initialProfile.specializations ?? []).join(", ");
        }
        hydrate(
            {
                name:          initialProfile.name ?? "",
                qualification: initialProfile.qualification ?? "",
                bmdcNo:        initialProfile.bmdc_no ?? "",
            },
            config,
        );
        initialized.current = true;
    }, [initialProfile, hydrate]);

    // Pads hydrate whenever the chambers query resolves; unsaved edits survive refetches.
    useEffect(() => {
        if (chambersQuery.data) hydratePads(chambersQuery.data);
    }, [chambersQuery.data, hydratePads]);

    useEffect(() => reset, [reset]);

    // Click-to-edit from the preview: open the section hosting the control, then focus it
    // once the accordion has finished expanding.
    useEffect(() => {
        return registerFocusResolver((key) => {
            const state = useHeaderConfigStore.getState();
            const { section, targetKey } = sectionForFocusKey(key, state.previewChamberId);
            state.setOpenSection(section);
            window.setTimeout(() => focusField(targetKey), 260);
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

    if (firstRun.isGuided) {
        return <PadSetupWizard isSaving={isSaving} onSave={handleSave} onFinish={firstRun.finish} />;
    }

    return isWide
        ? <WideEditor isSaving={isSaving} onSave={handleSave} />
        : <StackedEditor isPhone={isPhone} isSaving={isSaving} onSave={handleSave} />;
}
