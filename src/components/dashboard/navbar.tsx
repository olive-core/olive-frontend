import { BookMarked, ClipboardListIcon, EllipsisIcon, House, LogOutIcon, MenuIcon, UserIcon, XIcon } from "lucide-react";
import { useState } from "react";
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
        label: "Home",
        icon: <House />,
        href: "/doctor",
    },
    {
        label: "Consultations",
        icon: <ClipboardListIcon />,
        href: "/doctor/consultations",
    },
    {
        label: "RxMemory",
        icon: <BookMarked />,
        href: "/doctor/rx-memory",
    },
    // {
    //     label: "Statistics",
    //     icon: <ChartNoAxesColumnIcon />,
    //     href: "/doctor/statistics",
    // },
    // {
    //     label: "Session History",
    //     icon: <HistoryIcon />,
    //     href: "/doctor/history",
    // },
    {
        label: "Profile",
        icon: <UserIcon />,
        href: "/doctor/profile",
    },
    // {
    //     label: "Settings",
    //     icon: <SettingsIcon />,
    //     href: "/doctor/settings",
    // },
    // {
    //     label: "Billing",
    //     icon: <HandCoinsIcon />,
    //     href: "/doctor/billing",
    // },
    {
        label: "Logout",
        icon: <LogOutIcon />,
        buttonType: "logout",
    },


]

const TOTAL_MENU_TO_SHOW = 4;

export default function DashboardNavbar() {

    const { logout } = useAuthStore();
    const [mobileOpen, setMobileOpen] = useState(false);

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
                <TooltipTrigger asChild>
                    {menu.href ? (
                        <Button asChild variant="nav-icon" aria-label={menu.label}>
                            <Link to={menu.href}>
                                {menu.icon}
                            </Link>
                        </Button>
                    ) : (
                        <Button variant="nav-icon" aria-label={menu.label} onClick={() => handleMenuClick(menu)}>
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
                    <button type="button" className="flex items-center gap-2 cursor-pointer w-full text-left" onClick={() => handleMenuClick(menu)}>
                        {menu.icon}
                        {menu.label}
                    </button>
                )}
            </>
        )
    }


    const renderMobileMenuItem = (menu: MenuItemType) => {
        const closeMenu = () => setMobileOpen(false);
        return (
            <>
                {menu.href && (
                    <Link
                        to={menu.href}
                        onClick={closeMenu}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-700 font-medium hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                    >
                        {menu.icon}
                        {menu.label}
                    </Link>
                )}

                {menu.buttonType && (
                    <button
                        type="button"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-700 font-medium hover:bg-emerald-50 hover:text-emerald-600 transition-colors cursor-pointer w-full text-left"
                        onClick={() => { handleMenuClick(menu); closeMenu(); }}
                    >
                        {menu.icon}
                        {menu.label}
                    </button>
                )}
            </>
        )
    }

    return (
        <>
            <NavbarContainer className="border-none print:hidden">

                <div className="md:flex items-center hidden gap-4">


                    {MENU_ITEMS.slice(0, menuToShowCount).map((menu, index) => (
                        <div key={index}>
                            {renderMenuShowButton(menu)}
                        </div>
                    ))}

                    {MENU_ITEMS.length > TOTAL_MENU_TO_SHOW && (
                        <DropdownMenu>

                            <DropdownMenuTrigger asChild>
                                <Button variant="nav-icon" aria-label="More items">
                                    <EllipsisIcon />
                                </Button>
                            </DropdownMenuTrigger>

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

                {/* Mobile hamburger */}
                <button
                    className="md:hidden flex items-center justify-center p-2 rounded-lg text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                    onClick={() => setMobileOpen((v) => !v)}
                    aria-label={mobileOpen ? "Close menu" : "Open menu"}
                >
                    {mobileOpen ? <XIcon className="size-5" /> : <MenuIcon className="size-5" />}
                </button>
            </NavbarContainer>

            {/* Mobile dropdown menu */}
            {mobileOpen && (
                <div className="md:hidden fixed top-[57px] left-0 w-full bg-white/95 backdrop-blur-lg border-b border-primary/10 z-40 shadow-md print:hidden">
                    <div className="flex flex-col px-4 py-4 gap-1">
                        {MENU_ITEMS.map((menu, index) => (
                            <div key={index}>
                                {renderMobileMenuItem(menu)}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </>
    )
}