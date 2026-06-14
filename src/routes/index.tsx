import { createFileRoute } from '@tanstack/react-router'
import FeaturesSection from "@/components/homepage/features";
import AppFooter from "@/components/shared/app-footer";
import HeroSection from "@/components/homepage/hero";
import HomeNavbar from "@/components/homepage/navbar";
import StepsSection from "@/components/homepage/steps";
import ValuesSection from "@/components/homepage/values";
import { useAuthStore } from "@/stores/auth-store";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";


export const Route = createFileRoute('/')({
    component: HomePage,
})

function HomePage() {

    const { isLoggedIn, role } = useAuthStore();
    const navigate = useNavigate({ from: '/' })

    useEffect(() => {
        if (isLoggedIn) {
            navigate({ to: role === 'patient' ? '/portal' : '/doctor' });
        }
    }, [isLoggedIn, role, navigate]);

    return (
        <>
            <HomeNavbar />
            <HeroSection />
            <StepsSection />
            <FeaturesSection />
            <ValuesSection />
            <AppFooter />
        </>
    )
}