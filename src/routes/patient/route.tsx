import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router'
import { useEffect } from "react";
import PatientNavbar from "@/components/patient/patient-navbar";
import AppFooter from "@/components/shared/app-footer";
import { useAuthStore } from "@/stores/auth-store";

export const Route = createFileRoute('/patient')({
  component: PatientLayout,
})

function PatientLayout() {

  const { isLoggedIn, role } = useAuthStore();
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoggedIn) {
      navigate({ to: "/sign-in" });
    } else if (role !== "patient") {
      navigate({ to: "/doctor" });
    }
  }, [isLoggedIn, role, navigate]);

  return (
    <div className="">
      <main className="w-full min-h-svh pt-[calc(5rem+env(safe-area-inset-top))] sm:pt-[calc(4.5rem+env(safe-area-inset-top))] flex flex-col">
        <PatientNavbar />
        <div className="w-full h-full flex-1 flex flex-col">
          <Outlet />
        </div>
        <AppFooter />
      </main>
    </div>
  )
}
