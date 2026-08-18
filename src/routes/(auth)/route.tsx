import { createFileRoute, Link, Outlet, useNavigate } from '@tanstack/react-router'
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";
import { useEffect } from "react";
import NavbarLogo from '@/components/shared/navbar-logo';

export const Route = createFileRoute('/(auth)')({
  component: AuthLayout,
})

function AuthLayout() {

  const navigate = useNavigate();
  const { isLoggedIn, activeView } = useAuthStore();

  useEffect(() => {
    if (isLoggedIn) {
      const pendingCaseCode = sessionStorage.getItem("pendingCaseCode");
      if (activeView === "doctor" && pendingCaseCode) {
        navigate({ to: "/c/$code", params: { code: pendingCaseCode } });
        return;
      }
      const target = activeView === "patient" ? "/patient" : activeView === "attendant" ? "/attendant" : "/doctor";
      navigate({ to: target });
    }
  }, [isLoggedIn, activeView, navigate]);

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-svh">
      <div className="mb-8">
        <NavbarLogo />
      </div>
      {/* Concrete-width wrapper: the auth pages use w-full internally, which needs a
          real parent width to resolve against — without this the phone/OTP cells
          collapse to their intrinsic (near-zero) size and squeeze together. */}
      <div className="w-full max-w-xl px-4">
        <Outlet />
      </div>
      <Link to="/">
        <Button variant="link" className="mt-8">
          Back to Home
        </Button>
      </Link>
    </div>
  )
}
