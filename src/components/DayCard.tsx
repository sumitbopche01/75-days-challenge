// src/components/DayCard.tsx
// Individual day card component for the 75-day calendar

import React from 'react';
import { CheckCircle, Circle, XCircle, Clock, Calendar } from 'lucide-react';

export interface DayData {
    dayNumber: number;
    date: string;
    isCompleted: boolean;
    isCurrent: boolean;
    isFuture: boolean;
    isPast: boolean;
    completedTasksCount: number;
    totalTasksCount: number;
    allTasksCompleted: boolean;
}

interface DayCardProps {
    dayData: DayData;
    onClick: (dayData: DayData) => void;
    isSelected?: boolean;
}

const DayCard: React.FC<DayCardProps> = ({ dayData, onClick, isSelected = false }) => {
    const {
        dayNumber,
        date,
        isCompleted,
        isCurrent,
        isFuture,
        isPast,
        completedTasksCount,
        totalTasksCount,
        allTasksCompleted
    } = dayData;

    // Determine the card style based on day status
    const getCardStyle = () => {
        if (isSelected) {
            return 'bg-blue-600 text-white border-blue-500 shadow-lg scale-105';
        }

        if (isCurrent) {
            return 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white border-yellow-300 shadow-md animate-pulse';
        }

        if (isFuture) {
            return 'bg-white/5 text-white/50 border-white/20 cursor-not-allowed';
        }

        if (isPast) {
            if (allTasksCompleted) {
                return 'bg-gradient-to-br from-green-500 to-emerald-600 text-white border-green-400 shadow-sm hover:shadow-md';
            } else {
                return 'bg-gradient-to-br from-red-500 to-red-600 text-white border-red-400 shadow-sm hover:shadow-md';
            }
        }

        return 'bg-white/10 text-white border-white/30 hover:bg-white/20';
    };

    // Get the appropriate icon
    const getIcon = () => {
        if (isFuture) {
            return <Clock className="w-4 h-4" />;
        }

        if (isCurrent) {
            return <Calendar className="w-4 h-4" />;
        }

        if (isPast) {
            if (allTasksCompleted) {
                return <CheckCircle className="w-4 h-4" />;
            } else {
                return <XCircle className="w-4 h-4" />;
            }
        }

        return <Circle className="w-4 h-4" />;
    };

    // Format date for display
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    };

    // Calculate completion percentage
    const completionPercentage = totalTasksCount > 0
        ? Math.round((completedTasksCount / totalTasksCount) * 100)
        : 0;

    const handleClick = () => {
        if (!isFuture) {
            onClick(dayData);
        }
    };

    return (
        <div
            className={`
                relative p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer
                hover:scale-105 active:scale-95 min-h-[80px] flex flex-col items-center justify-center
                ${getCardStyle()}
                ${isFuture ? 'pointer-events-none' : ''}
            `}
            onClick={handleClick}
        >
            {/* Day Number */}
            <div className="flex items-center space-x-2 mb-1">
                {getIcon()}
                <span className="font-bold text-lg">
                    {dayNumber}
                </span>
            </div>

            {/* Date */}
            <div className={`text-xs ${isFuture ? 'text-white/30' : 'text-current opacity-80'}`}>
                {formatDate(date)}
            </div>

            {/* Progress Information for Past/Current Days */}
            {!isFuture && totalTasksCount > 0 && (
                <div className="mt-2 w-full">
                    {/* Progress Bar */}
                    <div className="w-full bg-black/20 rounded-full h-1.5 mb-1">
                        <div
                            className="bg-white rounded-full h-1.5 transition-all duration-300"
                            style={{ width: `${completionPercentage}%` }}
                        />
                    </div>

                    {/* Task Count */}
                    <div className="text-xs text-center opacity-90">
                        {completedTasksCount}/{totalTasksCount}
                    </div>
                </div>
            )}

            {/* Status Badge */}
            {isCurrent && (
                <div className="absolute -top-2 -right-2 bg-white text-orange-500 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg">
                    !
                </div>
            )}

            {/* Completion Badge for Perfect Days */}
            {isPast && allTasksCompleted && (
                <div className="absolute -top-2 -right-2 bg-yellow-400 text-green-800 rounded-full w-6 h-6 flex items-center justify-center shadow-lg">
                    <CheckCircle className="w-3 h-3" />
                </div>
            )}

            {/* Miss Badge for Incomplete Past Days */}
            {isPast && !allTasksCompleted && (
                <div className="absolute -top-2 -right-2 bg-white text-red-600 rounded-full w-6 h-6 flex items-center justify-center shadow-lg">
                    <XCircle className="w-3 h-3" />
                </div>
            )}

            {/* Future Day Overlay */}
            {isFuture && (
                <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center">
                    <div className="text-xs text-white/50 text-center">
                        Coming<br />Soon
                    </div>
                </div>
            )}
        </div>
    );
};

export default DayCard; 