import { AlertCircleIcon } from "lucide-react";

export default function ErrorState() {
    return (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
                <AlertCircleIcon className="w-7 h-7 text-red-400" />
            </div>
            <div>
                <p className="text-slate-700 font-semibold text-lg">Failed to load consultations</p>
                <p className="text-slate-400 text-sm mt-1">Please try refreshing the page.</p>
            </div>
        </div>
    );
}
