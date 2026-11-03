import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRightIcon } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

// Elements carrying their own call to action. While any is on screen the bar steps aside,
// so a phone never shows two big buttons at once.
const OWN_CTA_SELECTOR = "[data-landing-cta]";

// Phones only: keeps "Try Olive" in thumb reach once the hero's button has scrolled away.
export default function StickyTryBar() {
    const [ctaVisible, setCtaVisible] = useState(true);

    useEffect(() => {
        const targets = [...document.querySelectorAll(OWN_CTA_SELECTOR)];
        const visible = new Set<Element>();
        const observer = new IntersectionObserver((entries) => {
            for (const entry of entries) {
                if (entry.isIntersecting) visible.add(entry.target);
                else visible.delete(entry.target);
            }
            setCtaVisible(visible.size > 0);
        });
        targets.forEach((target) => observer.observe(target));
        return () => observer.disconnect();
    }, []);

    return (
        <div
            aria-hidden={ctaVisible}
            inert={ctaVisible}
            className={cn(
                "fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/80 bg-white/90 px-4 pt-3 backdrop-blur-lg transition-transform duration-300 motion-reduce:transition-none md:hidden",
                "pb-[calc(0.75rem+env(safe-area-inset-bottom))]",
                ctaVisible ? "translate-y-full" : "translate-y-0",
            )}
        >
            <Button asChild className="h-12 w-full bg-brand text-base font-semibold text-white hover:bg-brand-700">
                <Link to="/try">
                    Try Olive, no account needed
                    <ArrowRightIcon className="size-5" />
                </Link>
            </Button>
        </div>
    );
}
