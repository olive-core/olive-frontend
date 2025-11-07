import FeaturesSection from "@/components/homepage/features";
import HomeFooter from "@/components/homepage/footer";
import HeroSection from "@/components/homepage/hero";
import HomeNavbar from "@/components/homepage/navbar";
import StepsSection from "@/components/homepage/steps";
import { useAuthStore } from "@/stores/auth-store";
import { useEffect } from "react";
import { useNavigate } from "react-router";

export default function HomePage() {

    const { isLoggedIn } = useAuthStore();
    const navigate = useNavigate();

    useEffect(() => {
        if (isLoggedIn) {
            navigate("/dashboard");
        }
    }, [isLoggedIn, navigate]);

    return (
        <>
            <HomeNavbar />
            <HeroSection />
            <StepsSection />
            <FeaturesSection />
            <HomeFooter />
        </>
    )
}