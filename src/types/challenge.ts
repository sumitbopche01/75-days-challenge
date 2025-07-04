/**
 * Challenge Data Models
 * Defines all TypeScript interfaces and types for the 75 Hard challenge app
 */

export interface DailyTask {
    id: string;
    name: string;
    description: string;
    completed: boolean;
    completedAt?: Date;
    required: boolean;
}

export interface DayProgress {
    date: string; // ISO date string (YYYY-MM-DD)
    dayNumber: number; // 1-75
    tasks: {
        diet: DailyTask;
        workout1: DailyTask;
        workout2: DailyTask;
        water: DailyTask;
        reading: DailyTask;
        photo: DailyTask;
    };
    allCompleted: boolean;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface WorkoutEntry {
    id: string;
    date: string;
    type: 'indoor' | 'outdoor';
    activity: string;
    duration: number; // minutes
    notes?: string;
    isCompleted: boolean;
}

export interface WaterIntake {
    id: string;
    date: string;
    amount: number; // in ounces
    target: number; // target amount (128 oz = 1 gallon)
    entries: WaterEntry[];
}

export interface WaterEntry {
    id: string;
    timestamp: Date;
    amount: number; // in ounces
}

export interface ReadingEntry {
    id: string;
    date: string;
    bookTitle: string;
    author: string;
    pagesRead: number;
    totalPages: number;
    notes?: string;
    isCompleted: boolean;
}

export interface ProgressPhoto {
    id: string;
    date: string;
    dayNumber: number;
    imageUrl: string;
    imageFile?: File;
    notes?: string;
    timestamp: Date;
}

export interface ChallengeSettings {
    startDate: string; // ISO date string
    endDate: string; // ISO date string
    currentDay: number;
    isActive: boolean;
    isPaused: boolean;
    waterTarget: number; // daily water target in ounces
    notifications: {
        enabled: boolean;
        reminderTimes: string[]; // array of time strings like "09:00"
    };
}

export interface ChallengeStats {
    totalDays: number;
    completedDays: number;
    currentStreak: number;
    longestStreak: number;
    completionRate: number; // percentage
    tasksCompleted: {
        diet: number;
        workouts: number;
        water: number;
        reading: number;
        photos: number;
    };
    totalWorkouts: number;
    totalWaterConsumed: number; // in ounces
    totalPagesRead: number;
    averageWorkoutDuration: number;
}

export interface UserProfile {
    id: string;
    name: string;
    email?: string;
    joinDate: Date;
    challengeAttempts: number;
    currentChallenge?: ChallengeSettings;
    preferences: {
        theme: 'light' | 'dark' | 'system';
        units: 'imperial' | 'metric';
        defaultWorkoutDuration: number;
    };
}

// Challenge status types
export type ChallengeStatus = 'not-started' | 'active' | 'completed' | 'failed' | 'paused';

// Task completion status
export type TaskStatus = 'pending' | 'completed' | 'skipped';

// Notification types
export interface NotificationData {
    id: string;
    type: 'reminder' | 'achievement' | 'warning';
    title: string;
    message: string;
    timestamp: Date;
    isRead: boolean;
}

// Local storage keys
export const STORAGE_KEYS = {
    CHALLENGE_DATA: 'challenge_data',
    USER_PROFILE: 'user_profile',
    DAILY_PROGRESS: 'daily_progress',
    WORKOUT_ENTRIES: 'workout_entries',
    WATER_INTAKE: 'water_intake',
    READING_ENTRIES: 'reading_entries',
    PROGRESS_PHOTOS: 'progress_photos',
    SETTINGS: 'challenge_settings',
    NOTIFICATIONS: 'notifications',
} as const;

// Default values
export const DEFAULT_WATER_TARGET = 128; // 1 gallon in ounces
export const DEFAULT_WORKOUT_DURATION = 45; // 45 minutes
export const CHALLENGE_DURATION = 75; // 75 days

// Utility types
export type TaskType = keyof DayProgress['tasks'];
export type TaskCompletionMap = Record<TaskType, boolean>; 