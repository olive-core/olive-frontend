import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router'
import { useEffect } from "react";
import PortalNavbar from "@/components/portal/portal-navbar";
import { useAuthStore } from "@/stores/auth-store";

export const Route = createFileRoute('/portal')({
  component: PortalLayout,
})

function PortalLayout() {

  const { isLoggedIn, role } = useAuthStore();
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoggedIn) {
      navigate({ to: "/sign-in" });
    } else if (role !== "patient") {
      navigate({ to: "/dashboard" });
    }
  }, [isLoggedIn, role, navigate]);

  return (
    <div className="">
      <main className="w-full min-h-svh pt-18 flex flex-col">
        <PortalNavbar />
        <div className="w-full h-full flex-1 flex flex-col">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
