import type { ReactNode } from "react";

export const Link = ({ children, className }: { children?: ReactNode; className?: string }) => (
    <a className={className}>{children}</a>
);
export const useNavigate = () => () => {};
export const useLocation = () => "";
export const useParams = () => ({});
