/**
 * Utility Functions
 * Common helper functions used throughout the 75 Hard challenge app
 */

import { clsx, type ClassValue } from 'clsx';
import { format, parseISO, differenceInDays, addDays, isToday, isBefore, isAfter } from 'date-fns';

/**
 * Combines class names using clsx
 */
export function cn(...inputs: ClassValue[]) {
    return clsx(inputs);
}

/**
 * Format date to various formats
 */
export const dateUtils = {
    toISOString: (date: Date): string => {
        return format(date, 'yyyy-MM-dd');
    },

    fromISOString: (dateString: string): Date => {
        return parseISO(dateString);
    },

    formatDisplay: (date: Date | string): string => {
        const dateObj = typeof date === 'string' ? parseISO(date) : date;
        return format(dateObj, 'MMM dd, yyyy');
    },

    formatShort: (date: Date | string): string => {
        const dateObj = typeof date === 'string' ? parseISO(date) : date;
        return format(dateObj, 'MM/dd');
    },

    formatTime: (date: Date): string => {
        return format(date, 'HH:mm');
    },

    isToday: (date: Date | string): boolean => {
        const dateObj = typeof date === 'string' ? parseISO(date) : date;
        return isToday(dateObj);
    },

    isPast: (date: Date | string): boolean => {
        const dateObj = typeof date === 'string' ? parseISO(date) : date;
        return isBefore(dateObj, new Date());
    },

    isFuture: (date: Date | string): boolean => {
        const dateObj = typeof date === 'string' ? parseISO(date) : date;
        return isAfter(dateObj, new Date());
    },

    daysBetween: (startDate: Date | string, endDate: Date | string): number => {
        const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
        const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
        return differenceInDays(end, start);
    },

    addDays: (date: Date | string, days: number): Date => {
        const dateObj = typeof date === 'string' ? parseISO(date) : date;
        return addDays(dateObj, days);
    },

    getCurrentDay: (startDate: string): number => {
        const start = parseISO(startDate);
        const today = new Date();
        const daysDiff = differenceInDays(today, start) + 1;
        return Math.max(1, Math.min(75, daysDiff));
    }
};

/**
 * Generate unique ID
 */
export function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Format file size in human readable format
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;

    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
): (...args: Parameters<T>) => void {
    let inThrottle: boolean;

    return (...args: Parameters<T>) => {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Calculate percentage
 */
export function calculatePercentage(current: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((current / total) * 100);
}

/**
 * Format water amount
 */
export function formatWaterAmount(ounces: number, showUnit: boolean = true): string {
    const gallons = ounces / 128;
    if (gallons >= 1) {
        return `${gallons.toFixed(1)}${showUnit ? ' gal' : ''}`;
    }
    return `${ounces}${showUnit ? ' oz' : ''}`;
}

/**
 * Format duration in minutes to human readable format
 */
export function formatDuration(minutes: number): string {
    if (minutes < 60) {
        return `${minutes}m`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (remainingMinutes === 0) {
        return `${hours}h`;
    }

    return `${hours}h ${remainingMinutes}m`;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Get greeting based on time of day
 */
export function getGreeting(): string {
    const hour = new Date().getHours();

    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
}

/**
 * Get motivational message based on progress
 */
export function getMotivationalMessage(dayNumber: number, completedToday: boolean): string {
    if (completedToday) {
        return [
            "Excellent work today! 💪",
            "You're crushing it! 🔥",
            "Another day conquered! 🏆",
            "Discipline in action! ⚡",
            "Mental toughness in progress! 🧠"
        ][Math.floor(Math.random() * 5)];
    }

    if (dayNumber <= 7) {
        return "Strong start! Keep building momentum! 🚀";
    } else if (dayNumber <= 21) {
        return "You're building habits! Stay consistent! 💎";
    } else if (dayNumber <= 50) {
        return "Halfway there! Push through! 🔥";
    } else {
        return "Final stretch! Mental toughness is yours! 🏆";
    }
}

/**
 * Storage utilities with proper type overloads
 */
function storageGet<T>(key: string): T | null;
function storageGet<T>(key: string, defaultValue: T): T;
function storageGet<T>(key: string, defaultValue?: T): T | null {
    if (typeof window === 'undefined') return defaultValue ?? null;

    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue ?? null;
    } catch (error) {
        console.error(`Error reading from localStorage:`, error);
        return defaultValue ?? null;
    }
}

export const storage = {
    get: storageGet,

    set: <T>(key: string, value: T): void => {
        if (typeof window === 'undefined') return;

        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error(`Error writing to localStorage:`, error);
        }
    },

        remove: (key: string): void => {
            if (typeof window === 'undefined') return;

            try {
                localStorage.removeItem(key);
            } catch (error) {
                console.error(`Error removing from localStorage:`, error);
            }
        },

            clear: (): void => {
                if (typeof window === 'undefined') return;

                try {
                    localStorage.clear();
                } catch (error) {
                    console.error(`Error clearing localStorage:`, error);
                }
            }
}; 