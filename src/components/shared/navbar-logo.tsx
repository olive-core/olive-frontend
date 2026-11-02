import { useAuthStore } from "@/stores/auth-store";
import { Link } from "@tanstack/react-router";

export default function NavbarLogo() {

    const { isLoggedIn, activeView } = useAuthStore();

    function getHref() {
        if (!isLoggedIn) return "/";
        return activeView === "patient" ? "/patient" : activeView === "attendant" ? "/attendant" : "/doctor";
    }

    // 104px keeps the logo above its 100px minimum width, below which the leaf on the i
    // stops reading as a leaf.
    return (
        <Link to={getHref()} className="flex shrink-0 items-center">
            <img src="/logo/olive-logo.svg" alt="Olive" width={104} height={43} className="h-auto w-[104px]" />
        </Link>
    )
}
