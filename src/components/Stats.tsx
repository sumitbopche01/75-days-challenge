// src/components/Stats.tsx
// Comprehensive statistics dashboard for 75 Hard Challenge progress tracking

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
    Trophy
} from 'lucide-react';
import { supabaseStorage } from '@/lib/supabase-storage';
import { DatabaseCustomTask } from '@/types/database';
import { errorHandler } from '@/lib/error-handler';

interface StatsData {
    totalDays: number;
    completedDays: number;
    currentDay: number;
    currentStreak: number;
    longestStreak: number;
    completionRate: number;
    tasksCompleted: { [taskId: string]: number };
    weeklyProgress: { week: number; completed: number; total: number }[];
    dailyCompletionTrend: { day: number; rate: number }[];
    mostActiveDay: string;
    averageTasksPerDay: number;
    perfectDays: number;
    consistencyScore: number;
}

interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ReactNode;
    color: string;
    trend?: {
        value: number;
        isPositive: boolean;
    };
}

const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    subtitle,
    icon,
    color,
    trend
}) => (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 hover:bg-white/15 transition-all duration-200">
        <div className="flex items-center justify-between mb-2">
            <div className={`p-2 rounded-lg ${color}`}>
                {icon}
            </div>
            {trend && (
                <div className={`flex items-center text-sm ${trend.isPositive ? 'text-green-400' : 'text-red-400'
                    }`}>
                    <TrendingUp className={`w-4 h-4 mr-1 ${!trend.isPositive ? 'rotate-180' : ''
                        }`} />
                    {Math.abs(trend.value)}%
                </div>
            )}
        </div>
        <div className="text-2xl font-bold text-white mb-1">{value}</div>
        <div className="text-white/70 text-sm">{title}</div>
        {subtitle && (
            <div className="text-white/50 text-xs mt-1">{subtitle}</div>
        )}
    </div>
);

interface ProgressChartProps {
    data: { day: number; rate: number }[];
    title: string;
}

