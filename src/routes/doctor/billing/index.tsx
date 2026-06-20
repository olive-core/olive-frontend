import { createFileRoute } from "@tanstack/react-router";

import MembershipPanel from "@/components/dashboard/subscription/membership-panel";

export const Route = createFileRoute("/doctor/billing/")({
    component: BillingPage,
});

function BillingPage() {
    return (
        <div className="w-full px-4 py-8">
            <MembershipPanel />
        </div>
    );
}
