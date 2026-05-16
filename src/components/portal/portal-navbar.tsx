import { LogOutIcon, UserIcon } from "lucide-react";
import { Link } from "@tanstack/react-router";
import NavbarContainer from "../shared/navbar-container";
import { Button } from "../ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuthStore } from "@/stores/auth-store";

export default function PortalNavbar() {

    const { logout } = useAuthStore();

    return (
        <NavbarContainer className="border-none print:hidden">
            <div className="flex items-center gap-4">

                <Tooltip>
                    <TooltipTrigger>
                        <Link to="/portal/profile">
                            <Button variant="nav-icon">
                                <UserIcon />
                            </Button>
                        </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Profile</p>
                    </TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger>
                        <Button variant="nav-icon" onClick={logout}>
                            <LogOutIcon />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Logout</p>
                    </TooltipContent>
                </Tooltip>

            </div>
        </NavbarContainer>
    );
}
