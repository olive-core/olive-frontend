import { createFileRoute } from "@tanstack/react-router";
import AboutContact from "@/components/homepage/about-contact";
import AboutHero from "@/components/homepage/about-hero";
import HomeFooter from "@/components/homepage/footer";
import HomeNavbar from "@/components/homepage/navbar";
import TeamSection from "@/components/homepage/team";

export const Route = createFileRoute("/about")({
    component: AboutPage,
});

function AboutPage() {
    return (
        <>
            <HomeNavbar />
            <AboutHero />
            <TeamSection />
            <AboutContact />
            <HomeFooter />
        </>
    );
}
