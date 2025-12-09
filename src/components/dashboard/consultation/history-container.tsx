import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { HistoryType } from "@/types/patient";

interface HistoryContainerProps {
    histories: HistoryType[];
    activeHistoryId?: string;
    setActiveHistoryId: (id: string) => void;
}

export default function HistoryContainer({ histories, activeHistoryId, setActiveHistoryId }: HistoryContainerProps) {

    return (
        <Card className="flex flex-col max-h-[calc(60%-32px)]">
            <CardHeader className="font-display text-xl">History</CardHeader>

            <CardContent className="flex-1 overflow-auto">
                <div className="">
                    {/* Replace with dynamic history items */}
                    {histories.map((history, i) => (
                        <div
                            key={i}
                            className={cn(
                                "flex justify-between items-center py-6 relative cursor-pointer hover:bg-slate-100 px-2 rounded-md",
                                activeHistoryId === history.id ? "bg-slate-100/70" : ""
                            )}
                            onClick={() => setActiveHistoryId(history.id)}
                        >
                            <div className={cn("w-[30%] pr-8 text-right text-xs text-slate-500", activeHistoryId === history.id ? "font-semibold text" : "font-normal")}>
                                <p className="">
                                    {history.timestamp}
                                </p>
                                <p className="">
                                    {history.relativeTime}
                                </p>
                            </div>

                            <div className="absolute top-0 bottom-0 w-0.5 bg-slate-200/80 left-[30%]"></div>
                            <div className={cn("absolute w-4 h-4 left-[calc(30%-8px)] top-1/2 -translate-y-1/2 rounded-full", activeHistoryId === history.id ? "bg-emerald-500" : "bg-slate-300")}></div>

                            <div className="w-[70%] pl-8">
                                <p className={cn("text-sm text-slate-700 text-left", activeHistoryId === history.id ? "font-semibold" : "font-normal")}>
                                    {history.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>

    )
}