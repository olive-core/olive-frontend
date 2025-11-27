import { cn } from "@/lib/utils";
import NavbarLogo from "./navbar-logo";

export default function NavbarContainer({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <nav className={cn("py-4 border-b-2 border-primary/10 fixed top-0 left-0 w-full z-50 flex items-center justify-center backdrop-blur-lg bg-white/15", className)}>
            <div className="container mx-auto flex justify-between items-center">

                <NavbarLogo />

                {children}
            </div>
        </nav>
    )
}