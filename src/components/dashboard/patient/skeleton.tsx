export default function PatientSkeleton() {
    return (
        <div className="animate-pulse space-y-4 p-4">
            <div className="h-6 w-3/4 bg-slate-200 rounded"></div>
            <div className="h-4 w-1/2 bg-slate-200 rounded"></div>
            <div className="h-40 w-full bg-slate-200 rounded"></div>
        </div>
    );
}