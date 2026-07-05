import { useHeaderConfigStore } from "@/stores/header-config-store";
import { ControlSection, LabeledInput } from "./control-primitives";

export default function DoctorControls() {
    const identity = useHeaderConfigStore((state) => state.identity);
    const setIdentity = useHeaderConfigStore((state) => state.setIdentity);
    const designation = useHeaderConfigStore((state) => state.config.designation);
    const patch = useHeaderConfigStore((state) => state.patch);

    return (
        <ControlSection title="Doctor" description="Shown at the top of every prescription.">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <LabeledInput label="First name" value={identity.firstName} onChange={(firstName) => setIdentity({ firstName })} placeholder="Ahsan" />
                <LabeledInput label="Last name" value={identity.lastName} onChange={(lastName) => setIdentity({ lastName })} placeholder="Habib" />
            </div>
            <LabeledInput label="Qualification" value={identity.qualification} onChange={(qualification) => setIdentity({ qualification })} placeholder="MBBS, FCPS (Medicine)" />
            <LabeledInput label="Designation / title" value={designation} onChange={(designation) => patch({ designation })} placeholder="Consultant — Internal Medicine" />
            <LabeledInput label="BMDC registration no." value={identity.bmdcNo} onChange={(bmdcNo) => setIdentity({ bmdcNo })} placeholder="A-12345" />
        </ControlSection>
    );
}
