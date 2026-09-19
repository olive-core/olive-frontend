import { Skeleton } from "@/components/ui/skeleton";

export function InsightSkeleton({ rows = 4 }: { rows?: number }) {
    return (
        <div className="space-y-3">
            {Array.from({ length: rows }).map((_, index) => (
                <Skeleton key={index} className="h-6 w-full" />
            ))}
        </div>
    );
}

export function InsightError() {
    return <p className="text-sm text-slate-500">Could not load this. Try again in a moment.</p>;
}

/** An empty state is an instruction, so it is set to be read rather than to recede. */
export function InsightEmpty({ children }: { children: React.ReactNode }) {
    return <p className="text-sm text-slate-500">{children}</p>;
}
