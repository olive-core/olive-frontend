import { Link } from "react-router";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "../ui/sidebar";
import { HistoryIcon, HomeIcon, LogOut, PlusCircleIcon, Settings2Icon } from "lucide-react";
import { Button } from "../ui/button";
import { useAuthStore } from "@/stores/auth-store";

export function DashboardSidebar() {

    const { logout } = useAuthStore()

    return (
        <Sidebar>
            <SidebarHeader>
                {/* Logo + Name */}
                <Link to="/" className="flex items-center space-x-2 px-4 py-2">
                    <div className="h-8 w-8 rounded-full bg-emerald-500"></div>
                    <span className="text-lg font-semibold">Olive</span>
                </Link>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <Link to="/dashboard" className="flex items-center space-x-2 px-4 py-2">
                                        <HomeIcon className="h-5 w-5" />
                                        <span>Dashboard</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>

                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <Link to="/dashboard/new-consultation" className="flex items-center space-x-2 px-4 py-2">
                                        <PlusCircleIcon className="h-5 w-5" />
                                        <span>New Consultation</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>

                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <Link to="/dashboard/history" className="flex items-center space-x-2 px-4 py-2">
                                        <HistoryIcon className="h-5 w-5" />
                                        <span>Consultation History</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>

                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <Link to="/dashboard/settings" className="flex items-center space-x-2 px-4 py-2">
                                        <Settings2Icon className="h-5 w-5" />
                                        <span>Settings</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <div className="px-4 py-2">
                    <Button variant={"outline"} className="flex items-center space-x-2 w-full text-left" onClick={logout}>
                        <LogOut className="h-5 w-5" />
                        <span>Sign Out</span>
                    </Button>
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}
