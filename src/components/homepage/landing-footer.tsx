import { Link } from "@tanstack/react-router";
import OliveLogo from "../shared/olive-logo";
import { CONTACT_EMAIL, whatsappContactUrl } from "@/lib/contact";

export default function LandingFooter() {
    return (
        // data-landing-cta: the phone's sticky Try bar steps aside instead of covering the footer.
        <footer data-landing-cta className="border-t border-slate-200/70 py-10">
            <div className="container flex flex-col items-center gap-6 text-sm text-slate-500 md:flex-row md:justify-between">
                <OliveLogo />
                <nav aria-label="Footer" className="flex flex-wrap justify-center gap-x-6 [&>*]:py-2">
                    <a href="/#how-it-works" className="hover:text-brand">How it works</a>
                    <Link to="/try" className="hover:text-brand">Try Olive</Link>
                    <Link to="/about" className="hover:text-brand">About</Link>
                    <a href={whatsappContactUrl("Hello, I have a question about Olive.")} target="_blank" rel="noreferrer" className="hover:text-brand">WhatsApp</a>
                    <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-brand">Email</a>
                </nav>
                <p>&copy; {new Date().getFullYear()} Olive</p>
            </div>
        </footer>
    );
}
