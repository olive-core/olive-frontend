import { useState } from "react";
import { PlusIcon } from "lucide-react";

import { useAuthStore } from "@/stores/auth-store";
import { chamberSectionId, useHeaderConfigStore } from "@/stores/header-config-store";
import { Button } from "@/components/ui/button";
import NewChamberForm from "@/components/dashboard/chambers/new-chamber-form";

// Adding a chamber from inside the editor. The new chamber joins the store at once and its
// section opens, so the doctor lands straight on the paper question for the place they just
// added instead of hunting for it.
export default function AddChamberControl() {
    const clinicianId = useAuthStore((state) => state.userId);
    const addChamber = useHeaderConfigStore((state) => state.addChamber);
    const setOpenSection = useHeaderConfigStore((state) => state.setOpenSection);
    const [isAdding, setIsAdding] = useState(false);

    if (!clinicianId) return null;

    if (!isAdding) {
        return (
            <Button type="button" variant="outline" className="w-full justify-center" onClick={() => setIsAdding(true)}>
                <PlusIcon className="size-4" />
                Add a chamber
            </Button>
        );
    }

    return (
        <NewChamberForm
            clinicianId={clinicianId}
            onDone={() => setIsAdding(false)}
            onCancel={() => setIsAdding(false)}
            onCreated={(chamber) => {
                addChamber(chamber);
                setOpenSection(chamberSectionId(chamber.chamber_id));
            }}
        />
    );
}
