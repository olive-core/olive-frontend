import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { PrescriptionType, RxItem } from "@/types/patient";
import { cn, formatRelativeVisit } from "@/lib/utils";
import {
    AlertCircle,
    ArrowLeftIcon,
    CalendarDays,
    ClipboardList,
    MicroscopeIcon,
    PillIcon,
    StethoscopeIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { memo } from "react";

interface ConsultationCardProps {
    prescription?: PrescriptionType;
    totalHistories: number;
    currentHistoryIndex: number;
    onFollowUp: () => void;
    isFollowUp?: boolean;
    isFollowingUp?: boolean;
    handleNext: () => void;
    handlePrevious: () => void;
    isFirst: boolean;
    isLast: boolean;
    isLoading?: boolean;
    isError?: boolean;
    hasSelection?: boolean;
}

function formatRoutine(item: RxItem): string {
    const { routine, dosage, duration } = item;
    const times: string[] = [];
    if (routine.before_breakfast) times.push("before breakfast");
    if (routine.after_breakfast) times.push("after breakfast");
    if (routine.before_lunch) times.push("before lunch");
    if (routine.after_lunch) times.push("after lunch");
    if (routine.before_dinner) times.push("before dinner");
    if (routine.after_dinner) times.push("after dinner");
    const timingStr = times.length > 0 ? times.join(", ") : "as directed";
    return `${dosage} · ${timingStr} · ${duration}`;
}

function CardSkeleton() {
    return (
        <Card className="w-full h-full rounded-2xl shadow-md">
            <CardHeader>
                <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent className="space-y-6">
                <Skeleton className="h-4 w-48" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                </div>
            </CardContent>
            <CardFooter>
                <div className="flex items-center justify-between w-full">
                    <Skeleton className="h-9 w-9 rounded-md" />
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-9 w-9 rounded-md" />
                </div>
            </CardFooter>
        </Card>
    );
}

function ConsultationCard({
    prescription,
    totalHistories,
    currentHistoryIndex,
    onFollowUp,
    isFollowUp = false,
    isFollowingUp = false,
    handleNext,
    handlePrevious,
    isFirst,
    isLast,
    isLoading,
    isError,
    hasSelection,
}: ConsultationCardProps) {

    if (isLoading) {
        return <CardSkeleton />;
    }

    if (isError) {
        return (
            <Card className="w-full h-full rounded-2xl shadow-md flex flex-col items-center justify-center min-h-[300px] gap-3 text-center p-8">
                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-red-400" />
                </div>
                <div>
                    <p className="text-sm font-medium text-slate-700">Failed to load prescription</p>
                    <p className="text-xs text-slate-400 mt-1">Please try selecting the consultation again.</p>
                </div>
            </Card>
        );
    }

    if (!hasSelection || !prescription) {
        const firstVisit = totalHistories === 0;
        return (
            <Card className="w-full h-full rounded-2xl shadow-md flex flex-col items-center justify-center min-h-[300px] gap-3 text-center p-8">
                <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
                    <ClipboardList className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                    <p className="text-sm font-medium text-slate-700">
                        {firstVisit ? "First visit" : "Select a consultation"}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                        {firstVisit
                            ? "No past records for this patient yet."
                            : "Choose a past visit from the list to view its details."}
                    </p>
                </div>
            </Card>
        );
    }

    const { prescription_data, created_at, clinician_name } = prescription;
    const chief_complaints = prescription_data?.chief_complaints ?? [];
    const diagnoses = prescription_data?.diagnoses ?? [];
    const rx_list = prescription_data?.rx_list ?? [];
    const { relative, exact } = formatRelativeVisit(created_at);

    return (
        <Card className="w-full h-full rounded-2xl shadow-md flex flex-col">
            <CardContent className="space-y-6 flex-1 overflow-auto pt-6">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-800">
                            Dr. {clinician_name}
                        </h2>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                            <CalendarDays className="w-3.5 h-3.5" />
                            <span>{relative} · {exact}</span>
                        </div>
                    </div>
                    <Button
                        size="sm"
                        disabled={isFollowingUp}
                        onClick={onFollowUp}
                        className={cn(
                            "shrink-0 border border-emerald-600",
                            isFollowUp
                                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                                : "bg-white text-emerald-600 hover:bg-emerald-50"
                        )}
                    >
                        {isFollowingUp ? (
                            <span className="flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
                                Saving…
                            </span>
                        ) : isFollowUp ? "✓ Follow Up" : "Follow Up"}
                    </Button>
                </div>

                {/* Chief Complaints */}
                {chief_complaints.length > 0 && (
                    <div className="space-y-2">
                        <h3 className="font-medium text-sm flex items-center gap-2 text-slate-700">
                            <StethoscopeIcon className="w-4 h-4 text-emerald-500" />
                            Chief Complaints
                        </h3>
                        <ul className="space-y-1.5">
                            {chief_complaints.map((cc, i) => (
                                <li key={i} className="text-sm text-muted-foreground">
                                    <span className="font-medium text-slate-600">{cc.name_text}</span>
                                    {cc.notes && <span className="text-slate-400"> — {cc.notes}</span>}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Diagnosis */}
                {diagnoses.length > 0 && (
                    <div className="space-y-2">
                        <h3 className="font-medium text-sm flex items-center gap-2 text-slate-700">
                            <MicroscopeIcon className="w-4 h-4 text-emerald-500" />
                            Diagnosis
                        </h3>
                        <ul className="space-y-1 list-disc list-inside">
                            {diagnoses.map((d, i) => (
                                <li key={i} className="text-sm text-muted-foreground">{d.name_text}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Medicines */}
                {rx_list.length > 0 && (
                    <div className="space-y-2">
                        <h3 className="font-medium text-sm flex items-center gap-2 text-slate-700">
                            <PillIcon className="w-4 h-4 text-emerald-500" />
                            Medicines
                        </h3>
                        <ul className="space-y-2">
                            {rx_list.map((rx, i) => (
                                <li key={i} className="text-sm">
                                    <p className="font-medium text-slate-700">{rx.trade_name}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">{formatRoutine(rx)}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Empty prescription */}
                {chief_complaints.length === 0 &&
                    diagnoses.length === 0 &&
                    rx_list.length === 0 && (
                        <p className="text-sm text-slate-400 text-center py-4">
                            No prescription details available.
                        </p>
                    )}
            </CardContent>

            <CardFooter className="mt-auto border-t pt-4">
                <div className="flex items-center justify-between w-full">
                    <Button variant="outline" size="icon" disabled={isFirst} onClick={handlePrevious}>
                        <ArrowLeftIcon className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-slate-500">{currentHistoryIndex} / {totalHistories}</span>
                    <Button variant="outline" size="icon" disabled={isLast} onClick={handleNext}>
                        <ArrowLeftIcon className="w-4 h-4 rotate-180" />
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
}

const ConsultationCardMemo = memo(ConsultationCard);
export default ConsultationCardMemo;