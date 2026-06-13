import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";
import { Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export default function AuthLayout() {

    const navigate = useNavigate();
    const { isLoggedIn } = useAuthStore();

    useEffect(() => {
        if (isLoggedIn) {
            navigate({ to: "/doctor" });
        }
    }, [isLoggedIn, navigate]);

    return (
        <div className="flex flex-col items-center justify-center w-full min-h-svh">
            <Outlet />
            <Button variant="link" className="mt-8" onClick={() => navigate({ to: "/" })}>
                Back to Home
            </Button>
        </div>
    )
}