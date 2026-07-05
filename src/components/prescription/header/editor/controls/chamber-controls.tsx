import { PlusIcon, XIcon } from "lucide-react";

import { useHeaderConfigStore } from "@/stores/header-config-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ControlSection, LabeledInput } from "./control-primitives";

function PhoneList() {
    const phones = useHeaderConfigStore((state) => state.config.phones);
    const addPhone = useHeaderConfigStore((state) => state.addPhone);
    const updatePhone = useHeaderConfigStore((state) => state.updatePhone);
    const removePhone = useHeaderConfigStore((state) => state.removePhone);

    return (
        <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-slate-500">Phone number(s)</span>
            {phones.map((phone, index) => (
                <div key={index} className="flex items-center gap-2">
                    <Input
                        value={phone}
                        onChange={(event) => updatePhone(index, event.target.value)}
                        placeholder="01711-XXXXXX"
                        inputMode="tel"
                    />
                    <Button type="button" variant="ghost" size="icon-sm" aria-label="Remove phone" onClick={() => removePhone(index)}>
                        <XIcon className="size-4" />
                    </Button>
                </div>
            ))}
            <Button type="button" variant="outline" size="sm" className="self-start" onClick={addPhone}>
                <PlusIcon className="size-4" />
                Add phone
            </Button>
        </div>
    );
}

export default function ChamberControls() {
    const config = useHeaderConfigStore((state) => state.config);
    const patch = useHeaderConfigStore((state) => state.patch);

    return (
        <ControlSection title="Chamber / center" description="Where the doctor is currently sitting.">
            <LabeledInput label="Chamber / center name" value={config.chamberName} onChange={(chamberName) => patch({ chamberName })} placeholder="Green Life Medical Center" />

            <label className="flex flex-col gap-1">
                <span className="text-xs font-medium text-slate-500">Address</span>
                <textarea
                    value={config.chamberAddress}
                    onChange={(event) => patch({ chamberAddress: event.target.value })}
                    placeholder="House 12, Road 5, Dhanmondi, Dhaka"
                    rows={2}
                    className="w-full resize-y rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                />
            </label>

            <PhoneList />

            <LabeledInput label="Visiting hours" value={config.visitingHours} onChange={(visitingHours) => patch({ visitingHours })} placeholder="Sat–Thu, 6:00 PM – 9:00 PM" />
            <LabeledInput label="Appointment / serial" value={config.serial} onChange={(serial) => patch({ serial })} placeholder="Serial: 01711-XXXXXX" />
        </ControlSection>
    );
}
