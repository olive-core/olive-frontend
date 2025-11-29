import { ChartNoAxesColumnIcon, EllipsisIcon, HandCoinsIcon, HistoryIcon, LogOutIcon, SettingsIcon, UserIcon } from "lucide-react";
import NavbarContainer from "../shared/navbar-container";
import { Button } from "../ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { useAuthStore } from "@/stores/auth-store";
import { Link } from "@tanstack/react-router";

type MenuItemType = {
    label: string;
    icon: React.ReactNode;
    href?: string;
    buttonType?: "logout";
}

const MENU_ITEMS: MenuItemType[] = [
    {
        label: "Statistics",
        icon: <ChartNoAxesColumnIcon />,
        href: "/dashboard/statistics",
    },
    {
        label: "Session History",
        icon: <HistoryIcon />,
        href: "/dashboard/history",
    },
    {
        label: "Profile",
        icon: <UserIcon />,
        href: "/dashboard/profile",
    },
    {
        label: "Settings",
        icon: <SettingsIcon />,
        href: "/dashboard/settings",
    },
    {
        label: "Billing",
        icon: <HandCoinsIcon />,
        href: "/dashboard/billing",
    },
    {
        label: "Logout",
        icon: <LogOutIcon />,
        buttonType: "logout",
    }

]

const TOTAL_MENU_TO_SHOW = 3;

export default function DashboardNavbar() {

    const { logout } = useAuthStore();

    const menuToShowCount = MENU_ITEMS.length > TOTAL_MENU_TO_SHOW ? TOTAL_MENU_TO_SHOW - 1 : MENU_ITEMS.length;

    const handleMenuClick = (menu: MenuItemType) => {
        switch (menu.buttonType) {
            case "logout":
                logout();
                break;
            default:
                break;
        }
    }

    const renderMenuShowButton = (menu: MenuItemType) => {
        return (
            <Tooltip>
                <TooltipTrigger>
                    {menu.href && (
                        <Link to={menu.href}>
                            <Button variant="nav-icon">
                                {menu.icon}
                            </Button>
                        </Link>
                    )}

                    {menu.buttonType && (
                        <Button variant="nav-icon" onClick={() => handleMenuClick(menu)}>
                            {menu.icon}
                        </Button>
                    )}
                </TooltipTrigger>
                <TooltipContent>
                    <p>{menu.label}</p>
                </TooltipContent>
            </Tooltip>
        )
    }

    const renderDropdownMenuItem = (menu: MenuItemType) => {
        return (
            <>
                {menu.href && (
                    <Link to={menu.href} className="flex items-center gap-2 w-full">
                        {menu.icon}
                        {menu.label}
                    </Link>
                )}

                {menu.buttonType && (
                    <div className="flex items-center gap-2 cursor-pointer w-full" onClick={() => handleMenuClick(menu)}>
                        {menu.icon}
                        {menu.label}
                    </div>
                )}
            </>
        )
    }


    return (
        <NavbarContainer className="border-none">

            <div className="md:flex items-center hidden gap-4">


                {MENU_ITEMS.slice(0, menuToShowCount).map((menu, index) => (
                    <div key={index}>
                        {renderMenuShowButton(menu)}
                    </div>
                ))}

                {MENU_ITEMS.length > TOTAL_MENU_TO_SHOW && (
                    <DropdownMenu>

                        <Tooltip>
                            <TooltipTrigger>
                                <DropdownMenuTrigger asChild className="focus:outline-none focus:ring-0 focus:border-none">
                                    <Button variant="nav-icon">
                                        <EllipsisIcon />
                                    </Button>
                                </DropdownMenuTrigger>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>More Items</p>
                            </TooltipContent>
                        </Tooltip>


                        <DropdownMenuContent>
                            {MENU_ITEMS.slice(menuToShowCount).map((menu, index) => (
                                <DropdownMenuItem key={index}>
                                    {renderDropdownMenuItem(menu)}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}


            </div>
        </NavbarContainer>
    )
}