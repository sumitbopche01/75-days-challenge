/**
 * Storage Layer
 * Handles data persistence for the 75 Hard challenge app using localStorage
 * Provides methods for managing challenge data, user profiles, and progress tracking
 */

import {
    DayProgress,
    WorkoutEntry,
    WaterIntake,
    ReadingEntry,
    ProgressPhoto,
    ChallengeSettings,
    UserProfile,
    NotificationData,
    ChallengeStats,
    STORAGE_KEYS,
    DEFAULT_WATER_TARGET,
    DEFAULT_WORKOUT_DURATION,
    CHALLENGE_DURATION,
    DailyTask,
} from '@/types/challenge';
import { storage, generateId, dateUtils } from './utils';

/**
 * Challenge Storage Service
 * Manages all challenge-related data persistence
 */
export class ChallengeStorage {

    // User Profile Management
    static getUserProfile(): UserProfile | null {
        return storage.get<UserProfile>(STORAGE_KEYS.USER_PROFILE);
    }

    static saveUserProfile(profile: UserProfile): void {
        storage.set(STORAGE_KEYS.USER_PROFILE, profile);
    }

    static createDefaultProfile(name: string): UserProfile {
        const profile: UserProfile = {
            id: generateId(),
            name,
            joinDate: new Date(),
            challengeAttempts: 0,
            preferences: {
                theme: 'system',
                units: 'imperial',
                defaultWorkoutDuration: DEFAULT_WORKOUT_DURATION,
            },
        };

        this.saveUserProfile(profile);
        return profile;
    }

    // Challenge Settings Management
    static getChallengeSettings(): ChallengeSettings | null {
        return storage.get<ChallengeSettings>(STORAGE_KEYS.SETTINGS);
    }

    static saveChallengeSettings(settings: ChallengeSettings): void {
        storage.set(STORAGE_KEYS.SETTINGS, settings);
    }

    static initializeChallenge(startDate?: Date): ChallengeSettings {
        const start = startDate || new Date();
        const startDateString = dateUtils.toISOString(start);
        const endDate = dateUtils.addDays(start, CHALLENGE_DURATION - 1);

        const settings: ChallengeSettings = {
            startDate: startDateString,
            endDate: dateUtils.toISOString(endDate),
            currentDay: 1,
            isActive: true,
            isPaused: false,
            waterTarget: DEFAULT_WATER_TARGET,
            notifications: {
                enabled: true,
                reminderTimes: ['09:00', '12:00', '18:00', '21:00'],
            },
        };

        this.saveChallengeSettings(settings);

        // Update user profile attempt count
        const profile = this.getUserProfile();
        if (profile) {
            profile.challengeAttempts += 1;
            profile.currentChallenge = settings;
            this.saveUserProfile(profile);
        }

        return settings;
    }

    static resetChallenge(): void {
        // Clear all challenge data
        storage.remove(STORAGE_KEYS.SETTINGS);
        storage.remove(STORAGE_KEYS.DAILY_PROGRESS);
        storage.remove(STORAGE_KEYS.WORKOUT_ENTRIES);
        storage.remove(STORAGE_KEYS.WATER_INTAKE);
        storage.remove(STORAGE_KEYS.READING_ENTRIES);
        storage.remove(STORAGE_KEYS.PROGRESS_PHOTOS);

        // Update user profile
        const profile = this.getUserProfile();
        if (profile) {
            delete profile.currentChallenge;
            this.saveUserProfile(profile);
        }
    }

    // Daily Progress Management
    static getAllDailyProgress(): Record<string, DayProgress> {
        return storage.get<Record<string, DayProgress>>(STORAGE_KEYS.DAILY_PROGRESS, {});
    }

    static getDailyProgress(date: string): DayProgress | null {
        const allProgress = this.getAllDailyProgress();
        return allProgress[date] || null;
    }

    static saveDailyProgress(progress: DayProgress): void {
        const allProgress = this.getAllDailyProgress();
        allProgress[progress.date] = {
            ...progress,
            updatedAt: new Date(),
        };
        storage.set(STORAGE_KEYS.DAILY_PROGRESS, allProgress);
    }

