import { clsx, type ClassValue } from "clsx"
import toast from "react-hot-toast";
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function handleError(error: unknown, defaultMessage: string) {
  console.error(error)
  if (error instanceof Error) {
    toast.error(error.message);
    return;
  }
  toast.error(defaultMessage);
}

export function getAgeFromDOB(dob: string): number {
  const birthDate = new Date(dob);
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();

  return age;
}