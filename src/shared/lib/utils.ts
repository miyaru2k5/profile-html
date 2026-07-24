import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function absoluteUrl(path = "/", host?: string | null) {
  const base =
    host && host.length > 0
      ? host.startsWith("http")
        ? host
        : `https://${host}`
      : process.env.NEXT_PUBLIC_APP_URL ?? "https://miyaru.online";
  return new URL(path, base).toString();
}
