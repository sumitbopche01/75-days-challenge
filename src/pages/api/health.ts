// src/pages/api/health.ts
// Health check endpoint for API monitoring
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase, supabaseConfig } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Check database connectivity
        const { data, error } = await supabase
            .from('users')
            .select('id')
            .limit(1);

        const isDbHealthy = !error;

        const healthStatus = {
            status: isDbHealthy ? 'healthy' : 'unhealthy',
            timestamp: new Date().toISOString(),
            version: process.env.npm_package_version || '1.0.0',
            database: {
                connected: isDbHealthy,
                error: error?.message || null
            },
            supabase: {
                configured: supabaseConfig.isConfigured,
                url: supabaseConfig.url,
                hasServiceKey: supabaseConfig.hasServiceKey,
                hasAnonKey: supabaseConfig.hasAnonKey
            },
            environment: process.env.NODE_ENV || 'development'
        };

        const statusCode = isDbHealthy ? 200 : 503;
        return res.status(statusCode).json(healthStatus);

    } catch (error) {
        console.error('Health check failed:', error);
        return res.status(503).json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
} 