// src/pages/api/tasks/custom.ts
// API route for custom tasks management
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
                return await getTasks(res, userId);

            case 'POST':
                return await createTask(req, res, userId);

            case 'PUT':
                return await updateTask(req, res, userId);

            case 'DELETE':
                return await deleteTask(req, res, userId);

            default:
                return res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (error) {
        console.error('Tasks API error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

async function getTasks(res: NextApiResponse, userId: string) {
    const { data, error } = await supabase
        .from('custom_tasks')
        .select('*')
        .eq('user_id', userId)
        .order('order_index', { ascending: true });

    if (error) {
        return res.status(500).json({ error: 'Database error' });
    }

    return res.status(200).json({ tasks: data });
}

async function createTask(req: NextApiRequest, res: NextApiResponse, userId: string) {
    const { task_text, is_default = false, order_index } = req.body;

    if (!task_text) {
        return res.status(400).json({ error: 'Task text is required' });
    }

    // If no order_index provided, get the next available index
    let finalOrderIndex = order_index;
    if (finalOrderIndex === undefined) {
        const { data: maxTask } = await supabase
            .from('custom_tasks')
            .select('order_index')
            .eq('user_id', userId)
            .order('order_index', { ascending: false })
            .limit(1)
            .single();

        finalOrderIndex = maxTask ? maxTask.order_index + 1 : 0;
    }

    const { data, error } = await supabase
        .from('custom_tasks')
        .insert({
            user_id: userId,
            task_text,
            is_default,
            order_index: finalOrderIndex,
        })
        .select()
        .single();

    if (error) {
        return res.status(500).json({ error: 'Failed to create task' });
    }

    return res.status(201).json({ task: data });
}

async function updateTask(req: NextApiRequest, res: NextApiResponse, userId: string) {
    const { task_id, task_text, order_index } = req.body;

    if (!task_id) {
        return res.status(400).json({ error: 'Task ID is required' });
    }

    const updateData: any = {};
    if (task_text !== undefined) updateData.task_text = task_text;
    if (order_index !== undefined) updateData.order_index = order_index;

    if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: 'No valid fields to update' });
    }

    const { data, error } = await supabase
        .from('custom_tasks')
        .update(updateData)
        .eq('id', task_id)
        .eq('user_id', userId)
        .select()
        .single();

    if (error) {
        return res.status(500).json({ error: 'Failed to update task' });
    }

    return res.status(200).json({ task: data });
}

async function deleteTask(req: NextApiRequest, res: NextApiResponse, userId: string) {
    const { task_id } = req.body;

    if (!task_id) {
        return res.status(400).json({ error: 'Task ID is required' });
    }

    const { error } = await supabase
        .from('custom_tasks')
        .delete()
        .eq('id', task_id)
        .eq('user_id', userId);

    if (error) {
        return res.status(500).json({ error: 'Failed to delete task' });
    }

    return res.status(200).json({ message: 'Task deleted successfully' });
} 