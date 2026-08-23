import type { ReactNode } from "react";

import { useHeaderConfigStore, type PadSectionId } from "@/stores/header-config-store";
import { Accordion } from "@/components/ui/accordion";
import PadSection from "./pad-section";
import {
    DOCTOR_SECTION,
    FOOTER_SECTION,
    STYLE_SECTION,
    doctorDetailsAreComplete,
    doctorSectionSummary,
    footerSectionSummary,
    styleSectionSummary,
} from "./pad-sections";
import { usePrintsOliveLetterhead } from "./letterhead-scope";
import ChamberSection from "./controls/chamber-section";
import AddChamberControl from "./controls/add-chamber-control";
import DoctorControls from "./controls/doctor-controls";
import LayoutStyleControls from "./controls/layout-style-controls";
import FooterControls from "./controls/footer-controls";

function GroupLabel({ children }: { children: ReactNode }) {
    return <p className="mt-2 px-1 text-xs font-semibold uppercase tracking-wide text-slate-400">{children}</p>;
}

function DoctorSection() {
    const identity = useHeaderConfigStore((state) => state.identity);
    const designation = useHeaderConfigStore((state) => state.config.designation);

    return (
        <PadSection
            {...DOCTOR_SECTION}
            summary={doctorSectionSummary(identity, designation)}
            needsAttention={!doctorDetailsAreComplete(identity, designation)}
        >
            <DoctorControls />
        </PadSection>
    );
}

function StyleSection() {
    const config = useHeaderConfigStore((state) => state.config);

    return (
        <PadSection {...STYLE_SECTION} summary={styleSectionSummary(config)}>
            <LayoutStyleControls />
        </PadSection>
    );
}

function FooterSection() {
    const pads = useHeaderConfigStore((state) => state.pads);

    return (
        <PadSection {...FOOTER_SECTION} summary={footerSectionSummary(Object.values(pads))}>
            <FooterControls />
        </PadSection>
    );
}

// The whole editor as one flat, readable list: the doctor's places first — each with its
// own pad — then what prints on all of them. One section is open at a time, and the
// letterhead sections disappear entirely for a doctor whose every chamber runs on
// pre-printed stationery, because none of it would reach paper.
export default function PadSectionList() {
    const chambers = useHeaderConfigStore((state) => state.chambers);
    const openSectionId = useHeaderConfigStore((state) => state.openSectionId);
    const setOpenSection = useHeaderConfigStore((state) => state.setOpenSection);
    const printsLetterhead = usePrintsOliveLetterhead();

    return (
        <Accordion
            type="single"
            collapsible
            value={openSectionId ?? ""}
            onValueChange={(value) => setOpenSection((value || null) as PadSectionId | null)}
            className="flex flex-col gap-2"
        >
            <GroupLabel>Where you practise</GroupLabel>
            {chambers.length === 0 && (
                <p className="px-1 text-xs text-slate-400">
                    Add the places you sit. Each one gets its own pad, and prescriptions print on the
                    pad of wherever you are.
                </p>
            )}
            {chambers.map((chamber) => (
                <ChamberSection key={chamber.chamber_id} chamber={chamber} />
            ))}
            <AddChamberControl />

            {printsLetterhead && (
                <>
                    <GroupLabel>What prints on every pad</GroupLabel>
                    <DoctorSection />
                    <StyleSection />
                    <FooterSection />
                </>
            )}
        </Accordion>
    );
}
