import { cn } from "@/lib/utils";
import type { PatientSex } from "@/types/consultation";
import { getInitials, getSexAvatarClasses } from "./helpers";

interface PatientAvatarProps {
    firstName?: string | null;
    lastName?:  string | null;
    sex?:       PatientSex | null;
    className?: string;
}

export default function PatientAvatar({ firstName, lastName, sex, className }: PatientAvatarProps) {
    return (
        <div
            className={cn(
                "shrink-0 rounded-full flex items-center justify-center font-semibold ring-2 ring-offset-2 ring-offset-white",
                getSexAvatarClasses(sex),
                className,
            )}
        >
            {getInitials(firstName, lastName)}
        </div>
    );
}
