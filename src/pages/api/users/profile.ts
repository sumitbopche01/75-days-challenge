// src/pages/api/users/profile.ts
// API route for user profile management
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { supabase } from '@/lib/supabase';
import { DatabaseUser } from '@/types/database';
import { authOptions } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const session = await getServerSession(req, res, authOptions);

        if (!session?.user?.email) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const userEmail = session.user.email;

        switch (req.method) {
            case 'GET':
                return await getProfile(res, userEmail);

            case 'POST':
                return await createProfile(req, res, userEmail);

            case 'PUT':
                return await updateProfile(req, res, userEmail);

            default:
                return res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (error) {
        console.error('Profile API error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

async function getProfile(res: NextApiResponse, email: string) {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        return res.status(500).json({ error: 'Database error' });
    }

    return res.status(200).json({ user: data });
}

async function createProfile(req: NextApiRequest, res: NextApiResponse, email: string) {
    const { name, google_id, avatar_url } = req.body;

    if (!name) {
        return res.status(400).json({ error: 'Name is required' });
    }

    const { data, error } = await supabase
        .from('users')
        .insert({
            email,
            name,
            google_id,
            avatar_url,
        })
        .select()
        .single();

    if (error) {
        if (error.code === '23505') { // Unique constraint violation
            return res.status(409).json({ error: 'User already exists' });
        }
        return res.status(500).json({ error: 'Failed to create user' });
    }

    return res.status(201).json({ user: data });
}

async function updateProfile(req: NextApiRequest, res: NextApiResponse, email: string) {
    const { name, avatar_url } = req.body;

    const updateData: Partial<DatabaseUser> = {};
    if (name) updateData.name = name;
    if (avatar_url) updateData.avatar_url = avatar_url;

    if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: 'No valid fields to update' });
    }

    const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('email', email)
        .select()
        .single();

    if (error) {
        return res.status(500).json({ error: 'Failed to update user' });
    }

    return res.status(200).json({ user: data });
} 