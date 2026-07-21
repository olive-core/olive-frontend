import { useCallback, useEffect, useRef, useState } from "react";

/** Counts down from `seconds` to zero, once per second, and stops there. */
export function useCountdown(seconds: number, enabled = true) {
    const [remaining, setRemaining] = useState(seconds);
    const intervalRef = useRef<number | null>(null);

    useEffect(() => {
        if (!enabled) return;

        intervalRef.current = setInterval(() => {
            setRemaining((prev) => (prev >= 1 ? prev - 1 : 0));
        }, 1000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [enabled]);

    // Stable so callers can list it in their own hook dependencies.
    const restart = useCallback(() => setRemaining(seconds), [seconds]);

    return { remaining, hasEnded: remaining === 0, restart };
}
