import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import api from "@/lib/axios";
import { useAuthStore } from "@/stores/auth-store";

type PortalAccessResponse = {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    user: { id: string };
    prescription_id: string;
};

export const Route = createFileRoute("/p/$code")({
    component: PrescriptionLinkRedeem,
});

function PrescriptionLinkRedeem() {
    const { code } = Route.useParams();
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function redeem() {
            try {
                const response = await api.post<PortalAccessResponse>("/portal/access", { code });
                if (cancelled) return;

                useAuthStore.setState({
                    isLoggedIn: true,
                    accessToken: response.data.access_token,
                    refreshToken: response.data.refresh_token,
                    userId: response.data.user.id,
                    role: "patient",
                });

                navigate({
                    to: "/patient/prescriptions/$prescriptionId",
                    params: { prescriptionId: response.data.prescription_id },
                    replace: true,
                });
            } catch (error) {
                if (cancelled) return;
                const status = (error as { response?: { status?: number } })?.response?.status;
                setErrorMessage(
                    status === 404
                        ? "This prescription link has expired or is invalid."
                        : "We couldn't open your prescription. Please try signing in.",
                );
            }
        }

        redeem();
        return () => {
            cancelled = true;
        };
    }, [code, navigate]);

    if (errorMessage) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
                <p className="text-rose-600">{errorMessage}</p>
                <button
                    type="button"
                    onClick={() => navigate({ to: "/sign-in" })}
                    className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
                >
                    Go to sign in
                </button>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center">
            <p className="text-gray-600">Opening your prescription…</p>
        </div>
    );
}
