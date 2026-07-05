import { useHeaderConfigStore } from "@/stores/header-config-store";
import PrescriptionHeader from "../prescription-header";

// A faux A4 page that renders the real header exactly as it will print, with a faint stub of
// the Rx body underneath so the letterhead reads in context. Subscribes to the store, so it
// updates on every edit.
export default function HeaderLivePreview() {
    const identity = useHeaderConfigStore((state) => state.identity);
    const config = useHeaderConfigStore((state) => state.config);

    return (
        <div className="rounded-xl border bg-slate-100 p-4">
            <p className="mb-3 text-xs font-medium text-slate-400">Live preview — how it prints on the prescription</p>
            <div className="mx-auto w-full max-w-[210mm] rounded-lg bg-white p-6 shadow-sm ring-1 ring-black/5">
                <PrescriptionHeader identity={identity} config={config} />

                <div className="mt-6 flex flex-col gap-2 opacity-40">
                    <div className="h-2 w-1/3 rounded bg-slate-200" />
                    <div className="h-2 w-2/3 rounded bg-slate-200" />
                    <div className="h-2 w-1/2 rounded bg-slate-200" />
                </div>
            </div>
        </div>
    );
}
