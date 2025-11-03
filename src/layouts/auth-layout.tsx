import { useAuthStore } from "@/stores/auth-store";
import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router";

export default function AuthLayout() {

    const navigate = useNavigate();
    const { isLoggedIn } = useAuthStore();

    useEffect(() => {
        if (isLoggedIn) {
            navigate("/dashboard");
        }
    }, [isLoggedIn, navigate]);

    return (
        <div className="flex items-center justify-center w-full min-h-screen">
            <Outlet />
        </div>
    )
}