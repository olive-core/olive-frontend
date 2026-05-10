import { Skeleton } from "@/components/ui/skeleton";
import PrescriptionPaper from "./prescription-paper";

function HeaderSkeleton() {
    return (
        <div className="pt-2 space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
        </div>
    );
}

function PatientStripSkeleton() {
    return (
        <div className="border-y py-3 mt-5 flex items-center justify-between">
            <div className="flex gap-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-4 w-40" />
        </div>
    );
}

function SectionSkeleton({ rows = 2 }: { rows?: number }) {
    return (
        <div className="flex flex-col gap-2 p-2">
            <Skeleton className="h-3 w-24" />
            <div className="flex flex-col gap-1.5">
                {Array.from({ length: rows }).map((_, index) => (
                    <Skeleton key={index} className="h-8 w-full rounded-lg" />
                ))}
            </div>
        </div>
    );
}

function MedicineSkeleton() {
    return (
        <div className="mb-4 pt-2 space-y-3">
            <Skeleton className="h-5 w-32" />
            {[0, 1, 2].map((index) => (
                <Skeleton key={index} className="h-20 w-full rounded-lg" />
            ))}
        </div>
    );
}

export default function ReadSkeleton() {
    return (
        <PrescriptionPaper
            header={<HeaderSkeleton />}
            patientStrip={<PatientStripSkeleton />}
            leftColumn={
                <>
                    <SectionSkeleton rows={2} />
                    <SectionSkeleton rows={1} />
                    <SectionSkeleton rows={2} />
                    <SectionSkeleton rows={1} />
                </>
            }
            rightColumn={<MedicineSkeleton />}
        />
    );
}
