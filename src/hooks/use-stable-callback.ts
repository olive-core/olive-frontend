import { useCallback, useRef } from "react";

// A callback with a permanent identity that always runs the latest render's logic.
//
// This exists because React's `useEffectEvent` returns a NEW function on every render.
// Anything derived from one — including a `useCallback` that lists it as a dependency —
// is therefore unstable, and an effect that depends on it re-runs after every single
// render. When that effect starts something (a recording, a subscription, a request),
// the result is an endless restart loop rather than an obvious crash. So every function
// this app hands across a component boundary goes through here.
//
// Safe to call from effects and event handlers, which is the only place callbacks run.
export function useStableCallback<Args extends unknown[], Result>(
    callback: (...args: Args) => Result,
): (...args: Args) => Result {
    const latest = useRef(callback);
    latest.current = callback;
    return useCallback((...args: Args) => latest.current(...args), []);
}
