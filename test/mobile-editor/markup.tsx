import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import RxForm from "@/components/prescription/rx/rx-form";
import { RX_TYPE_CONFIG } from "@/components/prescription/rx/rx-type-config";
import { getRxArchetype, type MedicineCategory } from "@/lib/dosage-form";
import DebouncedSearchSelect from "@/components/prescription/debounced-search-select";
import VitalsBar from "@/components/prescription/paper/vitals-bar";
import FollowUpBlock from "@/components/prescription/paper/follow-up-block";
import AdviceList from "@/components/prescription/advice-list";
import ListInfo from "@/components/prescription/list-info";
import ClinicalNotesPanel from "@/components/prescription/paper/clinical-notes-panel";
import type { MeedicineType } from "@/types/prescription";

const noop = () => {};

function withQueryClient(node: ReactNode) {
    return (
        <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
            {node}
        </QueryClientProvider>
    );
}

// Every field a clinician can type into or tap while writing a prescription, rendered in
// one page so the phone-sizing rules can be checked across all of them at once.
export function editorMarkup(): string {
    const categories: MedicineCategory[] = ["tablet", "injection", "nebulizer", "drops"];

    return renderToStaticMarkup(
        withQueryClient(
            <>
                {categories.map((category) => {
                    const medicine: MeedicineType = { name: "Napa", value: "napa", type: category };
                    return (
                        <RxForm
                            key={category}
                            medicine={medicine}
                            config={RX_TYPE_CONFIG[getRxArchetype(category)]}
                            onChange={noop}
                        />
                    );
                })}

                <DebouncedSearchSelect
                    value={null}
                    onChange={noop}
                    fetchOptions={async () => []}
                    queryKeyBase="test-search"
                />

                <VitalsBar vitals={{ bp_systolic: 120, bp_diastolic: 80 }} onChange={noop} />
                <FollowUpBlock value={{ follow_up_days: 7 }} onChange={noop} />
                <AdviceList value={["Drink water"]} onChange={noop} />
                <ClinicalNotesPanel notes="" onChange={noop} />
            </>,
        ),
    );
}

export function listItemRowMarkup(): string {
    return renderToStaticMarkup(
        withQueryClient(
            <ListInfo
                title="Chief Complaints"
                info={[{ name: "Fever", duration: "3 days" }]}
                fieldName="chief-complaint"
                addEmptyItem={noop}
                updateItem={noop}
                removeItem={noop}
            />,
        ),
    );
}
