import type { ReactNode } from "react";

export const navigations: { to: string; params?: Record<string, string> }[] = [];
export const routeParams: Record<string, string> = {};

export const useNavigate = () => (options: { to: string; params?: Record<string, string> }) => {
    navigations.push(options);
};

export const useParams = () => routeParams;

export const Link = ({ children }: { children?: ReactNode }) => <>{children}</>;
