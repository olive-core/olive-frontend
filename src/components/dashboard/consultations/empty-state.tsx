import { ClipboardListIcon } from "lucide-react";

export default function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center">
                <ClipboardListIcon className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
                <p className="text-slate-700 font-semibold text-lg">No consultations yet</p>
                <p className="text-slate-400 text-sm mt-1">
                    Saved consultations will appear here, grouped by day.
                </p>
            </div>
        </div>
    );
}
