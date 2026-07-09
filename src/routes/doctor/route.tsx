import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router'
import DashboardNavbar from "@/components/dashboard/navbar";
import SubscriptionBanner from "@/components/dashboard/subscription/subscription-banner";
import SubscriptionBlockedDialog from "@/components/dashboard/subscription/subscription-blocked-dialog";
import AppFooter from "@/components/shared/app-footer";
import { useAuthStore } from "@/stores/auth-store";
import { ensureMedicineIndex } from "@/lib/medicine-search/index-store";
import { ensureInvestigationIndex } from "@/lib/investigation-search/index-store";
import { useEffect } from "react";

export const Route = createFileRoute('/doctor')({
  component: DashboardLayout,
})


function DashboardLayout() {

  const { isLoggedIn, activeView } = useAuthStore();
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoggedIn) {
      navigate({ to: "/sign-in" });
    } else if (activeView === "patient") {
      navigate({ to: "/patient" });
    } else if (activeView === "attendant") {
      navigate({ to: "/attendant" });
    }
  }, [isLoggedIn, activeView, navigate]);

  // Warm the local search indexes as soon as a doctor lands in the dashboard, so
  // search is instant by the time they open the prescription editor. Cheap when
  // the cached snapshots are current (just a version check).
  useEffect(() => {
    if (isLoggedIn && activeView === "doctor") {
      ensureMedicineIndex().catch(() => undefined);
      ensureInvestigationIndex().catch(() => undefined);
    }
  }, [isLoggedIn, activeView]);

  return (
    <div className="">

      <main className="w-full min-h-svh pt-18 flex flex-col">
        <DashboardNavbar />
        <SubscriptionBanner />
        <div className="w-full h-full flex-1 flex flex-col">
          <Outlet />
        </div>
        <AppFooter />
      </main>
      <SubscriptionBlockedDialog />
    </div>
  )

}