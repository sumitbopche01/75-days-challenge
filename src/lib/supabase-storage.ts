// src/lib/supabase-storage.ts
// Primary storage service using Supabase with localStorage fallback

import { apiClient } from './api-client';
import { storage } from './utils';
import { DatabaseUser, DatabaseChallenge, DatabaseCustomTask } from '@/types/database';
import { UserProfile, ChallengeSettings } from '@/types/challenge';
import { handleDatabaseError, handleApiError, AppError } from './error-handler';

export interface StorageResult<T> {
    success: boolean;
    data?: T;
    error?: AppError;
    fromCache?: boolean;
}

export interface TaskCompletion {
    taskId: string;
    completed: boolean;
    completedAt?: string;
    date: string;
}

export interface SyncStatus {
    isOnline: boolean;
    lastSync?: Date;
    pendingChanges: number;
    hasConflicts: boolean;
}

class SupabaseStorage {
    private isOnline = true;
    private pendingChanges: any[] = [];
    private syncInProgress = false;
    private syncCallbacks: ((status: SyncStatus) => void)[] = [];

    constructor() {
        this.initializeOnlineDetection();
        this.startPeriodicSync();
    }

    // Online/Offline detection
    private initializeOnlineDetection() {
        if (typeof window !== 'undefined') {
            this.isOnline = navigator.onLine;

            window.addEventListener('online', () => {
                this.isOnline = true;
                this.syncPendingChanges();
            });

            window.addEventListener('offline', () => {
                this.isOnline = false;
            });
        }
    }

    // Start periodic sync every 5 minutes
    private startPeriodicSync() {
        if (typeof window !== 'undefined') {
            setInterval(() => {
                if (this.isOnline && !this.syncInProgress) {
                    this.syncPendingChanges();
                }
            }, 5 * 60 * 1000); // 5 minutes
        }
    }

    // Subscribe to sync status changes
    onSyncStatusChange(callback: (status: SyncStatus) => void) {
        this.syncCallbacks.push(callback);

        // Return unsubscribe function
        return () => {
            this.syncCallbacks = this.syncCallbacks.filter(cb => cb !== callback);
        };
    }

    private notifySyncStatusChange() {
        const status: SyncStatus = {
            isOnline: this.isOnline,
            lastSync: new Date(),
            pendingChanges: this.pendingChanges.length,
            hasConflicts: false
        };

        this.syncCallbacks.forEach(callback => callback(status));
    }

    // User Profile Management
    async getUserProfile(): Promise<StorageResult<UserProfile>> {
        if (this.isOnline) {
            try {
                const response = await apiClient.getProfile();

                if (response.success && response.data?.user) {
                    const user = response.data.user;
                    const profile: UserProfile = {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        createdAt: user.created_at,
                        avatarUrl: user.avatar_url,
                        googleId: user.google_id,
                    };

                    // Cache in localStorage
                    storage.set('user_profile', profile);

                    return { success: true, data: profile };
                } else {
                    // Try fallback to localStorage
                    const cachedProfile = storage.get<UserProfile>('user_profile');
                    if (cachedProfile) {
                        return { success: true, data: cachedProfile, fromCache: true };
                    }

                    return { success: false, error: response.error };
                }
            } catch (error) {
                const appError = handleApiError(error);

                // Fallback to localStorage
                const cachedProfile = storage.get<UserProfile>('user_profile');
                if (cachedProfile) {
                    return { success: true, data: cachedProfile, fromCache: true };
                }

                return { success: false, error: appError };
            }
        } else {
            // Offline: use localStorage
            const cachedProfile = storage.get<UserProfile>('user_profile');
            if (cachedProfile) {
                return { success: true, data: cachedProfile, fromCache: true };
            }

            return { success: false, error: handleApiError({ error: 'No cached profile found' }) };
        }
    }

    async createUserProfile(data: {
        name: string;
        google_id?: string;
        avatar_url?: string;
    }): Promise<StorageResult<UserProfile>> {
        if (this.isOnline) {
            try {
                const response = await apiClient.createProfile(data);

                if (response.success && response.data?.user) {
                    const user = response.data.user;
                    const profile: UserProfile = {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        createdAt: user.created_at,
                        avatarUrl: user.avatar_url,
                        googleId: user.google_id,
                    };

                    // Cache in localStorage
                    storage.set('user_profile', profile);

                    return { success: true, data: profile };
                } else {
                    return { success: false, error: response.error };
                }
            } catch (error) {
                const appError = handleApiError(error);

                // Queue for later sync
                this.pendingChanges.push({
                    type: 'createProfile',
                    data,
                    timestamp: new Date()
                });

                return { success: false, error: appError };
            }
        } else {
            // Offline: queue for later sync
            this.pendingChanges.push({
                type: 'createProfile',
                data,
                timestamp: new Date()
            });

            return { success: false, error: handleApiError({ error: 'Offline - queued for sync' }) };
        }
    }

