import { QueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";

// Single app-wide QueryClient. Exported as a module singleton (rather than created inline
// in main.tsx) so non-React code — notably auth-store's logout — can clear the cache
// directly, keeping session teardown in one place.
//
// Defaults matter here. With the out-of-the-box settings (staleTime 0, retry 3,
// refetchOnWindowFocus true) every return to the tab refetched every query, and when
// the ~1h access token had expired each of those refetched 3 more times behind the
// axios refresh — several seconds of blank UI and a wall of 401s on every focus.
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // Treat data as fresh for 30s so simply refocusing the tab doesn't refetch
            // everything; genuine updates still come through after the window lapses.
            staleTime: 30_000,
            // A 401 is handled once by the axios interceptor (refresh + retry). Retrying
            // the query on top of that just multiplies failing requests, so don't — and
            // cap everything else at a single retry.
            retry: (failureCount, error) =>
                (error as AxiosError)?.response?.status === 401 ? false : failureCount < 1,
        },
    },
});
