// A phone-shaped frame so a screenshot reads as the app on a phone, not as part of the
// page. Shows the top of the screen; the screenshot is taller than the frame.
export default function PhoneFrame({ src, alt }: { src: string; alt: string }) {
    return (
        <div className="mx-auto w-[min(15rem,64vw)] rounded-[2.25rem] bg-brand-ink p-1.5 shadow-xl shadow-slate-900/15">
            <div className="aspect-[9/16] overflow-hidden rounded-[1.85rem] bg-white">
                <img
                    src={src}
                    alt={alt}
                    width={780}
                    height={1688}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover object-top"
                />
            </div>
        </div>
    );
}
