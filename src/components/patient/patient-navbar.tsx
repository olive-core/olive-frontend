import { ClipboardListIcon, LogOutIcon, UserIcon } from "lucide-react";
import { Link } from "@tanstack/react-router";
import NavbarContainer from "../shared/navbar-container";
import { Button } from "../ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuthStore } from "@/stores/auth-store";

export default function PatientNavbar() {

    const { logout } = useAuthStore();

    return (
        <NavbarContainer className="border-none print:hidden">
            <div className="flex items-center gap-4">

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button asChild variant="nav-icon" aria-label="Prescriptions" className="size-11 sm:size-9">
                            <Link to="/patient">
                                <ClipboardListIcon />
                            </Link>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Prescriptions</p>
                    </TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button asChild variant="nav-icon" aria-label="Profile" className="size-11 sm:size-9">
                            <Link to="/patient/profile">
                                <UserIcon />
                            </Link>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Profile</p>
                    </TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="nav-icon" onClick={logout} aria-label="Log out" className="size-11 sm:size-9">
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
