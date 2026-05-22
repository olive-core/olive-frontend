import { LinkedinIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type TeamMember = {
    name: string;
    title: string;
    photoSrc: string;
    linkedinUrl: string;
    isFounder?: boolean;
    desktopOrder: string;
};

const team: TeamMember[] = [
    {
        name: "Asif Azad",
        title: "Founder",
        photoSrc: "/team/asif-azad.jpeg",
        linkedinUrl: "https://www.linkedin.com/in/asifazad2677/",
        isFounder: true,
        desktopOrder: "md:order-2",
    },
    {
        name: "Md Sadik Hossain Shanto",
        title: "Co-founder",
        photoSrc: "/team/md-sadik-hossain-shanto.jpeg",
        linkedinUrl: "https://www.linkedin.com/in/md-sadik-hossain-shanto/",
        desktopOrder: "md:order-1",
    },
    {
        name: "Mohaiminul Islam",
        title: "Co-founder",
        photoSrc: "/team/mohaiminul-islam.jpg",
        linkedinUrl: "https://www.linkedin.com/in/mohaimin1935/",
        desktopOrder: "md:order-3",
    },
];

export default function TeamSection() {
    return (
        <section id="team" className="pt-2 pb-6 container">
            <h3 className="font-display text-center text-2xl">The People Behind Olive</h3>
            <p className="text-center text-slate-600 mt-3 max-w-xl mx-auto">
                A passionate team building products we wish the world had.
            </p>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-12 gap-y-10 md:items-end max-w-5xl mx-auto">
                {team.map((member) => (
                    <TeamMemberCard key={member.name} member={member} />
                ))}
            </div>
        </section>
    );
}

function TeamMemberCard({ member }: { member: TeamMember }) {
    const photoSize = member.isFounder ? "size-40" : "size-32";
    const outlineColor = member.isFounder ? "outline-emerald-300" : "outline-emerald-200";

    return (
        <div className={cn("flex flex-col items-center text-center", member.desktopOrder)}>
            <div
                className={cn(
                    "relative rounded-full overflow-hidden bg-emerald-100 outline-2 outline-offset-4 outline-dashed",
                    photoSize,
                    outlineColor
                )}
            >
                <img
                    src={member.photoSrc}
                    alt={`Portrait of ${member.name}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                />
            </div>
            <h4 className="font-semibold text-lg text-slate-800 mt-5">{member.name}</h4>
            <div className="w-12 h-1 bg-primary opacity-40 mt-2"></div>
            <p className="text-slate-600 mt-2">{member.title}</p>
            <a
                href={member.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${member.name} on LinkedIn`}
                className="mt-3 inline-flex items-center justify-center size-9 rounded-full text-emerald-700 hover:text-white hover:bg-emerald-600 transition-colors"
            >
                <LinkedinIcon className="size-5" />
            </a>
        </div>
    );
}
