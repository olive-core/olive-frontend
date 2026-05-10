const SKELETON_GROUPS = [4, 3];

function CardSkeleton() {
    return (
        <div className="bg-white border border-slate-100 rounded-2xl p-5 flex flex-col gap-4 animate-pulse">
            <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-slate-100" />
                <div className="flex-1 flex flex-col gap-2 pt-1">
                    <div className="h-3 bg-slate-100 rounded-full w-3/4" />
                    <div className="h-3 bg-slate-100 rounded-full w-1/3" />
                </div>
                <div className="h-3 w-12 bg-slate-100 rounded-full" />
            </div>
            <div className="border-t border-slate-100 pt-3 flex gap-2">
                <div className="h-5 w-24 bg-slate-100 rounded-full" />
                <div className="h-5 w-16 bg-slate-100 rounded-full" />
            </div>
        </div>
    );
}

function DaySectionSkeleton({ cardCount }: { cardCount: number }) {
    return (
        <div className="space-y-4">
            <div className="h-3 w-32 bg-slate-100 rounded-full animate-pulse" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: cardCount }).map((_, index) => (
                    <CardSkeleton key={index} />
                ))}
            </div>
        </div>
    );
}

export default function GridSkeleton() {
    return (
        <div className="space-y-10">
            {SKELETON_GROUPS.map((cardCount, index) => (
                <DaySectionSkeleton key={index} cardCount={cardCount} />
            ))}
        </div>
    );
}
