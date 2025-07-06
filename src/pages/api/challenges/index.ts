// src/pages/api/challenges/index.ts
// API route for challenge management
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
                return await getChallenges(res, userId);

            case 'POST':
                return await createChallenge(req, res, userId);

            case 'PUT':
                return await updateChallenge(req, res, userId);

            default:
                return res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (error) {
        console.error('Challenge API error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

async function getChallenges(res: NextApiResponse, userId: string) {
    const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        return res.status(500).json({ error: 'Database error' });
    }

    return res.status(200).json({ challenges: data });
}

async function createChallenge(req: NextApiRequest, res: NextApiResponse, userId: string) {
    const { start_date } = req.body;

    if (!start_date) {
        return res.status(400).json({ error: 'Start date is required' });
    }

    // Calculate end date (75 days from start)
    const startDate = new Date(start_date);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 74); // 74 days later = 75 total days

    // Deactivate any existing active challenges
    await supabase
        .from('challenges')
        .update({ is_active: false })
        .eq('user_id', userId)
        .eq('is_active', true);

    const { data, error } = await supabase
        .from('challenges')
        .insert({
            user_id: userId,
            start_date: startDate.toISOString().split('T')[0],
            end_date: endDate.toISOString().split('T')[0],
            is_active: true,
            current_day: 1,
        })
        .select()
        .single();

    if (error) {
        return res.status(500).json({ error: 'Failed to create challenge' });
    }

    return res.status(201).json({ challenge: data });
}

async function updateChallenge(req: NextApiRequest, res: NextApiResponse, userId: string) {
    const { challenge_id, current_day, is_active } = req.body;

    if (!challenge_id) {
        return res.status(400).json({ error: 'Challenge ID is required' });
    }

    const updateData: any = {};
    if (current_day !== undefined) updateData.current_day = current_day;
    if (is_active !== undefined) updateData.is_active = is_active;

    if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: 'No valid fields to update' });
    }

    const { data, error } = await supabase
        .from('challenges')
        .update(updateData)
        .eq('id', challenge_id)
        .eq('user_id', userId)
        .select()
        .single();

    if (error) {
        return res.status(500).json({ error: 'Failed to update challenge' });
    }

    return res.status(200).json({ challenge: data });
} 