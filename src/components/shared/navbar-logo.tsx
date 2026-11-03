import { useAuthStore } from "@/stores/auth-store";
import { Link } from "@tanstack/react-router";
import OliveLogo from "./olive-logo";

export default function NavbarLogo() {

    const { isLoggedIn, activeView } = useAuthStore();

    function getHref() {
        if (!isLoggedIn) return "/";
        return activeView === "patient" ? "/patient" : activeView === "attendant" ? "/attendant" : "/doctor";
    }

    return (
        <Link to={getHref()} className="flex shrink-0 items-center">
            <OliveLogo />
        </Link>
    )
}
