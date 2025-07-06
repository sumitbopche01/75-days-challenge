// src/components/ProgressOverview.tsx
// ProgressOverview component: Shows current day, motivational message, progress bar, and stats.
import React from 'react';
import { getMotivationalMessage } from '@/lib/utils';
import { DatabaseCustomTask } from '@/types/database';

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
}) => (
    <div className="bg-gradient-to-br from-white/95 to-blue-50/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/30 p-4 mb-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-400/20 to-blue-400/20 rounded-full blur-xl"></div>
        <div className="relative">
            <div className="flex items-center justify-between mb-3">
                <div>
                    <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                        Day {currentDay} of 75
                    </h2>
                    <p className="text-sm text-gray-600">
                        {isActive ? getMotivationalMessage(currentDay, todayProgress?.allCompleted || false) : 'Challenge Complete! 🎉'}
                    </p>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                        {progressPercentage.toFixed(0)}%
                    </div>
                    <div className="text-xs text-gray-500">Complete</div>
                </div>
            </div>
            <div className="mb-3">
                <div className="h-2 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 rounded-full transition-all duration-700 ease-out"
                        style={{ width: `${progressPercentage}%` }}
                    />
                </div>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center">
                <div className="bg-white/60 rounded-lg p-2">
                    <div className="text-sm font-bold text-gray-800">{Math.max(0, currentDay - 1)}</div>
                    <div className="text-xs text-gray-500">Days</div>
                </div>
                <div className="bg-white/60 rounded-lg p-2">
                    <div className="text-sm font-bold text-gray-800">{Math.max(0, 75 - currentDay + 1)}</div>
                    <div className="text-xs text-gray-500">Left</div>
                </div>
                <div className="bg-white/60 rounded-lg p-2">
                    <div className="text-sm font-bold text-gray-800">
                        {Object.values(completedTasks).filter(val => val !== false).length}/{customTasks.length}
                    </div>
                    <div className="text-xs text-gray-500">Tasks</div>
                </div>
                <div className="bg-white/60 rounded-lg p-2">
                    <div className="text-lg">
                        {Object.values(completedTasks).filter(val => val !== false).length === customTasks.length && customTasks.length > 0 ? '🎉' : '⏳'}
                    </div>
                    <div className="text-xs text-gray-500">Status</div>
                </div>
            </div>
        </div>
    </div>
);

export default ProgressOverview; 