const ProgressChart: React.FC<ProgressChartProps> = ({ data, title }) => {
    const maxRate = Math.max(...data.map(d => d.rate));
    const minRate = Math.min(...data.map(d => d.rate));

    return (
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <h3 className="text-white font-semibold mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                {title}
            </h3>
            <div className="h-32 flex items-end space-x-1">
                {data.slice(-14).map((point, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                        <div
                            className="w-full bg-gradient-to-t from-blue-500 to-purple-500 rounded-t-sm min-h-[4px] transition-all duration-300 hover:from-blue-400 hover:to-purple-400"
                            style={{
                                height: `${(point.rate / 100) * 100}%`,
                                minHeight: '4px'
                            }}
                        />
                        <div className="text-xs text-white/60 mt-1 text-center">
                            {point.day}
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex justify-between text-xs text-white/60 mt-2">
                <span>Last 14 Days</span>
                <span>{data.length > 0 ? data[data.length - 1]?.rate.toFixed(0) : 0}% Today</span>
            </div>
        </div>
    );
};

interface TaskBreakdownProps {
    tasks: DatabaseCustomTask[];
    completions: { [taskId: string]: number };
    totalDays: number;
}

const TaskBreakdown: React.FC<TaskBreakdownProps> = ({ tasks, completions, totalDays }) => {
    const getTaskIcon = (taskText: string) => {
        const text = taskText.toLowerCase();
        if (text.includes('water') || text.includes('drink')) return <Droplets className="w-4 h-4" />;
        if (text.includes('exercise') || text.includes('workout')) return <Dumbbell className="w-4 h-4" />;
        if (text.includes('read')) return <BookOpen className="w-4 h-4" />;
        if (text.includes('photo')) return <Camera className="w-4 h-4" />;
        if (text.includes('diet') || text.includes('food')) return <Utensils className="w-4 h-4" />;
        return <CheckCircle2 className="w-4 h-4" />;
    };

    const getCompletionColor = (rate: number) => {
        if (rate >= 90) return 'bg-green-500';
        if (rate >= 70) return 'bg-yellow-500';
        if (rate >= 50) return 'bg-orange-500';
        return 'bg-red-500';
    };

    return (
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <h3 className="text-white font-semibold mb-4 flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Task Performance
            </h3>
            <div className="space-y-3">
                {tasks.map(task => {
                    const completed = completions[task.id] || 0;
                    const rate = totalDays > 0 ? (completed / totalDays) * 100 : 0;

                    return (
                        <div key={task.id} className="space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2 flex-1">
                                    <div className="text-white/70">
                                        {getTaskIcon(task.task_text)}
                                    </div>
                                    <span className="text-white text-sm truncate">
                                        {task.task_text}
                                    </span>
                                </div>
                                <div className="text-white font-medium text-sm ml-2">
                                    {completed}/{totalDays}
                                </div>
                            </div>
                            <div className="w-full bg-white/20 rounded-full h-2">
                                <div
                                    className={`h-2 rounded-full transition-all duration-300 ${getCompletionColor(rate)}`}
                                    style={{ width: `${rate}%` }}
                                />
                            </div>
                            <div className="text-xs text-white/60 text-right">
                                {rate.toFixed(0)}% completion rate
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

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
                const stats = await calculateStats();
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

    const calculateStats = async (): Promise<StatsData> => {
        // Get historical completion data
        const completionsMap: { [date: string]: { [taskId: string]: boolean } } = {};
        const startDate = new Date(challengeStartDate);

        // Load completions for each day
        for (let i = 0; i < currentDay; i++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];

            const completionsResult = await supabaseStorage.getTaskCompletions(dateStr);
            if (completionsResult.success && completionsResult.data) {
                completionsMap[dateStr] = {};
                Object.entries(completionsResult.data).forEach(([taskId, completion]) => {
                    completionsMap[dateStr][taskId] = completion.completed;
                });
            }
        }

        // Calculate statistics
        const totalDays = currentDay - 1; // Days that have passed
        let completedDays = 0;
        let currentStreak = 0;
        let longestStreak = 0;
        let tempStreak = 0;
        let perfectDays = 0;

        const tasksCompleted: { [taskId: string]: number } = {};
        const dailyCompletionTrend: { day: number; rate: number }[] = [];
        const weeklyProgress: { week: number; completed: number; total: number }[] = [];

        // Initialize task completion counters
        customTasks.forEach(task => {
            tasksCompleted[task.id] = 0;
        });

        // Analyze each day
        for (let i = 0; i < totalDays; i++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];

            const dayCompletions = completionsMap[dateStr] || {};
            let dayTasksCompleted = 0;

            // Count completions for this day
            customTasks.forEach(task => {
                if (dayCompletions[task.id]) {
                    tasksCompleted[task.id]++;
                    dayTasksCompleted++;
                }
            });

            const dayCompletionRate = customTasks.length > 0
                ? (dayTasksCompleted / customTasks.length) * 100
                : 0;

            dailyCompletionTrend.push({
                day: i + 1,
                rate: dayCompletionRate
            });

            // Check if all tasks completed
            const allCompleted = dayTasksCompleted === customTasks.length && customTasks.length > 0;

            if (allCompleted) {
                completedDays++;
                perfectDays++;
                tempStreak++;
                longestStreak = Math.max(longestStreak, tempStreak);

                // Update current streak if this is a recent day
                if (i === totalDays - 1) {
                    currentStreak = tempStreak;
                }
            } else {
                tempStreak = 0;
                if (i === totalDays - 1) {
                    currentStreak = 0;
                }
            }

            // Weekly progress tracking
            const weekNumber = Math.floor(i / 7);
            if (!weeklyProgress[weekNumber]) {
                weeklyProgress[weekNumber] = { week: weekNumber + 1, completed: 0, total: 0 };
            }
            weeklyProgress[weekNumber].total++;
            if (allCompleted) {
                weeklyProgress[weekNumber].completed++;
            }
        }

        const completionRate = totalDays > 0 ? (completedDays / totalDays) * 100 : 0;
        const averageTasksPerDay = totalDays > 0
            ? Object.values(tasksCompleted).reduce((a, b) => a + b, 0) / totalDays
            : 0;

        // Calculate consistency score (based on how consistent the completion rates are)
        const rates = dailyCompletionTrend.map(d => d.rate);
        const avgRate = rates.reduce((a, b) => a + b, 0) / rates.length;
        const variance = rates.reduce((a, b) => a + Math.pow(b - avgRate, 2), 0) / rates.length;
        const consistencyScore = Math.max(0, 100 - Math.sqrt(variance));

        return {
            totalDays,
            completedDays,
            currentDay,
            currentStreak,
            longestStreak,
            completionRate,
            tasksCompleted,
            weeklyProgress: weeklyProgress.filter(w => w.total > 0),
            dailyCompletionTrend,
            mostActiveDay: 'Sunday', // Could be calculated from data
            averageTasksPerDay,
            perfectDays,
            consistencyScore
        };
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <RefreshCw className="w-8 h-8 text-white/60 animate-spin mx-auto mb-4" />
                    <p className="text-white/70">Loading your statistics...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-500/20 backdrop-blur-sm rounded-lg p-6 border border-red-500/30 text-center">
                <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Unable to Load Statistics</h3>
                <p className="text-white/70">{error}</p>
            </div>
        );
    }

    if (!statsData) {
        return (
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 text-center">
                <BarChart3 className="w-12 h-12 text-white/60 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Data Available</h3>
                <p className="text-white/70">Start completing tasks to see your statistics</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2 flex items-center justify-center">
                    <Trophy className="w-6 h-6 mr-2 text-yellow-400" />
                    Your Progress Analytics
                </h2>
                <p className="text-white/70">
                    Detailed insights into your 75 Hard Challenge journey
                </p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    title="Overall Progress"
                    value={`${statsData.completionRate.toFixed(0)}%`}
                    subtitle={`${statsData.completedDays}/${statsData.totalDays} days`}
                    icon={<TrendingUp className="w-5 h-5" />}
                    color="bg-gradient-to-br from-blue-500 to-purple-500"
                />

                <StatCard
                    title="Current Streak"
                    value={statsData.currentStreak}
                    subtitle="consecutive days"
                    icon={<Flame className="w-5 h-5" />}
                    color="bg-gradient-to-br from-orange-500 to-red-500"
                />

                <StatCard
                    title="Longest Streak"
                    value={statsData.longestStreak}
                    subtitle="best performance"
                    icon={<Award className="w-5 h-5" />}
                    color="bg-gradient-to-br from-yellow-500 to-orange-500"
                />

                <StatCard
                    title="Perfect Days"
                    value={statsData.perfectDays}
                    subtitle="100% completion"
                    icon={<Target className="w-5 h-5" />}
                    color="bg-gradient-to-br from-green-500 to-teal-500"
                />
            </div>

            {/* Secondary Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <StatCard
                    title="Consistency Score"
                    value={`${statsData.consistencyScore.toFixed(0)}%`}
                    subtitle="how consistent you are"
                    icon={<Activity className="w-5 h-5" />}
                    color="bg-gradient-to-br from-purple-500 to-pink-500"
                />

                <StatCard
                    title="Daily Average"
                    value={statsData.averageTasksPerDay.toFixed(1)}
                    subtitle="tasks per day"
                    icon={<Clock className="w-5 h-5" />}
                    color="bg-gradient-to-br from-indigo-500 to-blue-500"
                />

                <StatCard
                    title="Days Remaining"
                    value={Math.max(0, 75 - statsData.currentDay + 1)}
                    subtitle="to complete challenge"
                    icon={<Calendar className="w-5 h-5" />}
                    color="bg-gradient-to-br from-teal-500 to-cyan-500"
                />
            </div>

            {/* Charts and Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Progress Trend Chart */}
                <ProgressChart
                    data={statsData.dailyCompletionTrend}
                    title="Daily Completion Trend"
                />

                {/* Task Performance Breakdown */}
                <TaskBreakdown
                    tasks={customTasks}
                    completions={statsData.tasksCompleted}
                    totalDays={statsData.totalDays}
                />
            </div>

            {/* Weekly Progress Overview */}
            {statsData.weeklyProgress.length > 0 && (
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                    <h3 className="text-white font-semibold mb-4 flex items-center">
                        <Calendar className="w-5 h-5 mr-2" />
                        Weekly Performance
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                        {statsData.weeklyProgress.map(week => {
                            const rate = week.total > 0 ? (week.completed / week.total) * 100 : 0;
                            const getColor = (rate: number) => {
                                if (rate >= 90) return 'bg-green-500';
                                if (rate >= 70) return 'bg-yellow-500';
                                if (rate >= 50) return 'bg-orange-500';
                                return 'bg-red-500';
                            };

                            return (
                                <div key={week.week} className="text-center">
                                    <div className="text-xs text-white/60 mb-2">Week {week.week}</div>
                                    <div className={`w-full h-16 rounded-lg ${getColor(rate)} flex items-center justify-center`}>
                                        <div className="text-white font-bold text-sm">
                                            {rate.toFixed(0)}%
                                        </div>
                                    </div>
                                    <div className="text-xs text-white/60 mt-1">
                                        {week.completed}/{week.total}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Motivational Insights */}
            <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur-sm rounded-lg p-6 border border-purple-500/30">
                <h3 className="text-white font-semibold mb-4 flex items-center">
                    <Trophy className="w-5 h-5 mr-2 text-yellow-400" />
                    Insights & Achievements
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                        <div className="flex items-center text-white/90">
                            <CheckCircle2 className="w-4 h-4 mr-2 text-green-400" />
                            You've completed {statsData.perfectDays} perfect days!
                        </div>
                        <div className="flex items-center text-white/90">
                            <Flame className="w-4 h-4 mr-2 text-orange-400" />
                            Your best streak was {statsData.longestStreak} days
                        </div>
                        <div className="flex items-center text-white/90">
                            <Target className="w-4 h-4 mr-2 text-blue-400" />
                            {statsData.completionRate >= 80
                                ? "Excellent progress! Keep it up!"
                                : statsData.completionRate >= 60
                                    ? "Good consistency, push for more!"
                                    : "Every day is a new opportunity!"}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center text-white/90">
                            <Activity className="w-4 h-4 mr-2 text-purple-400" />
                            Consistency score: {statsData.consistencyScore.toFixed(0)}%
                        </div>
                        <div className="flex items-center text-white/90">
                            <Clock className="w-4 h-4 mr-2 text-cyan-400" />
                            Average {statsData.averageTasksPerDay.toFixed(1)} tasks per day
                        </div>
                        <div className="flex items-center text-white/90">
                            <Calendar className="w-4 h-4 mr-2 text-teal-400" />
                            {Math.max(0, 75 - statsData.currentDay + 1)} days left in challenge
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Stats; 