    // Challenge Management
    async getChallenges(): Promise<StorageResult<DatabaseChallenge[]>> {
        if (this.isOnline) {
            try {
                const response = await apiClient.getChallenges();

                if (response.success && response.data?.challenges) {
                    // Cache in localStorage
                    storage.set('challenges', response.data.challenges);

                    return { success: true, data: response.data.challenges };
                } else {
                    // Try fallback to localStorage
                    const cachedChallenges = storage.get<DatabaseChallenge[]>('challenges');
                    if (cachedChallenges) {
                        return { success: true, data: cachedChallenges, fromCache: true };
                    }

                    return { success: false, error: response.error };
                }
            } catch (error) {
                const appError = handleApiError(error);

                // Fallback to localStorage
                const cachedChallenges = storage.get<DatabaseChallenge[]>('challenges');
                if (cachedChallenges) {
                    return { success: true, data: cachedChallenges, fromCache: true };
                }

                return { success: false, error: appError };
            }
        } else {
            // Offline: use localStorage
            const cachedChallenges = storage.get<DatabaseChallenge[]>('challenges');
            if (cachedChallenges) {
                return { success: true, data: cachedChallenges, fromCache: true };
            }

            return { success: false, error: handleApiError({ error: 'No cached challenges found' }) };
        }
    }

    async createChallenge(data: { start_date: string }): Promise<StorageResult<DatabaseChallenge>> {
        if (this.isOnline) {
            try {
                const response = await apiClient.createChallenge(data);

                if (response.success && response.data?.challenge) {
                    // Update cache
                    const cachedChallenges = storage.get<DatabaseChallenge[]>('challenges') || [];
                    cachedChallenges.push(response.data.challenge);
                    storage.set('challenges', cachedChallenges);

                    return { success: true, data: response.data.challenge };
                } else {
                    return { success: false, error: response.error };
                }
            } catch (error) {
                const appError = handleApiError(error);

                // Queue for later sync
                this.pendingChanges.push({
                    type: 'createChallenge',
                    data,
                    timestamp: new Date()
                });

                return { success: false, error: appError };
            }
        } else {
            // Offline: queue for later sync
            this.pendingChanges.push({
                type: 'createChallenge',
                data,
                timestamp: new Date()
            });

            return { success: false, error: handleApiError({ error: 'Offline - queued for sync' }) };
        }
    }

    // Custom Tasks Management
    async getTasks(): Promise<StorageResult<DatabaseCustomTask[]>> {
        if (this.isOnline) {
            try {
                const response = await apiClient.getTasks();

                if (response.success && response.data?.tasks) {
                    // Cache in localStorage
                    storage.set('custom_tasks', response.data.tasks);

                    return { success: true, data: response.data.tasks };
                } else {
                    // Try fallback to localStorage
                    const cachedTasks = storage.get<DatabaseCustomTask[]>('custom_tasks');
                    if (cachedTasks) {
                        return { success: true, data: cachedTasks, fromCache: true };
                    }

                    return { success: false, error: response.error };
                }
            } catch (error) {
                const appError = handleApiError(error);

                // Fallback to localStorage
                const cachedTasks = storage.get<DatabaseCustomTask[]>('custom_tasks');
                if (cachedTasks) {
                    return { success: true, data: cachedTasks, fromCache: true };
                }

                return { success: false, error: appError };
            }
        } else {
            // Offline: use localStorage
            const cachedTasks = storage.get<DatabaseCustomTask[]>('custom_tasks');
            if (cachedTasks) {
                return { success: true, data: cachedTasks, fromCache: true };
            }

            return { success: false, error: handleApiError({ error: 'No cached tasks found' }) };
        }
    }

