// src/lib/supabase.ts
// Supabase client configuration for database operations
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tcckuapgqcyhnqjmodql.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjY2t1YXBncWN5aG5xam1vZHFsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTgwMTgxOSwiZXhwIjoyMDY3Mzc3ODE5fQ.kVzETCYPx72SAsm8HZoAUR5OE-JnuFQvCrrdbzWwj4Q';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Database table names
export const TABLES = {
    USERS: 'users',
    CHALLENGES: 'challenges',
    DAILY_PROGRESS: 'daily_progress',
    CUSTOM_TASKS: 'custom_tasks',
} as const; 