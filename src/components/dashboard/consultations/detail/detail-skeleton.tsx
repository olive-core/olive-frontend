import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function SectionSkeleton() {
    return (
        <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
        </div>
    );
}

export default function DetailSkeleton() {
    return (
        <div className="space-y-6">
            <Skeleton className="h-8 w-40" />
            <div className="flex items-start gap-4">
                <Skeleton className="w-16 h-16 rounded-full" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-3 w-72" />
                </div>
            </div>

            <Card className="rounded-2xl shadow-sm">
                <CardContent className="space-y-6 pt-6">
                    <SectionSkeleton />
                    <SectionSkeleton />
                    <SectionSkeleton />
                </CardContent>
            </Card>
        </div>
    );
}
