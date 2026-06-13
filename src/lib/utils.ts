import { clsx, type ClassValue } from "clsx"
import toast from "react-hot-toast";
import { twMerge } from "tailwind-merge"
import { AxiosError } from "axios";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function handleError(error: unknown, defaultMessage: string) {
  console.error(error);
  if (error instanceof AxiosError) {
    const detail = error.response?.data?.detail;
    toast.error(typeof detail === "string" ? detail : defaultMessage);
    return;
  }
  if (error instanceof Error) {
    toast.error(error.message);
    return;
  }
  toast.error(defaultMessage);
}

// Clinicians read past visits as "how long ago," so we show exact days up to a month, then
// months, then years — one clear transition per unit rather than fuzzy "weeks". The exact
// calendar date rides along as a quiet secondary line. Time of day is intentionally omitted.
export function formatRelativeVisit(dateStr: string) {
  const date = new Date(dateStr);
  const exact = date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startOfThatDay = new Date(date);
  startOfThatDay.setHours(0, 0, 0, 0);
  const dayDiff = Math.round((startOfToday.getTime() - startOfThatDay.getTime()) / 86_400_000);

  let relative: string;
  if (dayDiff <= 0) relative = "Today";
  else if (dayDiff === 1) relative = "Yesterday";
  else if (dayDiff < 31) relative = `${dayDiff} days ago`;
  else if (dayDiff < 365) {
    const months = Math.max(1, Math.round(dayDiff / 30.44));
    relative = months === 1 ? "1 month ago" : `${months} months ago`;
  } else {
    const years = Math.floor(dayDiff / 365);
    relative = years === 1 ? "1 year ago" : `${years} years ago`;
  }

  return { relative, exact };
}

// Formats a duration in seconds as zero-padded mm:ss.
export function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds) % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

export function getAgeFromDOB(dob: string | Date) {
  const birthDate = new Date(dob);
  const today = new Date();

  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();

  if (months < 0) {
    years--;
    months += 12;
  }

  // Adjust if current day is before birth day
  if (today.getDate() < birthDate.getDate()) {
    months--;
    if (months < 0) {
      years--;
      months += 12;
    }
  }

  return { years, months };
}