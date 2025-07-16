// src/components/ProgressOverview.tsx
// Daily Focus component: Shows today's progress, motivation, and what needs to be done TODAY
import React from 'react';
import { getMotivationalMessage } from '@/lib/utils';
import { DatabaseCustomTask } from '@/types/database';
import { CheckCircle2, Clock, Target, Flame } from 'lucide-react';

interface ProgressOverviewProps {
    currentDay: number;
    progressPercentage: number;
    isActive: boolean;
    completedTasks: { [key: string]: string | boolean };
    customTasks: DatabaseCustomTask[];
    todayProgress: any;
}

const ProgressOverview: React.FC<ProgressOverviewProps> = ({
    currentDay,
    progressPercentage,
    isActive,
    completedTasks,
    customTasks,
    todayProgress,
}) => {
    const completedCount = Object.values(completedTasks).filter(val => val !== false).length;
    const totalTasks = customTasks.length;
    const allCompleted = completedCount === totalTasks && totalTasks > 0;
    const todayProgressPercentage = totalTasks > 0 ? (completedCount / totalTasks) * 100 : 0;

    const getTimeBasedGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning! 🌅";
        if (hour < 17) return "Good afternoon! ☀️";
        return "Good evening! 🌙";
    };

    const getDailyMotivation = () => {
        if (allCompleted) {
            return "Amazing! You've completed all tasks today! 🎉";
        }
        if (completedCount > 0) {
            return `Great progress! ${totalTasks - completedCount} more task${totalTasks - completedCount === 1 ? '' : 's'} to go!`;
        }
        return "Ready to crush today's goals? Let's start! 💪";
    };

    return (
        <div className="bg-gradient-to-br from-white/95 to-blue-50/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/30 p-6 mb-6 relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-blue-400/20 rounded-full blur-xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-cyan-400/15 to-blue-400/15 rounded-full blur-xl"></div>

            <div className="relative">
                {/* Header with day and greeting */}
                <div className="text-center mb-6">
                    <div className="flex items-center justify-center mb-2">
                        <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded-full text-lg font-bold shadow-lg">
                            Day {currentDay}
                        </div>
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 mb-1">
                        {getTimeBasedGreeting()}
                    </h2>
                    <p className="text-sm text-gray-600">
                        {getDailyMotivation()}
                    </p>
                </div>

                {/* Today's Progress Circle */}
                <div className="flex items-center justify-center mb-6">
                    <div className="relative w-32 h-32">
                        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                            {/* Background circle */}
                            <circle
                                cx="60"
                                cy="60"
                                r="50"
                                stroke="rgb(229 231 235)"
                                strokeWidth="8"
                                fill="none"
                            />
                            {/* Progress circle */}
                            <circle
                                cx="60"
                                cy="60"
                                r="50"
                                stroke="url(#gradient)"
                                strokeWidth="8"
                                fill="none"
                                strokeLinecap="round"
                                strokeDasharray={`${2 * Math.PI * 50}`}
                                strokeDashoffset={`${2 * Math.PI * 50 * (1 - todayProgressPercentage / 100)}`}
                                className="transition-all duration-700 ease-out"
                            />
                            <defs>
                                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="rgb(168 85 247)" />
                                    <stop offset="50%" stopColor="rgb(59 130 246)" />
                                    <stop offset="100%" stopColor="rgb(6 182 212)" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-gray-800">{completedCount}</div>
                                <div className="text-xs text-gray-500">of {totalTasks}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Today's Stats Cards */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/70 rounded-xl p-4 text-center border border-white/40">
                        <div className="flex items-center justify-center mb-2">
                            <CheckCircle2 className={`w-5 h-5 ${allCompleted ? 'text-green-500' : 'text-gray-400'}`} />
                        </div>
                        <div className="text-lg font-bold text-gray-800">{Math.round(todayProgressPercentage)}%</div>
                        <div className="text-xs text-gray-500">Today's Progress</div>
                    </div>

                    <div className="bg-white/70 rounded-xl p-4 text-center border border-white/40">
                        <div className="flex items-center justify-center mb-2">
                            <Target className="w-5 h-5 text-blue-500" />
                        </div>
                        <div className="text-lg font-bold text-gray-800">{totalTasks - completedCount}</div>
                        <div className="text-xs text-gray-500">Tasks Remaining</div>
                    </div>
                </div>

                {/* Completion Status */}
                <div className={`mt-4 p-4 rounded-xl text-center transition-all duration-300 ${allCompleted
                        ? 'bg-green-100 border border-green-200'
                        : 'bg-blue-50 border border-blue-200'
                    }`}>
                    <div className="text-2xl mb-2">
                        {allCompleted ? '🎉' : '⏳'}
                    </div>
                    <div className={`font-medium ${allCompleted ? 'text-green-800' : 'text-blue-800'}`}>
                        {allCompleted
                            ? 'Perfect Day Complete!'
                            : 'Keep Going!'
                        }
                    </div>
                    <div className={`text-sm mt-1 ${allCompleted ? 'text-green-600' : 'text-blue-600'}`}>
                        {allCompleted
                            ? 'All tasks completed for today'
                            : `${totalTasks - completedCount} task${totalTasks - completedCount === 1 ? '' : 's'} left to make this a perfect day`
                        }
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProgressOverview; 