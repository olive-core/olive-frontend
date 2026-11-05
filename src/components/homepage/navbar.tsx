import { Button } from "../ui/button";
import NavbarContainer from "../shared/navbar-container";
import { Link } from "@tanstack/react-router";
import { FREE_TRIAL_CONSULTATIONS } from "@/lib/subscription";

const NAV_LINKS = [
    { href: "/#how-it-works", label: "How it works" },
    { href: "/#try-olive", label: "Try it" },
    { href: "/about", label: "About" },
];

// Registering lives here and in the closing section; trying Olive lives in the hero and its
// own section. Keeping them apart stops the two buttons competing on one screen.
// Phones get no menu: the page is the menu, and the footer repeats these links.
export default function HomeNavbar() {
    return (
        <NavbarContainer className="border-b border-slate-200/70 bg-white/85">
            <>
                <div className="hidden items-center gap-8 md:flex">
                    {NAV_LINKS.map((link) => (
                        <a
                            key={link.href}
                            href={link.href}
                            className="text-sm font-medium text-slate-600 transition-colors hover:text-brand"
                        >
                            {link.label}
                        </a>
                    ))}
                </div>

                <div className="flex items-center gap-4">
                    {/* Answers "what does registering cost me?" before the click; too long for phones. */}
                    <span className="hidden text-sm text-slate-500 lg:inline">First {FREE_TRIAL_CONSULTATIONS} consultations free</span>
                    <Button asChild className="h-11 bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-700">
                        <Link to="/sign-in">
                            <span className="min-[380px]:hidden">Sign in</span>
                            <span className="hidden min-[380px]:inline">Register or sign in</span>
                        </Link>
                    </Button>
                </div>
            </>
        </NavbarContainer>
    );
}
