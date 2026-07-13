import { QueryClient } from "@tanstack/react-query";

// Single app-wide QueryClient. Exported as a module singleton (rather than created inline
// in main.tsx) so non-React code — notably auth-store's logout — can clear the cache
// directly, keeping session teardown in one place.
export const queryClient = new QueryClient();
