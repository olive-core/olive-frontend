import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router'
import DashboardNavbar from "@/components/dashboard/navbar";
import { useAuthStore } from "@/stores/auth-store";
import { useEffect } from "react";

export const Route = createFileRoute('/dashboard')({
  component: DashboardLayout,
})


function DashboardLayout() {

  const { isLoggedIn } = useAuthStore();
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoggedIn) {
      navigate({ to: "/sign-in" });
    }
  }, [isLoggedIn, navigate]);

  return (
    <div className="">

      <main className="w-full min-h-screen pt-18 flex flex-col">
        <DashboardNavbar />
        <div className="w-full h-full flex-1 flex flex-col">
          <Outlet />
        </div>
      </main>
    </div>
  )

}