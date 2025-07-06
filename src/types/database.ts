// src/types/database.ts
// Database types for Supabase tables
export interface DatabaseUser {
    id: string;
    email: string;
    name: string;
    google_id?: string;
    avatar_url?: string;
    created_at: string;
    updated_at: string;
}

export interface DatabaseChallenge {
    id: string;
    user_id: string;
    start_date: string;
    end_date: string;
    is_active: boolean;
    current_day: number;
    created_at: string;
    updated_at: string;
}

export interface DatabaseDailyProgress {
    id: string;
    user_id: string;
    challenge_id: string;
    date: string;
    day_number: number;
    all_completed: boolean;
    created_at: string;
    updated_at: string;
}

export interface DatabaseCustomTask {
    id: string;
    user_id: string;
    task_text: string;
    is_default: boolean;
    order_index: number;
    created_at: string;
    updated_at: string;
}

export interface DatabaseTaskCompletion {
    id: string;
    user_id: string;
    daily_progress_id: string;
    custom_task_id: string;
    completed: boolean;
    completed_at?: string;
    created_at: string;
    updated_at: string;
} 