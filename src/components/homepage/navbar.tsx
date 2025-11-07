import { Link } from "react-router";
import { Button } from "../ui/button";

export default function HomeNavbar() {

    return <nav className="py-4 border-b-2 fixed top-0 left-0 w-full z-50 flex items-center justify-center backdrop-blur-lg bg-white/60">
        <div className="container mx-auto flex justify-between items-center">

            {/* LEFT LOGO */}
            <Link to="/" className="flex items-center gap-2">
                <div className="w-4 h-6 rounded-full bg-primary"></div>
                <div className="text-primary font-display">Olive</div>
            </Link>

            {/* MIDDLE CONTENT */}
            <div className="flex items-center gap-12">
                <a href="#how-it-works" className="hover:text-primary transition duration-300">
                    How it works
                </a>

                <a href="#features" className="hover:text-primary transition duration-300">
                    Features
                </a>
            </div>

            {/* RIGHT CONTENT */}
            <div className="flex items-center gap-2">
                <Link to="/sign-up" className="hover:text-primary transition duration-300">
                    Create Account
                </Link>

                <Button asChild>
                    <Link to="/sign-in">
                        Sign In
                    </Link>
                </Button>
            </div>
        </div>
    </nav>
}