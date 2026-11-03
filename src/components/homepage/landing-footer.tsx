import { Link } from "@tanstack/react-router";
import OliveLogo from "../shared/olive-logo";

const CONTACT_EMAIL = "asifazad@oliveai.life";

export default function LandingFooter() {
    return (
        <footer className="border-t border-slate-200/70 py-10">
            <div className="container flex flex-col items-center gap-6 text-sm text-slate-500 md:flex-row md:justify-between">
                <OliveLogo />
                <nav aria-label="Footer" className="flex flex-wrap justify-center gap-x-6 gap-y-2">
                    <a href="/#how-it-works" className="hover:text-brand">How it works</a>
                    <Link to="/try" className="hover:text-brand">Try Olive</Link>
                    <Link to="/about" className="hover:text-brand">About</Link>
                    <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-brand">Contact</a>
                </nav>
                <p>&copy; {new Date().getFullYear()} Olive</p>
            </div>
        </footer>
    );
}
