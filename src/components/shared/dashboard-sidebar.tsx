import { Link, useLocation } from "react-router";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "../ui/sidebar";
import { HistoryIcon, HomeIcon, LogOut, Settings2Icon } from "lucide-react";
import { Button } from "../ui/button";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils";

const SIDEBAR_CONTENTS = [
    {
        name: "Dashboard",
        icon: <HomeIcon className="h-5 w-5" />,
        link: "/dashboard",
    },
    // {
    //     name: "New Consultation",
    //     icon: <PlusCircleIcon className="h-5 w-5" />,
    //     link: "/dashboard/new-consultation"
    // },
    {
        name: "Consultation History",
        icon: <HistoryIcon className="h-5 w-5" />,
        link: "/dashboard/history"
    },
    {
        name: "Settings",
        icon: <Settings2Icon className="h-5 w-5" />,
        link: "/dashboard/settings"
    }
]

export function DashboardSidebar() {

    const { logout } = useAuthStore();
    const { pathname } = useLocation();

    const isActive = (path: string) => pathname === path;


    return (
        <Sidebar>
            <SidebarHeader>
                {/* Logo + Name */}
                <Link to="/" className="flex items-center space-x-2 px-4 py-2">
                    <div className="h-8 w-8 rounded-full bg-primary"></div>
                    <span className="text-lg font-display">Olive</span>
                </Link>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>

                            {SIDEBAR_CONTENTS.map((item) => (
                                <SidebarMenuItem key={item.name}>
                                    <SidebarMenuButton asChild>
                                        <Link to={item.link} className={cn("flex items-center space-x-2 px-4 py-2", isActive(item.link) ? "bg-linear-to-r from-primary/20 to-primary/10" : "")}>
                                            {item.icon}
                                            <span>{item.name}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}

                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <div className="px-4 py-2">
                    <Button variant={"ghost"} className="flex items-center justify-start space-x-2 w-full text-left" onClick={logout}>
                        <LogOut className="h-5 w-5" />
                        <span>Sign Out</span>
                    </Button>
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}
