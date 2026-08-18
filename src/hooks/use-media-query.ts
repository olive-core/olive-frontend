import { useEffect, useState } from "react";

// Test DOMs and any pre-paint render have no matchMedia. Nothing matches there, which
// leaves the desktop presentation as the fallback.
export function matchesMediaQuery(query: string): boolean {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
    return window.matchMedia(query).matches;
}

export function useMediaQuery(query: string): boolean {
    const [matches, setMatches] = useState(() => matchesMediaQuery(query));

    useEffect(() => {
        if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;

        const list = window.matchMedia(query);
        const sync = () => setMatches(list.matches);

        sync();
        list.addEventListener("change", sync);
        return () => list.removeEventListener("change", sync);
    }, [query]);

    return matches;
}
