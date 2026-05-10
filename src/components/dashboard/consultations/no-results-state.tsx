import { SearchXIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NoResultsStateProps {
    onClearFilters: () => void;
}

export default function NoResultsState({ onClearFilters }: NoResultsStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                <SearchXIcon className="w-7 h-7 text-slate-400" />
            </div>
            <div>
                <p className="text-slate-700 font-semibold text-lg">No matching consultations</p>
                <p className="text-slate-400 text-sm mt-1">
                    Try a different patient name or widen your date range.
                </p>
            </div>
            <Button variant="outline" size="sm" onClick={onClearFilters}>
                Clear filters
            </Button>
        </div>
    );
}
