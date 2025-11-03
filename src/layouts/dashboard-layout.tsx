import DashboardNavbar from "@/components/shared/dashboard-navbar";
import { DashboardSidebar } from "@/components/shared/dashboard-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useAuthStore } from "@/stores/auth-store";
import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router";

export default function DashboardLayout() {

    const { isLoggedIn } = useAuthStore();
    const navigate = useNavigate()

    useEffect(() => {
        if (!isLoggedIn) {
            navigate("/sign-in");
        }
    }, [isLoggedIn, navigate]);

    return (
        <div className="">
            <SidebarProvider>
                <DashboardSidebar />
                <main className="w-full min-h-screen">
                    <DashboardNavbar />
                    <Outlet />
                </main>
            </SidebarProvider>
        </div>
    )

}