    async createTask(data: {
        task_text: string;
        is_default?: boolean;
        order_index?: number;
    }): Promise<StorageResult<DatabaseCustomTask>> {
        if (this.isOnline) {
            try {
                const response = await apiClient.createTask(data);

                if (response.success && response.data?.task) {
                    // Update cache
                    const cachedTasks = storage.get<DatabaseCustomTask[]>('custom_tasks') || [];
                    cachedTasks.push(response.data.task);
                    storage.set('custom_tasks', cachedTasks);

                    return { success: true, data: response.data.task };
                } else {
                    return { success: false, error: response.error };
                }
            } catch (error) {
                const appError = handleApiError(error);

                // Queue for later sync
                this.pendingChanges.push({
                    type: 'createTask',
                    data,
                    timestamp: new Date()
                });

                return { success: false, error: appError };
            }
        } else {
            // Offline: create temporary task and queue for sync
            const tempTask: DatabaseCustomTask = {
                id: `temp_${Date.now()}`,
                user_id: 'temp',
                task_text: data.task_text,
                is_default: data.is_default || false,
                order_index: data.order_index || 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };

            // Update cache
            const cachedTasks = storage.get<DatabaseCustomTask[]>('custom_tasks') || [];
            cachedTasks.push(tempTask);
            storage.set('custom_tasks', cachedTasks);

            // Queue for later sync
            this.pendingChanges.push({
                type: 'createTask',
                data,
                tempId: tempTask.id,
                timestamp: new Date()
            });

            return { success: true, data: tempTask, fromCache: true };
        }
    }

    async deleteTask(taskId: string): Promise<StorageResult<boolean>> {
        if (this.isOnline) {
            try {
                const response = await apiClient.deleteTask({ task_id: taskId });

                if (response.success) {
                    // Update cache
                    const cachedTasks = storage.get<DatabaseCustomTask[]>('custom_tasks') || [];
                    const updatedTasks = cachedTasks.filter(task => task.id !== taskId);
                    storage.set('custom_tasks', updatedTasks);

                    return { success: true, data: true };
                } else {
                    return { success: false, error: response.error };
                }
            } catch (error) {
                const appError = handleApiError(error);

                // Queue for later sync
                this.pendingChanges.push({
                    type: 'deleteTask',
                    data: { task_id: taskId },
                    timestamp: new Date()
                });

                return { success: false, error: appError };
            }
        } else {
            // Offline: remove from cache and queue for sync
            const cachedTasks = storage.get<DatabaseCustomTask[]>('custom_tasks') || [];
            const updatedTasks = cachedTasks.filter(task => task.id !== taskId);
            storage.set('custom_tasks', updatedTasks);

            // Queue for later sync
            this.pendingChanges.push({
                type: 'deleteTask',
                data: { task_id: taskId },
                timestamp: new Date()
            });

            return { success: true, data: true, fromCache: true };
        }
    }

    // Task Completion Management
    async getTaskCompletions(date?: string): Promise<StorageResult<{ [taskId: string]: TaskCompletion }>> {
        const targetDate = date || new Date().toISOString().split('T')[0];
        const cacheKey = `task_completions_${targetDate}`;

        if (this.isOnline) {
            try {
                const response = await apiClient.getTaskCompletions(targetDate);

                if (response.success && response.data?.completions) {
                    const completions: { [taskId: string]: TaskCompletion } = {};

                    response.data.completions.forEach((completion: any) => {
                        completions[completion.custom_task_id] = {
                            taskId: completion.custom_task_id,
                            completed: completion.completed,
                            completedAt: completion.completed_at,
                            date: targetDate
                        };
                    });

                    // Cache in localStorage
                    storage.set(cacheKey, completions);

                    return { success: true, data: completions };
                } else {
                    // Try fallback to localStorage
                    const cachedCompletions = storage.get<{ [taskId: string]: TaskCompletion }>(cacheKey);
                    if (cachedCompletions) {
                        return { success: true, data: cachedCompletions, fromCache: true };
                    }

                    return { success: true, data: {} };
                }
            } catch (error) {
                const appError = handleApiError(error);

                // Fallback to localStorage
                const cachedCompletions = storage.get<{ [taskId: string]: TaskCompletion }>(cacheKey);
                if (cachedCompletions) {
                    return { success: true, data: cachedCompletions, fromCache: true };
                }

                return { success: true, data: {} };
            }
        } else {
            // Offline: use localStorage
            const cachedCompletions = storage.get<{ [taskId: string]: TaskCompletion }>(cacheKey) || {};
            return { success: true, data: cachedCompletions, fromCache: true };
        }
    }

