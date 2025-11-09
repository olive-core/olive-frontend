import { Link } from "react-router";
import { Button } from "../ui/button";

export default function HomeNavbar() {

    return <nav className="py-4 border-b-2 border-primary/10 fixed top-0 left-0 w-full z-50 flex items-center justify-center backdrop-blur-lg bg-white/15">
        <div className="container mx-auto flex justify-between items-center">

            {/* LEFT LOGO */}
            <Link to="/" className="flex items-center gap-2">
                <div className="w-4 h-6 rounded-full bg-primary"></div>
                <div className="text-primary font-display">Olive</div>
            </Link>

            {/* MIDDLE CONTENT */}
            <div className="md:flex items-center hidden gap-8">
                <a href="#how-it-works" className="hover:text-primary transition duration-300">
                    How it works
                </a>

                <a href="#features" className="hover:text-primary transition duration-300">
                    Features
                </a>

                <a href="#values" className="hover:text-primary transition duration-300">
                    Values we bring
                </a>
            </div>

            {/* RIGHT CONTENT */}
            <div className="flex items-center gap-2">

                <Button asChild>
                    <Link to="/sign-in">
                        Get Started
                    </Link>
                </Button>
            </div>
        </div>
    </nav>
}