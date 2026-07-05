import { PlusIcon, XIcon } from "lucide-react";

import { useHeaderConfigStore } from "@/stores/header-config-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ControlSection } from "./control-primitives";

// Lets the doctor add any extra labelled line they want (e.g. Website, Emergency hotline).
export default function CustomFieldsControls() {
    const customFields = useHeaderConfigStore((state) => state.config.customFields);
    const addCustomField = useHeaderConfigStore((state) => state.addCustomField);
    const updateCustomField = useHeaderConfigStore((state) => state.updateCustomField);
    const removeCustomField = useHeaderConfigStore((state) => state.removeCustomField);

    return (
        <ControlSection title="Custom fields" description="Add any other line you want on the header.">
            {customFields.map((field) => (
                <div key={field.id} className="flex items-center gap-2">
                    <Input
                        value={field.label}
                        onChange={(event) => updateCustomField(field.id, { label: event.target.value })}
                        placeholder="Label"
                        className="max-w-[40%]"
                    />
                    <Input
                        value={field.value}
                        onChange={(event) => updateCustomField(field.id, { value: event.target.value })}
                        placeholder="Value"
                    />
                    <Button type="button" variant="ghost" size="icon-sm" aria-label="Remove field" onClick={() => removeCustomField(field.id)}>
                        <XIcon className="size-4" />
                    </Button>
                </div>
            ))}
            <Button type="button" variant="outline" size="sm" className="self-start" onClick={addCustomField}>
                <PlusIcon className="size-4" />
                Add field
            </Button>
        </ControlSection>
    );
}
