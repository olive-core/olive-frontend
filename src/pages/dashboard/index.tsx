import { PlusCircleIcon } from "lucide-react";

export default function DashboardPage() {
    return (
        <div className="p-4">
            <div className="flex gap-6">
                <div className="w-3/5 h-64 border rounded-lg flex flex-col items-center justify-center">
                    <PlusCircleIcon className="w-8 h-8 text-slate-400" />
                    <p className="mt-4 text-slate-600 font-display">Start New Consultation</p>
                </div>
                <div className="w-2/5 h-64 border rounded-lg"></div>
            </div>

            <h3 className="mt-6 text-xl">Recent</h3>

        </div>
    )
}