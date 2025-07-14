// src/components/DayDetailModal.tsx
// Modal component for showing detailed information about a specific day

import React, { useState, useEffect } from 'react';
import {
    X,
    CheckCircle2,
    XCircle,
    Clock,
    Calendar as CalendarIcon,
    Target,
    TrendingUp,
    Award
} from 'lucide-react';
import { DayData } from './DayCard';
import { supabaseStorage, TaskCompletion } from '@/lib/supabase-storage';
import { DatabaseCustomTask } from '@/types/database';

interface DayDetailModalProps {
    dayData: DayData | null;
    customTasks: DatabaseCustomTask[];
    onClose: () => void;
}

interface TaskCompletionDetail {
    task: DatabaseCustomTask;
    isCompleted: boolean;
    completedAt?: string;
}

const DayDetailModal: React.FC<DayDetailModalProps> = ({
    dayData,
    customTasks,
    onClose
}) => {
    const [taskDetails, setTaskDetails] = useState<TaskCompletionDetail[]>([]);
    const [loading, setLoading] = useState(false);

    // Load detailed task completion data for the selected day
    useEffect(() => {
        const loadTaskDetails = async () => {
            if (!dayData || dayData.isFuture) return;

            setLoading(true);
            try {
                const completionsResult = await supabaseStorage.getTaskCompletions(dayData.date);

                if (completionsResult.success && completionsResult.data) {
                    const completions = completionsResult.data;

                    const details = customTasks.map(task => {
                        const completion = completions[task.id];
                        return {
                            task,
                            isCompleted: completion?.completed || false,
                            completedAt: completion?.completedAt
                        };
                    });

                    setTaskDetails(details);
                } else {
                    // No completions found, mark all as incomplete
                    const details = customTasks.map(task => ({
                        task,
                        isCompleted: false
                    }));
                    setTaskDetails(details);
                }
            } catch (error) {
                console.error('Failed to load task details:', error);
            }
            setLoading(false);
        };

        if (dayData) {
            loadTaskDetails();
        }
    }, [dayData, customTasks]);

    // Don't render if no day is selected
    if (!dayData) return null;

    // Format completion time
    const formatCompletionTime = (timestamp?: string) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Format date for display
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Get status color and text
    const getStatusInfo = () => {
        if (dayData.isCurrent) {
            return {
                color: 'text-yellow-400',
                bgColor: 'bg-yellow-400/20',
                text: 'Current Day',
                icon: <Clock className="w-5 h-5" />
            };
        } else if (dayData.allTasksCompleted) {
            return {
                color: 'text-green-400',
                bgColor: 'bg-green-400/20',
                text: 'Perfect Day',
                icon: <Award className="w-5 h-5" />
            };
        } else if (dayData.isPast) {
            return {
                color: 'text-red-400',
                bgColor: 'bg-red-400/20',
                text: 'Incomplete',
                icon: <XCircle className="w-5 h-5" />
            };
        } else {
            return {
                color: 'text-white/50',
                bgColor: 'bg-white/10',
                text: 'Future',
                icon: <CalendarIcon className="w-5 h-5" />
            };
        }
    };

    const statusInfo = getStatusInfo();
    const completionPercentage = dayData.totalTasksCount > 0
        ? Math.round((dayData.completedTasksCount / dayData.totalTasksCount) * 100)
        : 0;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gradient-to-br from-purple-900/95 via-blue-900/95 to-indigo-900/95 backdrop-blur-sm rounded-2xl border border-white/20 max-w-2xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/20">
                    <div className="flex items-center space-x-3">
                        <div className={`p-3 rounded-lg ${statusInfo.bgColor}`}>
                            {statusInfo.icon}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">
                                Day {dayData.dayNumber}
                            </h2>
                            <p className="text-white/70">
                                {formatDate(dayData.date)}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X className="w-6 h-6 text-white" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 max-h-[calc(90vh-8rem)] overflow-y-auto">
                    {/* Status and Progress */}
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <div className="bg-white/10 rounded-lg p-4">
                            <h3 className="text-white font-semibold mb-3 flex items-center">
                                <Target className="w-5 h-5 mr-2" />
                                Status
                            </h3>
                            <div className="space-y-2">
                                <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full ${statusInfo.bgColor}`}>
                                    {statusInfo.icon}
                                    <span className={`font-medium ${statusInfo.color}`}>
                                        {statusInfo.text}
                                    </span>
                                </div>
                                <div className="text-white/70 text-sm">
                                    {dayData.isFuture ? 'This day is yet to come' :
                                        dayData.isCurrent ? 'Today is your focus' :
                                            dayData.allTasksCompleted ? 'All tasks completed successfully' :
                                                'Some tasks were missed'}
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/10 rounded-lg p-4">
                            <h3 className="text-white font-semibold mb-3 flex items-center">
                                <TrendingUp className="w-5 h-5 mr-2" />
                                Progress
                            </h3>
                            <div className="space-y-3">
                                <div className="w-full bg-white/20 rounded-full h-3">
                                    <div
                                        className={`h-3 rounded-full transition-all duration-300 ${dayData.allTasksCompleted ? 'bg-green-500' :
                                                dayData.completedTasksCount > 0 ? 'bg-yellow-500' : 'bg-red-500'
                                            }`}
                                        style={{ width: `${completionPercentage}%` }}
                                    />
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-white/70">
                                        {dayData.completedTasksCount} of {dayData.totalTasksCount} tasks
                                    </span>
                                    <span className="text-white font-medium">
                                        {completionPercentage}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Task Details */}
                    {!dayData.isFuture && (
                        <div className="bg-white/10 rounded-lg p-4">
                            <h3 className="text-white font-semibold mb-4 flex items-center">
                                <CheckCircle2 className="w-5 h-5 mr-2" />
                                Task Details
                            </h3>

                            {loading ? (
                                <div className="text-center py-8">
                                    <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-2"></div>
                                    <p className="text-white/70">Loading task details...</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {taskDetails.map((detail, index) => (
                                        <div
                                            key={detail.task.id}
                                            className={`flex items-center justify-between p-3 rounded-lg transition-colors ${detail.isCompleted
                                                    ? 'bg-green-500/20 border border-green-500/30'
                                                    : 'bg-red-500/20 border border-red-500/30'
                                                }`}
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div className={`p-1 rounded-full ${detail.isCompleted ? 'bg-green-500' : 'bg-red-500'
                                                    }`}>
                                                    {detail.isCompleted ? (
                                                        <CheckCircle2 className="w-4 h-4 text-white" />
                                                    ) : (
                                                        <XCircle className="w-4 h-4 text-white" />
                                                    )}
                                                </div>
                                                <span className="text-white">
                                                    {detail.task.task_text}
                                                </span>
                                            </div>

                                            {detail.isCompleted && detail.completedAt && (
                                                <span className="text-white/70 text-sm">
                                                    {formatCompletionTime(detail.completedAt)}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Future Day Message */}
                    {dayData.isFuture && (
                        <div className="bg-white/10 rounded-lg p-6 text-center">
                            <CalendarIcon className="w-12 h-12 text-white/50 mx-auto mb-3" />
                            <h3 className="text-white font-semibold mb-2">Future Day</h3>
                            <p className="text-white/70">
                                This day is part of your upcoming challenge. Keep working towards it!
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end p-6 border-t border-white/20">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DayDetailModal; 