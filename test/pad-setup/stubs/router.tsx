import type { ReactNode } from "react";

export const navigations: { to: string }[] = [];

export const useNavigate = () => (options: { to: string }) => {
    navigations.push(options);
};

export const Link = ({ children }: { children?: ReactNode }) => <>{children}</>;
