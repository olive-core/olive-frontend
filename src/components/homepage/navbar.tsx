import { Link } from "react-router";
import { Button } from "../ui/button";
import NavbarContainer from "../shared/navbar-container";

export default function HomeNavbar() {

    return (
        <NavbarContainer>
            <>
                {/* MID CONTENT */}
                <div className="md:flex items-center hidden gap-8">
                    <a href="#how-it-works" className="text-slate-600 hover:text-emerald-600 transition duration-300">
                        How it works
                    </a>

                    <a href="#features" className="text-slate-600 hover:text-emerald-600 transition duration-300">
                        Features
                    </a>

                    <a href="#values" className="text-slate-600 hover:text-emerald-600 transition duration-300">
                        Values we bring
                    </a>
                </div>

                {/* RIGHT CONTENT */}
                <div className="flex items-center gap-2">

                    <Button asChild>
                        <Link to="/sign-in">
                            Sign In
                        </Link>
                    </Button>
                </div>
            </>
        </NavbarContainer>
    )
}