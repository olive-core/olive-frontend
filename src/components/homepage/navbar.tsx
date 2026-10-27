import { useState } from "react";
import { Button } from "../ui/button";
import NavbarContainer from "../shared/navbar-container";
import { Link } from "@tanstack/react-router";
import { MenuIcon, XIcon } from "lucide-react";

const NAV_LINKS = [
    { href: "/#how-it-works", label: "How it works" },
    { href: "/#features", label: "Features" },
    { href: "/#values", label: "Values we bring" },
    { href: "/about", label: "About" },
];

export default function HomeNavbar() {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <>
            <NavbarContainer>
                <>
                    {/* Desktop nav links */}
                    <div className="xl:flex items-center hidden gap-6">
                        {NAV_LINKS.map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                className="text-slate-600 hover:text-emerald-600 transition duration-300"
                            >
                                {link.label}
                            </a>
                        ))}
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-2">
                        <Button asChild className="h-11 text-sm">
                            <Link to="/sign-in">Register or sign in</Link>
                        </Button>
                        <Button asChild variant="outline" className="hidden h-11 border-emerald-600 bg-white text-emerald-800 sm:inline-flex">
                            <Link to="/try">Try without an account</Link>
                        </Button>

                        {/* Mobile hamburger */}
                        <button
                            className="xl:hidden flex h-11 w-11 items-center justify-center rounded-lg text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                            onClick={() => setMobileOpen((v) => !v)}
                            aria-label={mobileOpen ? "Close menu" : "Open menu"}
                        >
                            {mobileOpen ? <XIcon className="size-5" /> : <MenuIcon className="size-5" />}
                        </button>
                    </div>
                </>
            </NavbarContainer>

            {/* Mobile dropdown menu */}
            {mobileOpen && (
                <div style={{ top: "calc(78px + env(safe-area-inset-top))" }} className="xl:hidden fixed left-0 w-full bg-white/95 backdrop-blur-lg border-b border-primary/10 z-40 shadow-md">
                    <div className="flex flex-col px-4 py-4 gap-1">
                        {NAV_LINKS.map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                className="px-4 py-3 rounded-lg text-slate-700 font-medium hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                                onClick={() => setMobileOpen(false)}
                            >
                                {link.label}
                            </a>
                        ))}
                        <div className="grid gap-2 pt-2 border-t border-slate-100 mt-1">
                            <Button asChild className="h-11 w-full"><Link to="/sign-in" onClick={() => setMobileOpen(false)}>Register or sign in</Link></Button>
                            <Button asChild variant="outline" className="h-11 w-full border-emerald-600 text-emerald-800">
                                <Link to="/try" onClick={() => setMobileOpen(false)}>
                                    Try without an account
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
