import { DayWiseAreaChart } from "@/components/dashboard/day-wise-area-chart";
import NewSession from "@/components/dashboard/new-session";

export default function DashboardPage() {
    return (
        <div className="p-4">
            <div className="flex gap-6">
                <NewSession />
                <div className="w-2/5 h-64 border rounded-lg">
                    <DayWiseAreaChart />
                </div>
            </div>

            <h3 className="mt-6 text-xl">Recent</h3>

        </div>
    )
}