// src/pages/api/tasks/complete.ts
// API route for task completion tracking
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
            case 'POST':
                return await completeTask(req, res, userId);

            default:
                return res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (error) {
        console.error('Task completion API error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

async function completeTask(req: NextApiRequest, res: NextApiResponse, userId: string) {
    const { task_id, completed, date } = req.body;

    // Input validation
    if (!task_id) {
        return res.status(400).json({ error: 'Task ID is required' });
    }

    if (typeof completed !== 'boolean') {
        return res.status(400).json({ error: 'Completed must be a boolean' });
    }

    const targetDate = date || new Date().toISOString().split('T')[0];

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(targetDate)) {
        return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    }

    // Verify task belongs to user
    const { data: task, error: taskError } = await supabase
        .from('custom_tasks')
        .select('id')
        .eq('id', task_id)
        .eq('user_id', userId)
        .single();

    if (taskError || !task) {
        return res.status(404).json({ error: 'Task not found or access denied' });
    }

    // Get or create active challenge
    const { data: challenge } = await supabase
        .from('challenges')
        .select('id')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

    if (!challenge) {
        return res.status(404).json({ error: 'No active challenge found' });
    }

    // Calculate day number based on challenge start date
    const { data: challengeData } = await supabase
        .from('challenges')
        .select('start_date')
        .eq('id', challenge.id)
        .single();

    if (!challengeData) {
        return res.status(404).json({ error: 'Challenge data not found' });
    }

    const startDate = new Date(challengeData.start_date);
    const currentDate = new Date(targetDate);
    const dayNumber = Math.ceil((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // Get or create daily progress record
    let { data: dailyProgress, error: progressError } = await supabase
        .from('daily_progress')
        .select('id')
        .eq('user_id', userId)
        .eq('challenge_id', challenge.id)
        .eq('date', targetDate)
        .single();

    if (progressError && progressError.code === 'PGRST116') {
        // Create new daily progress record
        const { data: newProgress, error: createError } = await supabase
            .from('daily_progress')
            .insert({
                user_id: userId,
                challenge_id: challenge.id,
                date: targetDate,
                day_number: dayNumber,
                all_completed: false
            })
            .select('id')
            .single();

        if (createError) {
            return res.status(500).json({ error: 'Failed to create daily progress record' });
        }

        dailyProgress = newProgress;
    } else if (progressError) {
        return res.status(500).json({ error: 'Database error' });
    }

    if (!dailyProgress) {
        return res.status(500).json({ error: 'Failed to get or create daily progress record' });
    }

    // Upsert task completion
    const { data: taskCompletion, error: completionError } = await supabase
        .from('task_completions')
        .upsert({
            user_id: userId,
            daily_progress_id: dailyProgress.id,
            custom_task_id: task_id,
            completed,
            completed_at: completed ? new Date().toISOString() : null
        }, {
            onConflict: 'daily_progress_id,custom_task_id'
        })
        .select()
        .single();

    if (completionError) {
        return res.status(500).json({ error: 'Failed to save task completion' });
    }

    // Check if all tasks are completed for the day
    const { data: allCompletions } = await supabase
        .from('task_completions')
        .select('completed, custom_tasks!inner(user_id)')
        .eq('daily_progress_id', dailyProgress.id)
        .eq('custom_tasks.user_id', userId);

    const { data: userTasks } = await supabase
        .from('custom_tasks')
        .select('id')
        .eq('user_id', userId);

    const allTasksCompleted = allCompletions && userTasks &&
        allCompletions.length === userTasks.length &&
        allCompletions.every(completion => completion.completed);

    // Update daily progress all_completed status
    await supabase
        .from('daily_progress')
        .update({ all_completed: allTasksCompleted })
        .eq('id', dailyProgress.id);

    return res.status(200).json({
        success: true,
        completion: taskCompletion,
        all_completed: allTasksCompleted,
        day_number: dayNumber
    });
} 