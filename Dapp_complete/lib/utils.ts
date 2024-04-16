import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const truncate = (text: string) => {
    const len = text.length
    return text.length > 12 ? text.slice(0, 6) + '...' + text.slice(len - 6, len) : text
}
