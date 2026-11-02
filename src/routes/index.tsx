import { createFileRoute } from '@tanstack/react-router'
import GetStartedSection from "@/components/homepage/get-started";
import HeroSection from "@/components/homepage/hero";
import InControlSection from "@/components/homepage/in-control";
import LandingFooter from "@/components/homepage/landing-footer";
import HomeNavbar from "@/components/homepage/navbar";
import StepsSection from "@/components/homepage/steps";
import TryOliveSection from "@/components/homepage/try-olive";
import { useAuthStore } from "@/stores/auth-store";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";


export const Route = createFileRoute('/')({
    component: HomePage,
})

function HomePage() {

    const { isLoggedIn, activeView } = useAuthStore();
    const navigate = useNavigate({ from: '/' })

    useEffect(() => {
        if (isLoggedIn) {
            navigate({ to: activeView === 'patient' ? '/patient' : activeView === 'attendant' ? '/attendant' : '/doctor' });
        }
    }, [isLoggedIn, activeView, navigate]);

    return (
        <>
            <HomeNavbar />
            <HeroSection />
            <StepsSection />
            <TryOliveSection />
            <InControlSection />
            <GetStartedSection />
            <LandingFooter />
        </>
    )
}