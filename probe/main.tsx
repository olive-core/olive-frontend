import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import "./probe.css";
import HeaderEditor from "@/components/prescription/header/editor/header-editor";
import ChambersManager from "@/components/dashboard/chambers/chambers-manager";
import { useAuthStore } from "@/stores/auth-store";

useAuthStore.setState({ userId: "doctor-1", isLoggedIn: true, activeView: "doctor" } as never);

const PROFILE = {
    name: "Dr. Ahsan Habib Chowdhury",
    qualification: "MBBS (DMC), FCPS (Medicine), MRCP (UK)",
    specializations: ["Internal Medicine", "Diabetology"],
    bmdc_no: "A-53127",
    header_config: null,
};

function Page() {
    if (window.location.hash.includes("chambers-page")) return <ChambersManager />;
    return <HeaderEditor initialProfile={PROFILE} isSaving={false} onSave={() => {}} />;
}

createRoot(document.getElementById("root")!).render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <main className="flex min-h-svh w-full flex-col pt-[calc(4.5rem+env(safe-area-inset-top))]">
            <div className="flex h-full w-full flex-1 flex-col">
                <Page />
            </div>
        </main>
    </QueryClientProvider>,
);
