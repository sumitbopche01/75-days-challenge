/**
 * Challenge Types
 * TypeScript interfaces for the 75 Hard Challenge app with flexible challenge system
 */

// Challenge categories for organization
export type ChallengeCategory =
    | 'fitness'
    | 'nutrition'
    | 'mental'
    | 'productivity'
    | 'learning'
    | 'custom';

// Different types of challenges users can create
export type ChallengeType =
    | 'boolean'     // Simple yes/no completion
    | 'quantity'    // Target-based (pages read, glasses of water)
    | 'duration'    // Time-based (minutes of exercise)
    | 'avoidance';  // Things to avoid (no social media, no junk food)

// Template for predefined challenges
export interface ChallengeTemplate {
    id: string;
    name: string;
    description: string;
    category: ChallengeCategory;
    type: ChallengeType;
    defaultTarget?: number;
    unit?: string;
    icon?: string;
    color?: string;
    tips?: string[];
}

// User's selected and customized challenge
export interface UserChallenge {
    id: string;
    templateId?: string; // Reference to template if based on one
    name: string;
    description: string;
    category: ChallengeCategory;
    type: ChallengeType;
    target?: number;     // For quantity/duration challenges
    unit?: string;       // "pages", "oz", "minutes", etc.
    icon?: string;
    color?: string;
    isCustom: boolean;
    isRequired: boolean; // Must be completed daily
    sortOrder: number;
}

// Daily completion for a specific challenge
export interface ChallengeCompletion {
    challengeId: string;
    completed: boolean;
    value?: number;      // For quantity/duration challenges
    completedAt?: Date;
    notes?: string;
}

// Daily progress with flexible challenges
export interface DayProgress {
    date: string;        // ISO date string (YYYY-MM-DD)
    dayNumber: number;   // Day 1-75
    completions: Record<string, ChallengeCompletion>; // challengeId -> completion
    allCompleted: boolean;
    completionRate: number; // 0-100%
    createdAt: Date;
    updatedAt: Date;
    // Backward compatibility for legacy tasks structure
    tasks?: {
        diet: DailyTask;
        workout1: DailyTask;
        workout2: DailyTask;
        water: DailyTask;
        reading: DailyTask;
        photo: DailyTask;
    };
}

// Legacy task interface (for backward compatibility during migration)
export interface DailyTask {
    id: string;
    name: string;
    description: string;
    completed: boolean;
    completedAt?: Date;
    required: boolean;
}

// User's challenge setup
export interface ChallengeSetup {
    selectedChallenges: UserChallenge[];
    minimumRequired: number; // Minimum challenges to complete daily
    startDate: string;
    duration: number; // Default 75, but could be customizable
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
    // New flexible challenge system keys
    CHALLENGE_SETUP: 'challenge_setup',
    CHALLENGE_TEMPLATES: 'challenge_templates',
    USER_CHALLENGES: 'user_challenges',
} as const;

// Default values
export const DEFAULT_WATER_TARGET = 128; // 1 gallon in ounces
export const DEFAULT_WORKOUT_DURATION = 45; // 45 minutes
export const CHALLENGE_DURATION = 75; // 75 days

// Utility types for flexible challenge system
export type ChallengeCompletionMap = Record<string, boolean>;

// Legacy utility types (for backward compatibility)
export type LegacyTaskType = 'diet' | 'workout1' | 'workout2' | 'water' | 'reading' | 'photo';
export type LegacyTaskCompletionMap = Record<LegacyTaskType, boolean>;

// Temporary backward compatibility exports
export type TaskType = LegacyTaskType;
export type TaskCompletionMap = LegacyTaskCompletionMap; 