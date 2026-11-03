import { createFileRoute } from '@tanstack/react-router'
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import OliveLogo from "@/components/shared/olive-logo";

export const Route = createFileRoute('/coming-soon')({
    component: ComingSoonPage,
})
function ComingSoonPage() {
    return (
        <div className="h-screen w-full flex flex-col items-center justify-center gap-8 bg-primary/5">
            <OliveLogo />
            <div className="max-w-md px-12 py-10 text-center bg-linear-to-br from-primary/20 via-primary/15 to-accent/10 rounded-lg">
                <h3 className="font-display text-2xl mb-4">Coming Soon</h3>
                <p className="mb-2">This feature is under construction. Stay tuned for updates!</p>

                <Button variant={"link"} asChild>
                    <Link to="/">Go Back Home</Link>
                </Button>
            </div>
        </div>
    )
}
