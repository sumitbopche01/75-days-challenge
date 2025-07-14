// src/lib/api-client.ts
// API client service for backend communication with comprehensive error handling
import { DatabaseUser, DatabaseChallenge, DatabaseCustomTask } from '@/types/database';
import { handleApiError, handleAuthError, handleDatabaseError, handleValidationError, AppError } from './error-handler';

interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: AppError;
}

class ApiClient {
    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<ApiResponse<T>> {
        const url = `/api${endpoint}`;
        const config: RequestInit = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        };

        try {
            const response = await fetch(url, config);

            // Check if response is ok
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));

                // Handle different HTTP status codes
                let error: AppError;
                switch (response.status) {
                    case 401:
                        error = handleAuthError(errorData);
                        break;
                    case 400:
                        error = handleValidationError(errorData);
                        break;
                    case 404:
                        error = handleApiError({ ...errorData, status: 404 });
                        break;
                    case 500:
                        error = handleDatabaseError(errorData);
                        break;
                    default:
                        error = handleApiError({ ...errorData, status: response.status });
                }

                return { success: false, error };
            }

            const data = await response.json();
            return { success: true, data };

        } catch (error) {
            // Handle network errors
            const appError = handleApiError(error);
            return { success: false, error: appError };
        }
    }

    // User Profile API
    async getProfile(): Promise<ApiResponse<{ user: DatabaseUser | null }>> {
        return this.request('/users/profile');
    }

    async createProfile(data: {
        name: string;
        google_id?: string;
        avatar_url?: string;
    }): Promise<ApiResponse<{ user: DatabaseUser }>> {
        // Input validation
        if (!data.name || data.name.trim().length === 0) {
            const error = handleValidationError({ error: 'Name is required' });
            return { success: false, error };
        }

        if (data.name.length > 255) {
            const error = handleValidationError({ error: 'Name must be less than 255 characters' });
            return { success: false, error };
        }

        return this.request('/users/profile', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateProfile(data: {
        name?: string;
        avatar_url?: string;
    }): Promise<ApiResponse<{ user: DatabaseUser }>> {
        // Input validation
        if (data.name && data.name.length > 255) {
            const error = handleValidationError({ error: 'Name must be less than 255 characters' });
            return { success: false, error };
        }

        return this.request('/users/profile', {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    // Challenges API
    async getChallenges(): Promise<ApiResponse<{ challenges: DatabaseChallenge[] }>> {
        return this.request('/challenges');
    }

    async createChallenge(data: {
        start_date: string;
    }): Promise<ApiResponse<{ challenge: DatabaseChallenge }>> {
        // Input validation
        if (!data.start_date) {
            const error = handleValidationError({ error: 'Start date is required' });
            return { success: false, error };
        }

        // Validate date format (YYYY-MM-DD)
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(data.start_date)) {
            const error = handleValidationError({ error: 'Invalid date format. Use YYYY-MM-DD' });
            return { success: false, error };
        }

        return this.request('/challenges', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateChallenge(data: {
        challenge_id: string;
        current_day?: number;
        is_active?: boolean;
    }): Promise<ApiResponse<{ challenge: DatabaseChallenge }>> {
        // Input validation
        if (!data.challenge_id) {
            const error = handleValidationError({ error: 'Challenge ID is required' });
            return { success: false, error };
        }

        if (data.current_day && (data.current_day < 1 || data.current_day > 75)) {
            const error = handleValidationError({ error: 'Current day must be between 1 and 75' });
            return { success: false, error };
        }

        return this.request('/challenges', {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    // Custom Tasks API
    async getTasks(): Promise<ApiResponse<{ tasks: DatabaseCustomTask[] }>> {
        return this.request('/tasks/custom');
    }

    async createTask(data: {
        task_text: string;
        is_default?: boolean;
        order_index?: number;
    }): Promise<ApiResponse<{ task: DatabaseCustomTask }>> {
        // Input validation
        if (!data.task_text || data.task_text.trim().length === 0) {
            const error = handleValidationError({ error: 'Task text is required' });
            return { success: false, error };
        }

        if (data.task_text.length > 500) {
            const error = handleValidationError({ error: 'Task text must be less than 500 characters' });
            return { success: false, error };
        }

        if (data.order_index && data.order_index < 0) {
            const error = handleValidationError({ error: 'Order index must be non-negative' });
            return { success: false, error };
        }

        return this.request('/tasks/custom', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateTask(data: {
        task_id: string;
        task_text?: string;
        order_index?: number;
    }): Promise<ApiResponse<{ task: DatabaseCustomTask }>> {
        // Input validation
        if (!data.task_id) {
            const error = handleValidationError({ error: 'Task ID is required' });
            return { success: false, error };
        }

        if (data.task_text && data.task_text.length > 500) {
            const error = handleValidationError({ error: 'Task text must be less than 500 characters' });
            return { success: false, error };
        }

        if (data.order_index && data.order_index < 0) {
            const error = handleValidationError({ error: 'Order index must be non-negative' });
            return { success: false, error };
        }

        return this.request('/tasks/custom', {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async deleteTask(data: {
        task_id: string;
    }): Promise<ApiResponse<{ message: string }>> {
        // Input validation
        if (!data.task_id) {
            const error = handleValidationError({ error: 'Task ID is required' });
            return { success: false, error };
        }

        return this.request('/tasks/custom', {
            method: 'DELETE',
            body: JSON.stringify(data),
        });
    }

    // Helper method to initialize default tasks
    async initializeDefaultTasks(tasks: string[]): Promise<ApiResponse<{ tasks: DatabaseCustomTask[] }>> {
        if (!tasks || tasks.length === 0) {
            const error = handleValidationError({ error: 'Tasks array is required' });
            return { success: false, error };
        }

        const results: DatabaseCustomTask[] = [];
        let hasErrors = false;

        for (let i = 0; i < tasks.length; i++) {
            const taskText = tasks[i];
            const response = await this.createTask({
                task_text: taskText,
                is_default: true,
                order_index: i,
            });

            if (response.success && response.data) {
                results.push(response.data.task);
            } else {
                hasErrors = true;
                console.warn(`Failed to create default task: ${taskText}`, response.error);
            }
        }

        if (hasErrors && results.length === 0) {
            const error = handleDatabaseError({ error: 'Failed to initialize default tasks' });
            return { success: false, error };
        }

        return { success: true, data: { tasks: results } };
    }

    // Task completion API (new)
    async completeTask(data: {
        task_id: string;
        completed: boolean;
        date?: string;
    }): Promise<ApiResponse<{ success: boolean }>> {
        // Input validation
        if (!data.task_id) {
            const error = handleValidationError({ error: 'Task ID is required' });
            return { success: false, error };
        }

        const date = data.date || new Date().toISOString().split('T')[0];

        return this.request('/tasks/complete', {
            method: 'POST',
            body: JSON.stringify({
                task_id: data.task_id,
                completed: data.completed,
                date,
            }),
        });
    }

    // Get task completions for a specific date
    async getTaskCompletions(date?: string): Promise<ApiResponse<{ completions: any[] }>> {
        const queryDate = date || new Date().toISOString().split('T')[0];
        return this.request(`/tasks/completions?date=${queryDate}`);
    }

    // Health check endpoint
    async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
        return this.request('/health');
    }

    // Batch operations helper
    async batchRequest<T>(requests: (() => Promise<ApiResponse<T>>)[]): Promise<ApiResponse<T[]>> {
        try {
            const results = await Promise.allSettled(requests.map(req => req()));
            const successfulResults: T[] = [];
            const errors: AppError[] = [];

            results.forEach((result, index) => {
                if (result.status === 'fulfilled' && result.value.success) {
                    successfulResults.push(result.value.data!);
                } else if (result.status === 'fulfilled' && result.value.error) {
                    errors.push(result.value.error);
                } else if (result.status === 'rejected') {
                    errors.push(handleApiError(result.reason));
                }
            });

            if (errors.length > 0 && successfulResults.length === 0) {
                // All requests failed
                return { success: false, error: errors[0] };
            }

            return { success: true, data: successfulResults };
        } catch (error) {
            const appError = handleApiError(error);
            return { success: false, error: appError };
        }
    }
}

export const apiClient = new ApiClient(); 