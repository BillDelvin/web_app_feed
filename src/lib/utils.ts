import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function customeClassName(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
