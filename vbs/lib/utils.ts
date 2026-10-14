import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
export const cn = (...i: ClassValue[]) => twMerge(clsx(i))
export const fmtDate = (d: string) => new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(d))
export const orderCode = (n: number) => `VB-${n}`
