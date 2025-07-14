// src/lib/supabase.ts
// Supabase client configuration for database operations
import { createClient } from '@supabase/supabase-js';

// Get configuration from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validate environment variables
if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
}

if (!supabaseServiceKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
}

// Create Supabase client with service role key for server-side operations
export const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Create client-side Supabase client for public operations
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseAnonKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
}

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Database table names
export const TABLES = {
    USERS: 'users',
    CHALLENGES: 'challenges',
    DAILY_PROGRESS: 'daily_progress',
    CUSTOM_TASKS: 'custom_tasks',
    TASK_COMPLETIONS: 'task_completions',
} as const;

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = (): boolean => {
    return !!(supabaseUrl && supabaseServiceKey && supabaseAnonKey);
};

// Export configuration for debugging (without sensitive data)
export const supabaseConfig = {
    url: supabaseUrl,
    hasServiceKey: !!supabaseServiceKey,
    hasAnonKey: !!supabaseAnonKey,
    isConfigured: isSupabaseConfigured(),
}; 