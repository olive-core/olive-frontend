import { useAuthStore } from "@/stores/auth-store";
import { Link } from "@tanstack/react-router";

export default function NavbarLogo() {

    const { isLoggedIn } = useAuthStore();

    function getHref() {
        return isLoggedIn ? "/dashboard" : "/";
    }

    return (
        <Link to={getHref()} className="flex items-center gap-2">
            <div className="w-4 h-6 rounded-full bg-primary"></div>
            <div className="text-primary font-display text-lg">Olive</div>
        </Link>
    )
}