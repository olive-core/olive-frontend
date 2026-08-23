import { useHeaderConfigStore } from "@/stores/header-config-store";
import { controlId } from "../focus-field";
import { LabeledInput, LabeledTextarea } from "./control-primitives";

export default function DoctorControls() {
    const identity = useHeaderConfigStore((state) => state.identity);
    const setIdentity = useHeaderConfigStore((state) => state.setIdentity);
    const designation = useHeaderConfigStore((state) => state.config.designation);
    const nameBn = useHeaderConfigStore((state) => state.config.nameBn);
    const patch = useHeaderConfigStore((state) => state.patch);

    return (
        <div className="flex flex-col gap-3">
            <LabeledInput id={controlId("name")} label="Name" value={identity.name} onChange={(name) => setIdentity({ name })} placeholder="Dr. Ahsan Habib" />
            <LabeledInput
                id={controlId("nameBn")}
                label="Name in Bangla (optional)"
                value={nameBn}
                onChange={(value) => patch({ nameBn: value })}
                placeholder="ডা. আহসান হাবীব"
                lang="bn"
            />
            <LabeledTextarea id={controlId("qualification")} label="Qualification" value={identity.qualification} onChange={(qualification) => setIdentity({ qualification })} placeholder="MBBS, FCPS (Medicine)" />
            <LabeledTextarea id={controlId("designation")} label="Designation / specialization" value={designation} onChange={(designation) => patch({ designation })} placeholder="Consultant — Internal Medicine" />
            <LabeledInput id={controlId("bmdcNo")} label="BMDC registration no." value={identity.bmdcNo} onChange={(bmdcNo) => setIdentity({ bmdcNo })} placeholder="A-12345" />
        </div>
    );
}
