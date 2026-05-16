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
  const { isLoggedIn, role } = useAuthStore();

  useEffect(() => {
    if (isLoggedIn) {
      navigate({ to: role === "patient" ? "/portal" : "/dashboard" });
    }
  }, [isLoggedIn, role, navigate]);

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-screen">
      <div className="mb-8">
        <NavbarLogo />
      </div>
      <Outlet />
      <Link to="/">
        <Button variant="link" className="mt-8">
          Back to Home
        </Button>
      </Link>
    </div>
  )
}