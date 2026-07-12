import { isToday, isYesterday, format } from "date-fns";
import type { PatientSex } from "@/types/consultation";

export function getInitials(name?: string | null): string {
    const initials = (name ?? "").trim().split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
    return initials || "?";
}

export function getFullName(name?: string | null): string {
    return (name ?? "").trim() || "Unknown patient";
}

export function getDayKey(isoDate: string): string {
    return format(new Date(isoDate), "yyyy-MM-dd");
}

export function getDayLabel(isoDate: string): string {
    const date = new Date(isoDate);
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "EEEE, MMM d, yyyy");
}

export function getTimeOfDay(isoDate: string): string {
    return format(new Date(isoDate), "h:mm a");
}

const SEX_RING_CLASSES: Record<PatientSex, string> = {
    male:       "ring-blue-200 bg-blue-50 text-blue-700",
    female:     "ring-pink-200 bg-pink-50 text-pink-700",
    non_binary: "ring-purple-200 bg-purple-50 text-purple-700",
};

export function getSexAvatarClasses(sex?: PatientSex | null): string {
    return sex
        ? SEX_RING_CLASSES[sex]
        : "ring-slate-200 bg-slate-50 text-slate-600";
}
