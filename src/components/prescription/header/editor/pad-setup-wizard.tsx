import { useState } from "react";
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon } from "lucide-react";

import { chamberLabel } from "@/types/attendant-queue";
import { useAuthStore } from "@/stores/auth-store";
import { useHeaderConfigStore } from "@/stores/header-config-store";
import { Button } from "@/components/ui/button";
import NewChamberForm from "@/components/dashboard/chambers/new-chamber-form";
import ChamberPaperFields from "../../chamber-paper-fields";
import DoctorControls from "./controls/doctor-controls";
import WizardFrame from "./wizard-frame";
import { setupStages, type SetupStage } from "./pad-setup-stages";

// The first-run path. A doctor's very first question about a prescription pad is which
// place they are printing at, and their second is what paper goes into that printer — and
// the second answer decides whether Olive draws a letterhead at all. Asking them in that
// order is what removes the old dead end, where the paper choice was hidden inside a
// chamber the doctor had not been told to create.

interface PadSetupWizardProps {
    isSaving: boolean;
    onSave:   () => Promise<void>;
    onFinish: () => void;
}

export default function PadSetupWizard({ isSaving, onSave, onFinish }: PadSetupWizardProps) {
    const clinicianId = useAuthStore((state) => state.userId);
    const addChamber = useHeaderConfigStore((state) => state.addChamber);
    const patchPad = useHeaderConfigStore((state) => state.patchPad);
    const [chamberId, setChamberId] = useState<string | null>(null);
    const [stage, setStage] = useState<SetupStage>("place");
    const [isFinishing, setIsFinishing] = useState(false);

    const chamber = useHeaderConfigStore((state) =>
        state.chambers.find((candidate) => candidate.chamber_id === chamberId) ?? null,
    );
    const pad = useHeaderConfigStore((state) => (chamberId ? state.pads[chamberId] : undefined));

    const stages = setupStages(pad?.paper);
    const stepIndex = Math.max(stages.indexOf(stage), 0);
    const currentStage = stages[stepIndex];
    const isLastStage = stepIndex === stages.length - 1;

    const finish = async () => {
        setIsFinishing(true);
        await onSave();
        onFinish();
    };

    const frameProps = {
        stepNumber: stepIndex + 1,
        stepCount:  stages.length,
        onSkip:     onFinish,
    };

    const stepControls = (
        <>
            <Button variant="outline" onClick={() => setStage(stages[stepIndex - 1])}>
                <ArrowLeftIcon className="size-4" />
                Back
            </Button>
            {isLastStage ? (
                <Button className="flex-1 font-bold" isLoading={isSaving || isFinishing} onClick={finish}>
                    <CheckIcon className="size-4" />
                    Save my pad
                </Button>
            ) : (
                <Button className="flex-1 font-bold" onClick={() => setStage(stages[stepIndex + 1])}>
                    Continue
                    <ArrowRightIcon className="size-4" />
                </Button>
            )}
        </>
    );

    if (currentStage === "place" || !chamberId || !pad) {
        return (
            <WizardFrame
                {...frameProps}
                title="Where do you write prescriptions?"
                description="Your chamber — a hospital, a diagnostic centre, or your own place. You can add more later."
            >
                {clinicianId && (
                    <NewChamberForm
                        clinicianId={clinicianId}
                        title=""
                        submitLabel="Continue"
                        onCreated={(created) => {
                            addChamber(created);
                            setChamberId(created.chamber_id);
                            setStage("paper");
                        }}
                    />
                )}
            </WizardFrame>
        );
    }

    if (currentStage === "paper") {
        return (
            <WizardFrame
                {...frameProps}
                title="What paper goes into your printer?"
                description={`At ${chamber ? chamberLabel(chamber) : "this chamber"}.`}
                footer={stepControls}
            >
                <ChamberPaperFields paper={pad.paper} onChange={(paper) => patchPad(chamberId, { paper })} />
            </WizardFrame>
        );
    }

    return (
        <WizardFrame
            {...frameProps}
            title="How should your name appear?"
            description="This prints at the top of every prescription."
            footer={stepControls}
        >
            <DoctorControls />
        </WizardFrame>
    );
}
