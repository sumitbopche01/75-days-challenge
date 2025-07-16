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
            return 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-2 border-blue-400 shadow-xl shadow-blue-500/25 scale-105 ring-4 ring-blue-300/50';
        }

        if (isCurrent) {
            return 'bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 text-white border-2 border-amber-300 shadow-xl shadow-orange-500/30 hover:shadow-2xl hover:shadow-orange-500/40 animate-pulse hover:animate-none';
        }

        if (isFuture) {
            return 'bg-gradient-to-br from-slate-700/50 to-slate-800/50 text-slate-300 border-2 border-slate-600/30 cursor-not-allowed backdrop-blur-sm';
        }

        if (isPast) {
            if (allTasksCompleted) {
                return 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-2 border-emerald-400 shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/35 hover:scale-105';
            } else {
                return 'bg-gradient-to-br from-rose-500 to-pink-600 text-white border-2 border-rose-400 shadow-lg shadow-rose-500/25 hover:shadow-xl hover:shadow-rose-500/35 hover:scale-105';
            }
        }

        return 'bg-gradient-to-br from-slate-600/20 to-slate-700/20 text-white border-2 border-slate-500/30 hover:bg-slate-600/30 hover:border-slate-400/50 backdrop-blur-sm';
    };

    // Get the appropriate icon
    const getIcon = () => {
        if (isFuture) {
            return <Clock className="w-5 h-5 drop-shadow-sm" />;
        }

        if (isCurrent) {
            return <Calendar className="w-5 h-5 drop-shadow-sm" />;
        }

        if (isPast) {
            if (allTasksCompleted) {
                return <CheckCircle className="w-5 h-5 drop-shadow-sm" />;
            } else {
                return <XCircle className="w-5 h-5 drop-shadow-sm" />;
            }
        }

        return <Circle className="w-5 h-5 drop-shadow-sm" />;
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
                relative p-5 rounded-2xl transition-all duration-300 cursor-pointer
                hover:scale-[1.02] active:scale-95 min-h-[140px] aspect-square flex flex-col justify-between
                ${getCardStyle()}
                ${isFuture ? 'pointer-events-none' : ''}
                group
            `}
            onClick={handleClick}
            role={isFuture ? undefined : "button"}
            tabIndex={isFuture ? -1 : 0}
            aria-label={`Day ${dayNumber}, ${formatDate(date)}${isFuture ? ' (coming soon)' :
                isCurrent ? ' (current day)' :
                    isPast ? (allTasksCompleted ? ' (completed)' : ' (incomplete)') : ''}`}
            onKeyDown={(e) => {
                if ((e.key === 'Enter' || e.key === ' ') && !isFuture) {
                    e.preventDefault();
                    handleClick();
                }
            }}
        >
            {/* Top Section - Day Number and Icon */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    {getIcon()}
                    <span className="font-bold text-xl tracking-tight drop-shadow-sm">
                        {dayNumber}
                    </span>
                </div>

                {/* Status indicator dot */}
                <div className={`w-3 h-3 rounded-full ${isCurrent ? 'bg-white/90 animate-pulse' :
                        allTasksCompleted && isPast ? 'bg-white/90' :
                            isPast && !allTasksCompleted ? 'bg-white/60' :
                                'bg-white/30'
                    } drop-shadow-sm`} />
            </div>

            {/* Middle Section - Progress for Past/Current Days */}
            {!isFuture && totalTasksCount > 0 && (
                <div className="flex-1 flex flex-col justify-center space-y-4">
                    {/* Progress Bar */}
                    <div className="w-full bg-black/20 rounded-full h-2 overflow-hidden shadow-inner">
                        <div
                            className="bg-white/90 rounded-full h-2 transition-all duration-500 ease-out shadow-sm"
                            style={{ width: `${completionPercentage}%` }}
                        />
                    </div>

                    {/* Task Count */}
                    <div className="text-center">
                        <div className="text-sm font-semibold drop-shadow-sm">
                            {completedTasksCount}/{totalTasksCount}
                        </div>
                        <div className="text-xs opacity-80 font-medium">
                            {completionPercentage}%
                        </div>
                    </div>
                </div>
            )}

            {/* Bottom Section - Date */}
            <div className={`text-center mt-auto ${isFuture ? 'text-slate-400' : 'text-white/90'
                }`}>
                <div className="text-xs font-medium drop-shadow-sm">
                    {formatDate(date)}
                </div>
            </div>

            {/* Status Badge - Top Right */}
            {isCurrent && (
                <div className="absolute -top-2 -right-2 bg-white text-orange-600 rounded-full w-7 h-7 flex items-center justify-center text-xs font-black shadow-lg ring-2 ring-orange-200 animate-bounce">
                    !
                </div>
            )}

            {/* Completion Badge for Perfect Days */}
            {isPast && allTasksCompleted && (
                <div className="absolute -top-2 -right-2 bg-gradient-to-br from-yellow-400 to-amber-500 text-emerald-800 rounded-full w-7 h-7 flex items-center justify-center shadow-lg ring-2 ring-yellow-200">
                    <CheckCircle className="w-4 h-4" />
                </div>
            )}

            {/* Miss Badge for Incomplete Past Days */}
            {isPast && !allTasksCompleted && (
                <div className="absolute -top-2 -right-2 bg-white text-rose-600 rounded-full w-7 h-7 flex items-center justify-center shadow-lg ring-2 ring-rose-200">
                    <XCircle className="w-4 h-4" />
                </div>
            )}

            {/* Future Day Overlay */}
            {isFuture && (
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900/40 to-slate-800/60 rounded-2xl flex items-center justify-center backdrop-blur-[2px]">
                    <div className="text-center space-y-2">
                        <Clock className="w-6 h-6 mx-auto text-slate-300 opacity-60" />
                        <div className="text-xs text-slate-300 font-medium">
                            Coming Soon
                        </div>
                    </div>
                </div>
            )}

            {/* Hover glow effect */}
            {!isFuture && (
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-white/10 to-white/5 pointer-events-none" />
            )}
        </div>
    );
};

export default DayCard; 