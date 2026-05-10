import { ArrowLeftIcon, AlertCircleIcon } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export default function DetailError() {
    const navigate = useNavigate();

    return (
        <div className="space-y-6">
            <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate({ to: "/dashboard/consultations" })}
                className="text-slate-500 hover:text-slate-800 -ml-2"
            >
                <ArrowLeftIcon className="size-4 mr-1" />
                Back to consultations
            </Button>

            <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
                    <AlertCircleIcon className="w-7 h-7 text-red-400" />
                </div>
                <div>
                    <p className="text-slate-700 font-semibold text-lg">Failed to load consultation</p>
                    <p className="text-slate-400 text-sm mt-1">
                        The consultation may have been deleted, or there was a network error.
                    </p>
                </div>
            </div>
        </div>
    );
}
