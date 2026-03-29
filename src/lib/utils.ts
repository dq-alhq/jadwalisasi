import type { ClassValue } from 'clsx'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function parseToISO(input: string) {
    const [month, day, year] = input.split('/').map(Number)
    const fullYear = year < 50 ? 2000 + year : 1900 + year
    // Format ke ISO "YYYY-MM-DD"
    return `${fullYear}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export function parseToDateTime(input: string) {
    const [month, day, year] = input.split('/').map(Number)
    const fullYear = year < 50 ? 2000 + year : 1900 + year

    // Buat objek Date di UTC
    const d = new Date(Date.UTC(fullYear, month - 1, day))

    // Format ke ISO-8601 lengkap
    return d.toISOString()
}
