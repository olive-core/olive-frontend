import { Card, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import ScrollFade from "@/components/shared/scroll-fade";
import { cn, formatRelativeVisit } from "@/lib/utils";
import type { HistoryType } from "@/types/patient";
import { AlertCircle, ClipboardList } from "lucide-react";

interface HistoryContainerProps {
    histories?: HistoryType[];
    activeHistoryId?: string;
    setActiveHistoryId: (id: string) => void;
    isLoading?: boolean;
    isError?: boolean;
}

function HistorySkeletonItem() {
    return (
        <div className="flex justify-between items-center py-6 relative px-2">
            <div className="w-[30%] pr-3 md:pr-8 flex flex-col items-end gap-1.5">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-10" />
            </div>
            <div className="absolute top-0 bottom-0 w-0.5 bg-slate-200/80 left-[30%]" />
            <div className="absolute w-4 h-4 left-[calc(30%-8px)] top-1/2 -translate-y-1/2 rounded-full bg-slate-200" />
            <div className="w-[70%] pl-4 md:pl-8 flex flex-col gap-1.5">
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
            </div>
        </div>
    );
}

export default function HistoryContainer({
    histories,
    activeHistoryId,
    setActiveHistoryId,
    isLoading,
    isError,
}: HistoryContainerProps) {

    const visitCount = histories?.length ?? 0;

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="divide-y divide-slate-100">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <HistorySkeletonItem key={i} />
                    ))}
                </div>
            );
        }

        if (isError) {
            return (
                <div className="flex flex-col items-center justify-center h-full min-h-[180px] gap-3 text-center px-4">
                    <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                        <AlertCircle className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-700">Failed to load history</p>
                        <p className="text-xs text-slate-400 mt-1">Please try refreshing the page.</p>
                    </div>
                </div>
            );
        }

        if (!histories || histories.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center h-full min-h-[180px] gap-3 text-center px-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                        <ClipboardList className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-700">No consultations yet</p>
                        <p className="text-xs text-slate-400 mt-1">Past sessions will appear here once recorded.</p>
                    </div>
                </div>
            );
        }

        return (
            <div>
                {histories.map((history) => {
                    const { relative, exact } = formatRelativeVisit(history.created_at);
                    const isActive = activeHistoryId === history.prescription_id;
                    const summary = history.diagnoses_summary?.length > 0
                        ? history.diagnoses_summary.join(", ")
                        : "No diagnosis summary";

                    return (
                        <button
                            type="button"
                            key={history.prescription_id}
                            className={cn(
                                "flex w-full text-left justify-between items-center py-6 relative cursor-pointer hover:bg-slate-50 px-2 rounded-md transition-colors",
                                isActive ? "bg-slate-100/70" : ""
                            )}
                            onClick={() => setActiveHistoryId(history.prescription_id)}
                        >
                            <div className="w-[30%] pr-3 md:pr-8 text-right">
                                <p className={cn("text-xs text-slate-600", isActive ? "font-semibold" : "font-medium")}>{relative}</p>
                                <p className="text-[11px] text-slate-400 mt-0.5">{exact}</p>
                            </div>

                            <div className="absolute top-0 bottom-0 w-0.5 bg-slate-200/80 left-[30%]" />
                            <div className={cn(
                                "absolute w-4 h-4 left-[calc(30%-8px)] top-1/2 -translate-y-1/2 rounded-full transition-colors",
                                isActive ? "bg-emerald-500" : "bg-slate-300"
                            )} />

                            <div className="w-[70%] min-w-0 pl-4 md:pl-8">
                                <p className={cn("text-sm text-slate-700 text-left line-clamp-2 break-words", isActive ? "font-semibold" : "font-normal")}>
                                    {summary}
                                </p>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    Dr. {history.clinician_name}
                                </p>
                            </div>
                        </button>
                    );
                })}
            </div>
        );
    };

    return (
        <Card className="flex flex-col h-full min-h-0 gap-3">
            <CardHeader className="font-display text-xl flex-row items-baseline gap-2">
                <span>Past visits</span>
                {visitCount > 0 && (
                    <span className="text-sm font-sans font-normal text-slate-400">· {visitCount}</span>
                )}
            </CardHeader>

            <ScrollFade className="px-6">{renderContent()}</ScrollFade>
        </Card>
    );
}