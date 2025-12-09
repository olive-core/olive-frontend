import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeftIcon, CalendarDays, MicroscopeIcon, PillIcon, StethoscopeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { memo } from "react";
import type { HistoryType } from "@/types/patient";
import { cn } from "@/lib/utils";

interface ConsultationCardProps {
    history: HistoryType,
    totalHistories: number,
    currentHistoryIndex: number,
    toggleFollowUpHistory: (id: string) => void,
    isFollowUpOfCurrent?: boolean,
    handleNext: () => void,
    handlePrevious: () => void,
    isFirst: boolean,
    isLast: boolean,
}

function ConsultationCard({
    history, totalHistories,
    currentHistoryIndex,
    toggleFollowUpHistory,
    isFollowUpOfCurrent = false,
    handleNext,
    handlePrevious,
    isFirst,
    isLast,
}: ConsultationCardProps
) {

    return (
        <Card className="w-full h-full max-w-xl mx-auto rounded-2xl shadow-md">
            <CardContent className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">{history.relativeTime}</h2>
                    <Button
                        size="sm"
                        onClick={() => toggleFollowUpHistory(history.id)}
                        className={cn(
                            "border-2 border-emerald-500",
                            isFollowUpOfCurrent ? "bg-emerald-600 text-white hover:bg-emerald-700" : "bg-white text-emerald-600 border border-emerald-600 hover:bg-emerald-50"
                        )}
                    >
                        Follow Up
                    </Button>
                </div>

                {/* Date */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarDays className="w-4 h-4" />
                    <span>{history.timestamp} 03:40 PM</span>
                </div>

                <Separator />

                {/* Summary */}
                <div className="space-y-1">
                    <h3 className="font-medium flex items-center gap-2"><StethoscopeIcon className="w-4 h-4" /> Summary</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Patient reported mild chest discomfort and fatigue over the last 3 days. No severe symptoms observed. Initial assessment indicates low risk of cardiac issue.
                    </p>
                </div>

                <Separator />

                {/* Diagnosis */}
                <div className="space-y-1">
                    <h3 className="font-medium flex items-center gap-2"><MicroscopeIcon className="w-4 h-4" /> Diagnosis</h3>
                    <p className="text-sm text-muted-foreground">
                        Suspected acid reflux and work-related stress.
                    </p>
                </div>

                <Separator />

                {/* Medicine History */}
                <div className="space-y-2">
                    <h3 className="font-medium flex items-center gap-2"><PillIcon className="w-4 h-4" /> Medicine History</h3>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                        <li>Omeprazole 20mg — Once daily before breakfast</li>
                        <li>Vitamin B Complex — Daily after lunch</li>
                        <li>ORS — As needed for dehydration</li>
                    </ul>
                </div>
            </CardContent>

            <CardFooter className="mt-auto">
                <div className="flex items-center justify-between w-full">
                    <Button variant={"outline"} size="icon" disabled={isFirst} onClick={handlePrevious}>
                        <ArrowLeftIcon className="w-4 h-4" />
                    </Button>

                    <pre>{currentHistoryIndex}/{totalHistories}</pre>

                    <Button variant={"outline"} size="icon" disabled={isLast} onClick={handleNext}>
                        <ArrowLeftIcon className="w-4 h-4 rotate-180" />
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
}

const ConsultationCardMemo = memo(ConsultationCard);
export default ConsultationCardMemo;