    static createDayProgress(date: string, dayNumber: number): DayProgress {
        const createTask = (name: string, description: string): DailyTask => ({
            id: generateId(),
            name,
            description,
            completed: false,
            required: true,
        });

        const progress: DayProgress = {
            date,
            dayNumber,
            tasks: {
                diet: createTask('Diet', 'Follow your chosen diet with no cheat meals or alcohol'),
                workout1: createTask('Workout 1', 'Complete first 45-minute workout'),
                workout2: createTask('Outdoor Workout', 'Complete second 45-minute workout outdoors'),
                water: createTask('Water', 'Drink 1 gallon (128 oz) of water'),
                reading: createTask('Reading', 'Read 10 pages of a non-fiction book'),
                photo: createTask('Progress Photo', 'Take a daily progress photo'),
            },
            allCompleted: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        this.saveDailyProgress(progress);
        return progress;
    }

    static updateTaskCompletion(date: string, taskType: keyof DayProgress['tasks'], completed: boolean): void {
        const progress = this.getDailyProgress(date);
        if (!progress) return;

        progress.tasks[taskType].completed = completed;
        progress.tasks[taskType].completedAt = completed ? new Date() : undefined;
        progress.allCompleted = Object.values(progress.tasks).every(task => task.completed);

        this.saveDailyProgress(progress);
    }

    // Workout Management
    static getAllWorkouts(): WorkoutEntry[] {
        return storage.get<WorkoutEntry[]>(STORAGE_KEYS.WORKOUT_ENTRIES, []);
    }

    static getWorkoutsByDate(date: string): WorkoutEntry[] {
        return this.getAllWorkouts().filter(workout => workout.date === date);
    }

    static saveWorkout(workout: WorkoutEntry): void {
        const workouts = this.getAllWorkouts();
        const existingIndex = workouts.findIndex(w => w.id === workout.id);

        if (existingIndex >= 0) {
            workouts[existingIndex] = workout;
        } else {
            workouts.push(workout);
        }

        storage.set(STORAGE_KEYS.WORKOUT_ENTRIES, workouts);
    }

    static deleteWorkout(workoutId: string): void {
        const workouts = this.getAllWorkouts().filter(w => w.id !== workoutId);
        storage.set(STORAGE_KEYS.WORKOUT_ENTRIES, workouts);
    }

    // Water Intake Management
    static getWaterIntake(date: string): WaterIntake | null {
        const allWater = storage.get<Record<string, WaterIntake>>(STORAGE_KEYS.WATER_INTAKE, {});
        return allWater[date] || null;
    }

    static saveWaterIntake(waterIntake: WaterIntake): void {
        const allWater = storage.get<Record<string, WaterIntake>>(STORAGE_KEYS.WATER_INTAKE, {});
        allWater[waterIntake.date] = waterIntake;
        storage.set(STORAGE_KEYS.WATER_INTAKE, allWater);
    }

    static addWaterEntry(date: string, amount: number): void {
        let waterIntake = this.getWaterIntake(date);

        if (!waterIntake) {
            waterIntake = {
                id: generateId(),
                date,
                amount: 0,
                target: DEFAULT_WATER_TARGET,
                entries: [],
            };
        }

        waterIntake.entries.push({
            id: generateId(),
            timestamp: new Date(),
            amount,
        });

        waterIntake.amount = waterIntake.entries.reduce((total, entry) => total + entry.amount, 0);

        this.saveWaterIntake(waterIntake);
    }

    // Reading Management
    static getAllReadingEntries(): ReadingEntry[] {
        return storage.get<ReadingEntry[]>(STORAGE_KEYS.READING_ENTRIES, []);
    }

    static getReadingEntriesByDate(date: string): ReadingEntry[] {
        return this.getAllReadingEntries().filter(entry => entry.date === date);
    }

    static saveReadingEntry(entry: ReadingEntry): void {
        const entries = this.getAllReadingEntries();
        const existingIndex = entries.findIndex(e => e.id === entry.id);

        if (existingIndex >= 0) {
            entries[existingIndex] = entry;
        } else {
            entries.push(entry);
        }

        storage.set(STORAGE_KEYS.READING_ENTRIES, entries);
    }

    // Progress Photos Management
    static getAllProgressPhotos(): ProgressPhoto[] {
        return storage.get<ProgressPhoto[]>(STORAGE_KEYS.PROGRESS_PHOTOS, []);
    }

    static getProgressPhotoByDate(date: string): ProgressPhoto | null {
        return this.getAllProgressPhotos().find(photo => photo.date === date) || null;
    }

    static saveProgressPhoto(photo: ProgressPhoto): void {
        const photos = this.getAllProgressPhotos();
        const existingIndex = photos.findIndex(p => p.date === photo.date);

        if (existingIndex >= 0) {
            photos[existingIndex] = photo;
        } else {
            photos.push(photo);
        }

        storage.set(STORAGE_KEYS.PROGRESS_PHOTOS, photos);
    }

    static deleteProgressPhoto(date: string): void {
        const photos = this.getAllProgressPhotos().filter(p => p.date !== date);
        storage.set(STORAGE_KEYS.PROGRESS_PHOTOS, photos);
    }

    // Statistics and Analytics
    static getChallengeStats(): ChallengeStats {
        const allProgress = this.getAllDailyProgress();
        const workouts = this.getAllWorkouts();
        const waterIntakes = storage.get<Record<string, WaterIntake>>(STORAGE_KEYS.WATER_INTAKE, {});
        const readingEntries = this.getAllReadingEntries();

        const progressArray = Object.values(allProgress);
        const completedDays = progressArray.filter(day => day.allCompleted).length;

        // Calculate streaks
        let currentStreak = 0;
        let longestStreak = 0;
        let tempStreak = 0;

        const settings = this.getChallengeSettings();
        if (settings) {
            const startDate = dateUtils.fromISOString(settings.startDate);
            const currentDay = dateUtils.getCurrentDay(settings.startDate);

            for (let i = 1; i <= currentDay; i++) {
                const date = dateUtils.toISOString(dateUtils.addDays(startDate, i - 1));
                const dayProgress = allProgress[date];

                if (dayProgress?.allCompleted) {
                    tempStreak++;
                    longestStreak = Math.max(longestStreak, tempStreak);
                    if (i === currentDay) currentStreak = tempStreak;
                } else {
                    tempStreak = 0;
                    if (i === currentDay) currentStreak = 0;
                }
            }
        }

        // Calculate task completion counts
        const tasksCompleted = {
            diet: progressArray.reduce((count, day) => count + (day.tasks.diet.completed ? 1 : 0), 0),
            workouts: workouts.filter(w => w.isCompleted).length,
            water: progressArray.reduce((count, day) => count + (day.tasks.water.completed ? 1 : 0), 0),
            reading: progressArray.reduce((count, day) => count + (day.tasks.reading.completed ? 1 : 0), 0),
            photos: progressArray.reduce((count, day) => count + (day.tasks.photo.completed ? 1 : 0), 0),
        };

        const totalWaterConsumed = Object.values(waterIntakes).reduce(
            (total, intake) => total + intake.amount, 0
        );

        const totalPagesRead = readingEntries.reduce(
            (total, entry) => total + entry.pagesRead, 0
        );

        const completedWorkouts = workouts.filter(w => w.isCompleted);
        const averageWorkoutDuration = completedWorkouts.length > 0
            ? completedWorkouts.reduce((total, workout) => total + workout.duration, 0) / completedWorkouts.length
            : 0;

        return {
            totalDays: progressArray.length,
            completedDays,
            currentStreak,
            longestStreak,
            completionRate: progressArray.length > 0 ? (completedDays / progressArray.length) * 100 : 0,
            tasksCompleted,
            totalWorkouts: workouts.length,
            totalWaterConsumed,
            totalPagesRead,
            averageWorkoutDuration,
        };
    }

    // Notifications Management
    static getNotifications(): NotificationData[] {
        return storage.get<NotificationData[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    }

    static addNotification(notification: Omit<NotificationData, 'id' | 'timestamp' | 'isRead'>): void {
        const notifications = this.getNotifications();
        notifications.unshift({
            ...notification,
            id: generateId(),
            timestamp: new Date(),
            isRead: false,
        });

        // Keep only the last 50 notifications
        if (notifications.length > 50) {
            notifications.splice(50);
        }

        storage.set(STORAGE_KEYS.NOTIFICATIONS, notifications);
    }

    static markNotificationAsRead(notificationId: string): void {
        const notifications = this.getNotifications();
        const notification = notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.isRead = true;
            storage.set(STORAGE_KEYS.NOTIFICATIONS, notifications);
        }
    }

    static clearAllNotifications(): void {
        storage.set(STORAGE_KEYS.NOTIFICATIONS, []);
    }

    // Data Export/Import
    static exportData(): string {
        const data = {
            userProfile: this.getUserProfile(),
            settings: this.getChallengeSettings(),
            dailyProgress: this.getAllDailyProgress(),
            workouts: this.getAllWorkouts(),
            waterIntake: storage.get(STORAGE_KEYS.WATER_INTAKE, {}),
            reading: this.getAllReadingEntries(),
            photos: this.getAllProgressPhotos(),
            notifications: this.getNotifications(),
        };

        return JSON.stringify(data, null, 2);
    }

    static importData(jsonData: string): boolean {
        try {
            const data = JSON.parse(jsonData);

            if (data.userProfile) this.saveUserProfile(data.userProfile);
            if (data.settings) this.saveChallengeSettings(data.settings);
            if (data.dailyProgress) storage.set(STORAGE_KEYS.DAILY_PROGRESS, data.dailyProgress);
            if (data.workouts) storage.set(STORAGE_KEYS.WORKOUT_ENTRIES, data.workouts);
            if (data.waterIntake) storage.set(STORAGE_KEYS.WATER_INTAKE, data.waterIntake);
            if (data.reading) storage.set(STORAGE_KEYS.READING_ENTRIES, data.reading);
            if (data.photos) storage.set(STORAGE_KEYS.PROGRESS_PHOTOS, data.photos);
            if (data.notifications) storage.set(STORAGE_KEYS.NOTIFICATIONS, data.notifications);

            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }

    // Clear all data
    static clearAllData(): void {
        Object.values(STORAGE_KEYS).forEach(key => {
            storage.remove(key);
        });
    }
} 