import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router'
import DashboardNavbar from "@/components/dashboard/navbar";
import { useAuthStore } from "@/stores/auth-store";
import { useEffect } from "react";

export const Route = createFileRoute('/doctor')({
  component: DashboardLayout,
})


function DashboardLayout() {

  const { isLoggedIn, role } = useAuthStore();
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoggedIn) {
      navigate({ to: "/sign-in" });
    } else if (role === "patient") {
      navigate({ to: "/portal" });
    }
  }, [isLoggedIn, role, navigate]);

  return (
    <div className="">

      <main className="w-full min-h-svh pt-18 flex flex-col">
        <DashboardNavbar />
        <div className="w-full h-full flex-1 flex flex-col">
          <Outlet />
        </div>
        <footer className="flex h-12 flex-none items-center justify-center px-4 text-xs text-slate-400">
          © {new Date().getFullYear()} Olive · All rights reserved.
        </footer>
      </main>
    </div>
  )

}