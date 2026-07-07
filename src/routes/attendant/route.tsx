import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";
import AttendantNavbar from "@/components/attendant/attendant-navbar";

export const Route = createFileRoute("/attendant")({
    component: AttendantLayout,
});

function AttendantLayout() {
    const { isLoggedIn, role } = useAuthStore();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoggedIn) {
            navigate({ to: "/sign-in" });
        } else if (role && role !== "attendant") {
            navigate({ to: role === "patient" ? "/patient" : "/doctor" });
        }
    }, [isLoggedIn, role, navigate]);

    return (
        <main className="w-full min-h-svh pt-16 flex flex-col">
            <AttendantNavbar />
            <div className="flex-1">
                <Outlet />
            </div>
        </main>
    );
}
