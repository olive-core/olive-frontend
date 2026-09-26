import type { ReactNode } from 'react';
export const navigations: unknown[] = [];
export const routeParams = { caseId: 'root', code: '7KMP4XRT' };
export const useNavigate = () => (options: unknown) => { navigations.push(options); };
export const createFileRoute = () => (options: { component: () => ReactNode }) => ({ ...options, useParams: () => routeParams });
export const Link = ({ children, to, params, search: _search, ...rest }: { children?: ReactNode; to: string; params?: Record<string,string>; search?: unknown; [key:string]: unknown }) => (
    <a {...rest} href={to} onClick={(event) => { event.preventDefault(); navigations.push({to,params}); }}>{children}</a>
);