    async completeTask(taskId: string, completed: boolean, date?: string): Promise<StorageResult<boolean>> {
        const targetDate = date || new Date().toISOString().split('T')[0];
        const cacheKey = `task_completions_${targetDate}`;

        // Update cache immediately
        const cachedCompletions = storage.get<{ [taskId: string]: TaskCompletion }>(cacheKey) || {};
        cachedCompletions[taskId] = {
            taskId,
            completed,
            completedAt: completed ? new Date().toISOString() : undefined,
            date: targetDate
        };
        storage.set(cacheKey, cachedCompletions);

        if (this.isOnline) {
            try {
                const response = await apiClient.completeTask({
                    task_id: taskId,
                    completed,
                    date: targetDate
                });

                if (response.success) {
                    return { success: true, data: true };
                } else {
                    // Queue for later sync
                    this.pendingChanges.push({
                        type: 'completeTask',
                        data: { task_id: taskId, completed, date: targetDate },
                        timestamp: new Date()
                    });

                    return { success: false, error: response.error };
                }
            } catch (error) {
                const appError = handleApiError(error);

                // Queue for later sync
                this.pendingChanges.push({
                    type: 'completeTask',
                    data: { task_id: taskId, completed, date: targetDate },
                    timestamp: new Date()
                });

                return { success: false, error: appError };
            }
        } else {
            // Offline: queue for later sync
            this.pendingChanges.push({
                type: 'completeTask',
                data: { task_id: taskId, completed, date: targetDate },
                timestamp: new Date()
            });

            return { success: true, data: true, fromCache: true };
        }
    }

    // Initialize default tasks
    async initializeDefaultTasks(tasks: string[]): Promise<StorageResult<DatabaseCustomTask[]>> {
        if (this.isOnline) {
            try {
                const response = await apiClient.initializeDefaultTasks(tasks);

                if (response.success && response.data?.tasks) {
                    // Cache in localStorage
                    storage.set('custom_tasks', response.data.tasks);

                    return { success: true, data: response.data.tasks };
                } else {
                    return { success: false, error: response.error };
                }
            } catch (error) {
                const appError = handleApiError(error);

                // Queue for later sync
                this.pendingChanges.push({
                    type: 'initializeDefaultTasks',
                    data: { tasks },
                    timestamp: new Date()
                });

                return { success: false, error: appError };
            }
        } else {
            // Offline: create temporary tasks
            const tempTasks: DatabaseCustomTask[] = tasks.map((task, index) => ({
                id: `temp_${Date.now()}_${index}`,
                user_id: 'temp',
                task_text: task,
                is_default: true,
                order_index: index,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            }));

            // Cache in localStorage
            storage.set('custom_tasks', tempTasks);

            // Queue for later sync
            this.pendingChanges.push({
                type: 'initializeDefaultTasks',
                data: { tasks },
                timestamp: new Date()
            });

            return { success: true, data: tempTasks, fromCache: true };
        }
    }

    // Sync pending changes
    async syncPendingChanges(): Promise<void> {
        if (!this.isOnline || this.syncInProgress || this.pendingChanges.length === 0) {
            return;
        }

        this.syncInProgress = true;

        try {
            const changesToSync = [...this.pendingChanges];
            this.pendingChanges = [];

            for (const change of changesToSync) {
                try {
                    switch (change.type) {
                        case 'createProfile':
                            await apiClient.createProfile(change.data);
                            break;
                        case 'createChallenge':
                            await apiClient.createChallenge(change.data);
                            break;
                        case 'createTask':
                            await apiClient.createTask(change.data);
                            break;
                        case 'deleteTask':
                            await apiClient.deleteTask(change.data);
                            break;
                        case 'completeTask':
                            await apiClient.completeTask(change.data);
                            break;
                        case 'initializeDefaultTasks':
                            await apiClient.initializeDefaultTasks(change.data.tasks);
                            break;
                    }
                } catch (error) {
                    console.warn('Failed to sync change:', change, error);
                    // Re-queue failed changes
                    this.pendingChanges.push(change);
                }
            }

            this.notifySyncStatusChange();
        } finally {
            this.syncInProgress = false;
        }
    }

    // Clear all cached data
    async clearCache(): Promise<void> {
        storage.clear();
        this.pendingChanges = [];
    }

    // Get sync status
    getSyncStatus(): SyncStatus {
        return {
            isOnline: this.isOnline,
            lastSync: new Date(),
            pendingChanges: this.pendingChanges.length,
            hasConflicts: false
        };
    }

    // Force sync
    async forceSync(): Promise<void> {
        await this.syncPendingChanges();
    }
}

export const supabaseStorage = new SupabaseStorage(); 