import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/not-found')({
    component: NotFoundPage,
})

function NotFoundPage() {
    return (<div>404 Not Found</div>)
}
