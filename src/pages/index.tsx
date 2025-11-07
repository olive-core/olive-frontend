import FeaturesSection from "@/components/homepage/features";
import HomeFooter from "@/components/homepage/footer";
import HeroSection from "@/components/homepage/hero";
import HomeNavbar from "@/components/homepage/navbar";
import StepsSection from "@/components/homepage/steps";

export default function HomePage() {

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