import { useState } from "react";
import { Button } from "../ui/button";
import NavbarContainer from "../shared/navbar-container";
import { Link } from "@tanstack/react-router";
import { MenuIcon, XIcon } from "lucide-react";

const NAV_LINKS = [
    { href: "/#how-it-works", label: "How it works" },
    { href: "/#try-olive", label: "Try it" },
    { href: "/about", label: "About" },
];

// Registering lives here and in the closing section; trying Olive lives in the hero and its
// own section. Keeping them apart stops the two buttons competing on one screen.
export default function HomeNavbar() {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <>
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

                    <div className="flex items-center gap-1">
                        <Button asChild className="h-11 bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-deep">
                            <Link to="/sign-in">
                                <span className="min-[380px]:hidden">Sign in</span>
                                <span className="hidden min-[380px]:inline">Register or sign in</span>
                            </Link>
                        </Button>

                        <button
                            className="flex h-11 w-11 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100 md:hidden"
                            onClick={() => setMobileOpen((v) => !v)}
                            aria-label={mobileOpen ? "Close menu" : "Open menu"}
                            aria-expanded={mobileOpen}
                        >
                            {mobileOpen ? <XIcon className="size-5" /> : <MenuIcon className="size-5" />}
                        </button>
                    </div>
                </>
            </NavbarContainer>

            {mobileOpen && (
                <div style={{ top: "calc(78px + env(safe-area-inset-top))" }} className="fixed left-0 z-40 w-full border-b border-slate-200 bg-white/95 shadow-md backdrop-blur-lg md:hidden">
                    <div className="flex flex-col gap-1 px-4 py-3">
                        {NAV_LINKS.map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                className="rounded-lg px-4 py-3 font-medium text-slate-700 transition-colors hover:bg-brand-mist hover:text-brand"
                                onClick={() => setMobileOpen(false)}
                            >
                                {link.label}
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
}
