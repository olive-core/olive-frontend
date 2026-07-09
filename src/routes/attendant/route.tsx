import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";
import AttendantNavbar from "@/components/attendant/attendant-navbar";

export const Route = createFileRoute("/attendant")({
    component: AttendantLayout,
});

function AttendantLayout() {
    const { isLoggedIn, activeView } = useAuthStore();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoggedIn) {
            navigate({ to: "/sign-in" });
        } else if (activeView && activeView !== "attendant") {
            navigate({ to: activeView === "patient" ? "/patient" : "/doctor" });
        }
    }, [isLoggedIn, activeView, navigate]);

    return (
        <main className="w-full min-h-svh pt-16 flex flex-col">
            <AttendantNavbar />
            <div className="flex-1">
                <Outlet />
            </div>
        </main>
    );
}
