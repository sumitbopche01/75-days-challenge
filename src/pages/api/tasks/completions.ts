// src/pages/api/tasks/completions.ts
// API route for retrieving task completions
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { supabase } from '@/lib/supabase';
import { authOptions } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const session = await getServerSession(req, res, authOptions);

        if (!session?.user?.email) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Get user ID from email
        const { data: user } = await supabase
            .from('users')
            .select('id')
            .eq('email', session.user.email)
            .single();

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userId = user.id;

        switch (req.method) {
            case 'GET':
                return await getTaskCompletions(req, res, userId);

            default:
                return res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (error) {
        console.error('Task completions API error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

async function getTaskCompletions(req: NextApiRequest, res: NextApiResponse, userId: string) {
    const { date } = req.query;

    // Use today's date if not provided
    const targetDate = (date as string) || new Date().toISOString().split('T')[0];

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(targetDate)) {
        return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    }

    // Get active challenge
    const { data: challenge } = await supabase
        .from('challenges')
        .select('id')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

    if (!challenge) {
        return res.status(404).json({ error: 'No active challenge found' });
    }

    // Get daily progress for the date
    const { data: dailyProgress } = await supabase
        .from('daily_progress')
        .select('id, all_completed, day_number')
        .eq('user_id', userId)
        .eq('challenge_id', challenge.id)
        .eq('date', targetDate)
        .single();

    if (!dailyProgress) {
        // No progress record found for this date
        return res.status(200).json({
            completions: [],
            daily_progress: null,
            date: targetDate
        });
    }

    // Get all task completions for the day
    const { data: completions, error: completionsError } = await supabase
        .from('task_completions')
        .select(`
            id,
            custom_task_id,
            completed,
            completed_at,
            custom_tasks!inner(
                id,
                task_text,
                is_default,
                order_index
            )
        `)
        .eq('daily_progress_id', dailyProgress.id)
        .eq('user_id', userId)
        .order('custom_tasks.order_index');

    if (completionsError) {
        return res.status(500).json({ error: 'Failed to retrieve task completions' });
    }

    // Format the response
    const formattedCompletions = completions.map(completion => {
        const customTask = Array.isArray(completion.custom_tasks) 
            ? completion.custom_tasks[0] 
            : completion.custom_tasks;
            
        return {
            id: completion.id,
            custom_task_id: completion.custom_task_id,
            task_text: customTask?.task_text,
            is_default: customTask?.is_default,
            order_index: customTask?.order_index,
            completed: completion.completed,
            completed_at: completion.completed_at
        };
    });

    return res.status(200).json({
        completions: formattedCompletions,
        daily_progress: {
            id: dailyProgress.id,
            all_completed: dailyProgress.all_completed,
            day_number: dailyProgress.day_number
        },
        date: targetDate
    });
} 