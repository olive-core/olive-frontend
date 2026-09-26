import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import api from "@/lib/axios";
import { queryClient } from "@/lib/query-client";
import { useAuthStore } from "@/stores/auth-store";
import NavbarLogo from "@/components/shared/navbar-logo";
import { Button } from "@/components/ui/button";

type CaseAccessResponse = {
    root_session_id: string;
    prescription_id: string;
};

export default function CaseLinkAccess({ code, legacy = false }: { code: string; legacy?: boolean }) {
    const navigate = useNavigate();
    const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
    const activeView = useAuthStore((state) => state.activeView);
    const accounts = useAuthStore((state) => state.accounts);
    const setActiveView = useAuthStore((state) => state.setActiveView);
    const logout = useAuthStore((state) => state.logout);
    const [error, setError] = useState<string | null>(null);
    const [requiresDoctorAccount, setRequiresDoctorAccount] = useState(false);

    useEffect(() => {
        if (!isLoggedIn) {
            sessionStorage.setItem("pendingCaseCode", code);
            sessionStorage.setItem("pendingCaseKind", legacy ? "legacy" : "readable");
            navigate({ to: "/sign-in", replace: true });
            return;
        }

        if (activeView !== "doctor") {
            if (accounts.isClinician) {
                setActiveView("doctor");
            } else {
                setRequiresDoctorAccount(true);
                setError("This Case was shared with doctors. Sign in with an Olive doctor account to open it.");
            }
            return;
        }

        let cancelled = false;
        sessionStorage.removeItem("pendingCaseCode");
        sessionStorage.removeItem("pendingCaseKind");
        const request = legacy
            ? api.post<CaseAccessResponse>(`/case/access/${encodeURIComponent(code)}`)
            : api.post<CaseAccessResponse>("/case/open", { code });
        request
            .then((response) => {
                if (cancelled) return;
                queryClient.invalidateQueries({ queryKey: ["clinician-consultations"] });
                queryClient.invalidateQueries({ queryKey: ["patient-consultations"] });
                queryClient.invalidateQueries({ queryKey: ["consultation-detail"] });
                navigate({
                    to: "/doctor/cases/$caseId",
                    params: { caseId: response.data.root_session_id },
                    replace: true,
                });
            })
            .catch((requestError: { response?: { status?: number; data?: { detail?: string } } }) => {
                if (cancelled) return;
                setRequiresDoctorAccount(false);
                setError(
                    requestError.response?.status === 404
                        ? "This Case link is invalid."
                        : requestError.response?.data?.detail ?? "We couldn't open this Case. Please try again.",
                );
            });

        return () => { cancelled = true; };
    }, [accounts.isClinician, activeView, code, legacy, isLoggedIn, navigate, setActiveView]);

    const handleErrorAction = () => {
        if (requiresDoctorAccount) {
            logout();
            navigate({ to: "/sign-in", replace: true });
            return;
        }
        navigate({ to: "/doctor/consultations", replace: true });
    };

    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 px-6 text-center">
            <NavbarLogo />
            {error ? (
                <>
                    <p className="max-w-md text-sm text-rose-600">{error}</p>
                    <Button type="button" variant="outline" onClick={handleErrorAction}>
                        {requiresDoctorAccount ? "Sign in as a doctor" : "Back to consultations"}
                    </Button>
                </>
            ) : (
                <p className="text-sm text-slate-500">Opening shared Case…</p>
            )}
        </div>
    );
}
