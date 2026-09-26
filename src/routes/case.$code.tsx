import { createFileRoute } from '@tanstack/react-router';
import CaseLinkAccess from '@/components/case/case-link-access';

export const Route = createFileRoute('/case/$code')({ component: OpenCaseLink });
function OpenCaseLink() {
    const { code } = Route.useParams();
    return <CaseLinkAccess code={code} />;
}
