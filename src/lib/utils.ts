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