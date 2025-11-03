import { useAuthStore } from "@/stores/auth-store"
import { useEffect } from "react";
import { useNavigate } from "react-router";

export default function HomePage() {

    const { isLoggedIn } = useAuthStore();
    const navigate = useNavigate();

    useEffect(() => {
        if (isLoggedIn) {
            navigate("/dashboard");
        } else {
            navigate("/sign-in");
        }
    }, [isLoggedIn, navigate])

    return <></>
}