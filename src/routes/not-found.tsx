import { createFileRoute, Link } from '@tanstack/react-router'
import OliveLogo from '@/components/shared/olive-logo'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/not-found')({
    component: NotFoundPage,
})

function NotFoundPage() {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 px-6 text-center">
            <OliveLogo />
            <div>
                <h1 className="font-display text-2xl">Page not found</h1>
                <p className="mt-2 text-slate-600">This link may be old or mistyped.</p>
            </div>
            <Button asChild>
                <Link to="/">Go to Olive</Link>
            </Button>
        </div>
    )
}
