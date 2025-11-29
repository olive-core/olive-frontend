import { createFileRoute, Link, Outlet, useNavigate } from '@tanstack/react-router'
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";
import { useEffect } from "react";

export const Route = createFileRoute('/(auth)')({
  component: AuthLayout,
})

function AuthLayout() {

  const navigate = useNavigate();
  const { isLoggedIn } = useAuthStore();

  useEffect(() => {
    if (isLoggedIn) {
      navigate({ to: "/dashboard" });
    }
  }, [isLoggedIn, navigate]);

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-screen">
      <Outlet />
      <Link to="/">
        <Button variant="link" className="mt-8">
          Back to Home
        </Button>
      </Link>
    </div>
  )
}