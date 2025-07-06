// src/lib/api-client.ts
// API client service for backend communication
import { DatabaseUser, DatabaseChallenge, DatabaseCustomTask } from '@/types/database';

class ApiClient {
    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
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
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `HTTP error! status: ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error(`API request failed: ${endpoint}`, error);
            throw error;
        }
    }

    // User Profile API
    async getProfile(): Promise<{ user: DatabaseUser | null }> {
        return this.request('/users/profile');
    }

    async createProfile(data: {
        name: string;
        google_id?: string;
        avatar_url?: string;
    }): Promise<{ user: DatabaseUser }> {
        return this.request('/users/profile', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateProfile(data: {
        name?: string;
        avatar_url?: string;
    }): Promise<{ user: DatabaseUser }> {
        return this.request('/users/profile', {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    // Challenges API
    async getChallenges(): Promise<{ challenges: DatabaseChallenge[] }> {
        return this.request('/challenges');
    }

    async createChallenge(data: {
        start_date: string;
    }): Promise<{ challenge: DatabaseChallenge }> {
        return this.request('/challenges', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateChallenge(data: {
        challenge_id: string;
        current_day?: number;
        is_active?: boolean;
    }): Promise<{ challenge: DatabaseChallenge }> {
        return this.request('/challenges', {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    // Custom Tasks API
    async getTasks(): Promise<{ tasks: DatabaseCustomTask[] }> {
        return this.request('/tasks/custom');
    }

    async createTask(data: {
        task_text: string;
        is_default?: boolean;
        order_index?: number;
    }): Promise<{ task: DatabaseCustomTask }> {
        return this.request('/tasks/custom', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateTask(data: {
        task_id: string;
        task_text?: string;
        order_index?: number;
    }): Promise<{ task: DatabaseCustomTask }> {
        return this.request('/tasks/custom', {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async deleteTask(data: {
        task_id: string;
    }): Promise<{ message: string }> {
        return this.request('/tasks/custom', {
            method: 'DELETE',
            body: JSON.stringify(data),
        });
    }

    // Bulk operations for initial setup
    async initializeDefaultTasks(tasks: string[]): Promise<{ tasks: DatabaseCustomTask[] }> {
        const taskPromises = tasks.map((task, index) =>
            this.createTask({
                task_text: task,
                is_default: true,
                order_index: index,
            })
        );

        const results = await Promise.all(taskPromises);
        return { tasks: results.map(r => r.task) };
    }
}

export const apiClient = new ApiClient(); 