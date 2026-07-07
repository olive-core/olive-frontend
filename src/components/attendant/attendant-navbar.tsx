import { useNavigate } from "@tanstack/react-router";
import NavbarLogo from "@/components/shared/navbar-logo";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";

export default function AttendantNavbar() {
    const navigate = useNavigate();
    const logout = useAuthStore((s) => s.logout);

    return (
        <header className="fixed top-0 inset-x-0 h-16 bg-white border-b flex items-center justify-between px-4 z-40">
            <NavbarLogo />
            <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                    logout();
                    navigate({ to: "/sign-in" });
                }}
            >
                Log out
            </Button>
        </header>
    );
}
