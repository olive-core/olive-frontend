import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";

// Invitations live in the URL fragment, which is never sent in access logs or referrers.
export default function DeveloperPass() {
    const [token] = useState(() => new URLSearchParams(window.location.hash.slice(1)).get("developer-pass"));
    const activated = useRef(false);
    const [active, setActive] = useState(false);
    const [pending, setPending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    useEffect(() => {
        if (!token) return;
        if (token) window.history.replaceState(window.history.state, "", window.location.pathname + window.location.search);
        const controller = new AbortController();
        fetch("/api/v1/try-olive/developer-pass", { credentials: "same-origin", signal: controller.signal })
            .then(response => response.ok ? response.json() : null)
            .then(status => { if (status && !activated.current) { setActive(status.active); } })
            .catch(() => {});
        return () => controller.abort();
    }, [token]);
    const activate = async () => {
        setPending(true); setError(null);
        try {
            const response = await fetch("/api/v1/try-olive/developer-pass", {
                method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token }),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.detail || "Couldn't activate the developer pass. Please try again.");
            activated.current = true;
            setActive(result.active);
            toast.success("Developer pass activated for 90 days in this browser.");
        } catch (cause) { setError(cause instanceof Error ? cause.message : "Couldn't activate the developer pass."); }
        finally { setPending(false); }
    };
    if (!token || active) return null;
    return <div className="mx-auto mb-3 max-w-4xl rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm" role="status">
        <p className="font-semibold">Activate your developer pass</p><p className="my-2">This private, single-use link enables 90 days of testing without daily demo limits in this browser.</p>
        <Button disabled={pending} onClick={() => void activate()}>{pending ? "Activating…" : "Activate on this browser"}</Button>
        {error && <p className="mt-2 text-rose-700" role="alert">{error}</p>}
    </div>;
}
