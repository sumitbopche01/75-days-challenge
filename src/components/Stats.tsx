// src/components/Stats.tsx
// Comprehensive Challenge Analytics: Historical performance, trends, and overall progress insights

import React, { useState, useEffect } from 'react';
import {
    TrendingUp,
    Target,
    Calendar,
    Award,
    BarChart3,
    Clock,
    Flame,
    CheckCircle2,
    AlertCircle,
    Activity,
    BookOpen,
    Droplets,
    Camera,
    Utensils,
    Dumbbell,
    RefreshCw,
    Trophy,
    Star,
    Zap,
    TrendingDown
} from 'lucide-react';
import { supabaseStorage } from '@/lib/supabase-storage';
import { DatabaseCustomTask } from '@/types/database';
import { errorHandler } from '@/lib/error-handler';
import { StatCardSkeleton, ChartSkeleton, TaskBreakdownSkeleton } from './SkeletonLoaders';

interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ReactNode;
    color: string;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
}

const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    subtitle,
    icon,
    color,
    trend,
    trendValue
}) => (
    <div className="bg-gradient-to-br from-white/15 via-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:border-white/30 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/10 group">
        <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl shadow-lg ${color} group-hover:scale-110 transition-transform duration-200`}>
                {icon}
            </div>
            {trend && trendValue && (
                <div className={`flex items-center text-xs px-2 py-1 rounded-full ${trend === 'up' ? 'bg-green-500/20 text-green-300' :
                        trend === 'down' ? 'bg-red-500/20 text-red-300' :
                            'bg-gray-500/20 text-gray-300'
                    }`}>
                    {trend === 'up' ? <TrendingUp className="w-3 h-3 mr-1" /> :
                        trend === 'down' ? <TrendingDown className="w-3 h-3 mr-1" /> :
                            <Target className="w-3 h-3 mr-1" />}
                    {trendValue}
                </div>
            )}
        </div>
        <div className="text-center">
            <div className="text-3xl font-bold text-white mb-2 tracking-tight drop-shadow-sm">{value}</div>
            <div className="text-white/80 text-sm font-medium mb-1">{title}</div>
            {subtitle && (
                <div className="text-white/60 text-xs">{subtitle}</div>
            )}
        </div>
    </div>
);

interface StatsData {
    totalDays: number;
    completedDays: number;
    currentDay: number;
    currentStreak: number;
    longestStreak: number;
    completionRate: number;
    totalTasksCompleted: number;
    averageTasksPerDay: number;
    perfectDays: number;
    challengeProgress: number;
    daysRemaining: number;
    consistencyScore: number;
    weeklyAverage: number;
}

interface StatsProps {
    challengeStartDate: string;
    currentDay: number;
    customTasks: DatabaseCustomTask[];
}

const Stats: React.FC<StatsProps> = ({ challengeStartDate, currentDay, customTasks }) => {
    const [statsData, setStatsData] = useState<StatsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadStats = async () => {
            setLoading(true);
            setError(null);

            try {
                const stats = await calculateOverallStats();
                setStatsData(stats);
            } catch (err) {
                const appError = errorHandler.handle(err, { category: 'database' });
                setError(appError.message);
            }

            setLoading(false);
        };

        if (challengeStartDate && customTasks.length > 0) {
            loadStats();
        }
    }, [challengeStartDate, currentDay, customTasks]);

    const calculateOverallStats = async (): Promise<StatsData> => {
        const totalDays = currentDay - 1; // Days that have passed
        const daysRemaining = Math.max(0, 75 - currentDay + 1);

        if (totalDays <= 0) {
            return {
                totalDays: 0,
                completedDays: 0,
                currentDay,
                currentStreak: 0,
                longestStreak: 0,
                completionRate: 0,
                totalTasksCompleted: 0,
                averageTasksPerDay: 0,
                perfectDays: 0,
                challengeProgress: Math.round((currentDay / 75) * 100),
                daysRemaining,
                consistencyScore: 0,
                weeklyAverage: 0
            };
        }

        // Load recent days for comprehensive stats
        const daysToCheck = Math.min(totalDays, 21); // Last 3 weeks max
        const startDate = new Date(challengeStartDate);

        let completedDays = 0;
        let totalTasksCompleted = 0;
        let perfectDays = 0;
        let currentStreak = 0;
        let longestStreak = 0;
        let tempStreak = 0;
        let weeklyCompletions = 0;

        // Load completion data for recent days
        const completionPromises = [];
        for (let i = Math.max(0, totalDays - daysToCheck); i < totalDays; i++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];
            completionPromises.push(
                supabaseStorage.getTaskCompletions(dateStr).then(result => ({
                    day: i,
                    date: dateStr,
                    result
                }))
            );
        }

        const results = await Promise.all(completionPromises);

        // Process results for comprehensive stats
        let streakActive = true;
        results.reverse().forEach(({ day, result }, index) => {
            if (result.success && result.data) {
                const completions = Object.values(result.data);
                const dayTasksCompleted = completions.filter(c => c.completed).length;
                const allTasksCompleted = dayTasksCompleted === customTasks.length && customTasks.length > 0;

                totalTasksCompleted += dayTasksCompleted;

                if (allTasksCompleted) {
                    completedDays++;
                    perfectDays++;
                    tempStreak++;
                    longestStreak = Math.max(longestStreak, tempStreak);

                    // Calculate current streak (from most recent backwards)
                    if (streakActive) {
                        currentStreak = tempStreak;
                    }
                } else {
                    tempStreak = 0;
                    streakActive = false;
                }

                // Weekly average (last 7 days)
                if (index < 7) {
                    weeklyCompletions += dayTasksCompleted;
                }
            }
        });

        const completionRate = daysToCheck > 0 ? (completedDays / daysToCheck) * 100 : 0;
        const averageTasksPerDay = daysToCheck > 0 ? totalTasksCompleted / daysToCheck : 0;
        const challengeProgress = Math.round((currentDay / 75) * 100);
        const consistencyScore = daysToCheck > 0 ? (perfectDays / daysToCheck) * 100 : 0;
        const weeklyAverage = Math.min(7, daysToCheck) > 0 ? weeklyCompletions / Math.min(7, daysToCheck) : 0;

        return {
            totalDays: daysToCheck,
            completedDays,
            currentDay,
            currentStreak,
            longestStreak,
            completionRate,
            totalTasksCompleted,
            averageTasksPerDay,
            perfectDays,
            challengeProgress,
            daysRemaining,
            consistencyScore,
            weeklyAverage
        };
    };

    const getPerformanceLevel = (score: number) => {
        if (score >= 90) return { level: 'Elite', color: 'text-yellow-400', icon: '🏆' };
        if (score >= 75) return { level: 'Excellent', color: 'text-green-400', icon: '🌟' };
        if (score >= 60) return { level: 'Good', color: 'text-blue-400', icon: '💪' };
        if (score >= 40) return { level: 'Fair', color: 'text-yellow-600', icon: '⚡' };
        return { level: 'Needs Work', color: 'text-red-400', icon: '🎯' };
    };

    if (error) {
        return (
            <div className="bg-red-500/20 backdrop-blur-sm rounded-lg p-6 border border-red-500/30 text-center">
                <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Unable to Load Analytics</h3>
                <p className="text-white/70">{error}</p>
            </div>
        );
    }

    if (loading || !statsData) {
        return (
            <div className="space-y-8">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-white mb-3 flex items-center justify-center tracking-tight">
                        <BarChart3 className="w-8 h-8 mr-3 text-blue-400 drop-shadow-lg" />
                        Challenge Analytics
                    </h2>
                    <p className="text-white/80 text-lg">
                        Loading your performance data...
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    <StatCardSkeleton />
                    <StatCardSkeleton />
                    <StatCardSkeleton />
                    <StatCardSkeleton />
                    <StatCardSkeleton />
                    <StatCardSkeleton />
                </div>
            </div>
        );
    }

    const performance = getPerformanceLevel(statsData.consistencyScore);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-3 flex items-center justify-center tracking-tight">
                    <BarChart3 className="w-8 h-8 mr-3 text-blue-400 drop-shadow-lg" />
                    Challenge Analytics
                </h2>
                <p className="text-white/80 text-lg">
                    Your complete 75 Hard performance overview
                </p>
            </div>

            {/* Overall Progress Banner */}
            <div className="bg-gradient-to-r from-purple-600/30 via-blue-600/30 to-cyan-600/30 backdrop-blur-xl rounded-3xl p-8 border border-purple-400/30 shadow-2xl">
                <div className="text-center">
                    <div className="text-5xl font-bold text-white mb-2">
                        {statsData.challengeProgress}%
                    </div>
                    <div className="text-white/90 text-xl mb-4">
                        Challenge Progress • Day {statsData.currentDay} of 75
                    </div>
                    <div className="flex items-center justify-center space-x-8 text-white/80">
                        <div className="text-center">
                            <div className="text-2xl font-bold">{statsData.daysRemaining}</div>
                            <div className="text-sm">Days Left</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold">{statsData.perfectDays}</div>
                            <div className="text-sm">Perfect Days</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold">{statsData.longestStreak}</div>
                            <div className="text-sm">Best Streak</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Performance Level */}
            <div className="bg-gradient-to-br from-white/10 via-white/5 to-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 text-center">
                <div className="text-4xl mb-3">{performance.icon}</div>
                <div className={`text-2xl font-bold ${performance.color} mb-2`}>
                    {performance.level} Performance
                </div>
                <div className="text-white/70">
                    {statsData.consistencyScore.toFixed(0)}% consistency score based on perfect days
                </div>
            </div>

            {/* Detailed Analytics */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <StatCard
                    title="Perfect Days"
                    value={statsData.perfectDays}
                    subtitle="All tasks completed"
                    icon={<Target className="w-6 h-6" />}
                    color="bg-gradient-to-br from-emerald-500 to-teal-600"
                    trend={statsData.perfectDays > 0 ? 'up' : 'neutral'}
                    trendValue={`${statsData.consistencyScore.toFixed(0)}%`}
                />

                <StatCard
                    title="Current Streak"
                    value={statsData.currentStreak}
                    subtitle="consecutive perfect days"
                    icon={<Flame className="w-6 h-6" />}
                    color="bg-gradient-to-br from-orange-500 to-red-600"
                    trend={statsData.currentStreak > 0 ? 'up' : 'neutral'}
                    trendValue={`Day ${statsData.currentStreak}`}
                />

                <StatCard
                    title="Best Streak"
                    value={statsData.longestStreak}
                    subtitle="personal record"
                    icon={<Award className="w-6 h-6" />}
                    color="bg-gradient-to-br from-yellow-500 to-orange-600"
                    trend="neutral"
                    trendValue="Record"
                />

                <StatCard
                    title="Success Rate"
                    value={`${statsData.completionRate.toFixed(0)}%`}
                    subtitle="recent performance"
                    icon={<Activity className="w-6 h-6" />}
                    color="bg-gradient-to-br from-purple-500 to-pink-600"
                    trend={statsData.completionRate >= 75 ? 'up' : statsData.completionRate >= 50 ? 'neutral' : 'down'}
                    trendValue={`${statsData.completionRate.toFixed(0)}%`}
                />

                <StatCard
                    title="Daily Average"
                    value={statsData.averageTasksPerDay.toFixed(1)}
                    subtitle="tasks completed"
                    icon={<Clock className="w-6 h-6" />}
                    color="bg-gradient-to-br from-indigo-500 to-blue-600"
                    trend={statsData.averageTasksPerDay >= customTasks.length * 0.8 ? 'up' : 'neutral'}
                    trendValue={`/${customTasks.length}`}
                />

                <StatCard
                    title="Weekly Average"
                    value={statsData.weeklyAverage.toFixed(1)}
                    subtitle="last 7 days"
                    icon={<Calendar className="w-6 h-6" />}
                    color="bg-gradient-to-br from-teal-500 to-cyan-600"
                    trend="neutral"
                    trendValue="Recent"
                />
            </div>

            {/* Achievements & Insights */}
            <div className="bg-gradient-to-br from-purple-500/20 via-blue-500/15 to-cyan-500/20 backdrop-blur-xl rounded-3xl p-8 border border-purple-400/30 shadow-2xl shadow-purple-500/10">
                <h3 className="text-white font-bold text-xl mb-6 flex items-center">
                    <Trophy className="w-6 h-6 mr-3 text-yellow-400" />
                    Performance Insights
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-base">
                    <div className="space-y-4">
                        <div className="flex items-center text-white/90 bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/20">
                            <CheckCircle2 className="w-5 h-5 mr-3 text-emerald-400 flex-shrink-0" />
                            <span>
                                <strong>{statsData.perfectDays}</strong> perfect days completed
                                {statsData.perfectDays > 0 && <span className="block text-sm text-white/70">That's {statsData.consistencyScore.toFixed(0)}% consistency!</span>}
                            </span>
                        </div>
                        <div className="flex items-center text-white/90 bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/20">
                            <Flame className="w-5 h-5 mr-3 text-orange-400 flex-shrink-0" />
                            <span>
                                Best streak: <strong>{statsData.longestStreak}</strong> day{statsData.longestStreak !== 1 ? 's' : ''}
                                {statsData.currentStreak > 0 && <span className="block text-sm text-white/70">Currently on {statsData.currentStreak} day streak!</span>}
                            </span>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center text-white/90 bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/20">
                            <Activity className="w-5 h-5 mr-3 text-purple-400 flex-shrink-0" />
                            <span>
                                <strong>{statsData.completionRate.toFixed(0)}%</strong> recent success rate
                                <span className="block text-sm text-white/70">Based on last {statsData.totalDays} days</span>
                            </span>
                        </div>
                        <div className="flex items-center text-white/90 bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/20">
                            <Star className="w-5 h-5 mr-3 text-yellow-400 flex-shrink-0" />
                            <span>
                                <strong>{performance.level}</strong> performance level
                                <span className="block text-sm text-white/70">{performance.icon} Keep pushing forward!</span>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Stats; 