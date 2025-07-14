// src/components/Calendar.tsx
// Main calendar component for the 75 Hard Challenge

import React, { useState, useEffect } from 'react';
import {
    Calendar as CalendarIcon,
    TrendingUp,
    Award,
    Target,
    ChevronLeft,
    ChevronRight,
    Filter,
    BarChart3,
    CheckCircle2,
    XCircle,
    Clock
} from 'lucide-react';
import DayCard, { DayData } from './DayCard';
import DayDetailModal from './DayDetailModal';
import { supabaseStorage } from '@/lib/supabase-storage';
import { DatabaseCustomTask } from '@/types/database';
import { LoadingNotification } from './ErrorNotification';

interface CalendarProps {
    challengeStartDate: string;
    currentDay: number;
    customTasks: DatabaseCustomTask[];
}

interface CalendarStats {
    totalDays: number;
    completedDays: number;
    currentDay: number;
    streakDays: number;
    completionRate: number;
    daysRemaining: number;
}

const Calendar: React.FC<CalendarProps> = ({
    challengeStartDate,
    currentDay,
    customTasks
}) => {
    const [calendarData, setCalendarData] = useState<DayData[]>([]);
    const [selectedDay, setSelectedDay] = useState<DayData | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [filter, setFilter] = useState<'all' | 'completed' | 'incomplete' | 'current'>('all');
    const [stats, setStats] = useState<CalendarStats>({
        totalDays: 75,
        completedDays: 0,
        currentDay: 1,
        streakDays: 0,
        completionRate: 0,
        daysRemaining: 75
    });

    const daysPerPage = 15; // Show 15 days per page (3 rows x 5 columns)
    const totalPages = Math.ceil(75 / daysPerPage);

    // Generate calendar data for all 75 days
    const generateCalendarData = async (): Promise<DayData[]> => {
        const days: DayData[] = [];
        const startDate = new Date(challengeStartDate);
        const today = new Date();

        for (let i = 1; i <= 75; i++) {
            const dayDate = new Date(startDate);
            dayDate.setDate(startDate.getDate() + (i - 1));

            const isCurrentDay = i === currentDay;
            const isPast = i < currentDay;
            const isFuture = i > currentDay;

            // Fetch completion data for this day
            let completedTasksCount = 0;
            let allTasksCompleted = false;

            if (!isFuture) {
                try {
                    const completionsResult = await supabaseStorage.getTaskCompletions(
                        dayDate.toISOString().split('T')[0]
                    );

                    if (completionsResult.success && completionsResult.data) {
                        const completions = Object.values(completionsResult.data);
                        completedTasksCount = completions.filter(c => c.completed).length;
                        allTasksCompleted = completions.length === customTasks.length &&
                            completions.every(c => c.completed);
                    }
                } catch (error) {
                    console.warn(`Failed to load completion data for day ${i}:`, error);
                }
            }

            days.push({
                dayNumber: i,
                date: dayDate.toISOString().split('T')[0],
                isCompleted: allTasksCompleted,
                isCurrent: isCurrentDay,
                isFuture,
                isPast,
                completedTasksCount,
                totalTasksCount: customTasks.length,
                allTasksCompleted
            });
        }

        return days;
    };

    // Calculate statistics from calendar data
    const calculateStats = (days: DayData[]): CalendarStats => {
        const completedDays = days.filter(day => day.isPast && day.allTasksCompleted).length;
        const totalPastDays = days.filter(day => day.isPast).length;
        const completionRate = totalPastDays > 0 ? (completedDays / totalPastDays) * 100 : 0;

        // Calculate current streak
        let streakDays = 0;
        for (let i = currentDay - 2; i >= 0; i--) {
            if (days[i] && days[i].allTasksCompleted) {
                streakDays++;
            } else {
                break;
            }
        }

        return {
            totalDays: 75,
            completedDays,
            currentDay,
            streakDays,
            completionRate: Math.round(completionRate),
            daysRemaining: 75 - currentDay + 1
        };
    };

    // Load calendar data
    useEffect(() => {
        const loadCalendarData = async () => {
            setLoading(true);
            try {
                const days = await generateCalendarData();
                setCalendarData(days);
                setStats(calculateStats(days));
            } catch (error) {
                console.error('Failed to load calendar data:', error);
            }
            setLoading(false);
        };

        if (challengeStartDate && customTasks.length > 0) {
            loadCalendarData();
        }
    }, [challengeStartDate, currentDay, customTasks]);

    // Filter days based on selected filter
    const getFilteredDays = () => {
        const startIndex = currentPage * daysPerPage;
        const endIndex = startIndex + daysPerPage;

        let filteredDays = calendarData;

        switch (filter) {
            case 'completed':
                filteredDays = calendarData.filter(day => day.isPast && day.allTasksCompleted);
                break;
            case 'incomplete':
                filteredDays = calendarData.filter(day => day.isPast && !day.allTasksCompleted);
                break;
            case 'current':
                filteredDays = calendarData.filter(day => day.isCurrent);
                break;
            default:
                filteredDays = calendarData;
        }

        return filteredDays.slice(startIndex, endIndex);
    };

    // Handle day selection
    const handleDayClick = (dayData: DayData) => {
        setSelectedDay(dayData);
        setShowDetailModal(true);
    };

    // Close detail modal
    const handleCloseDetailModal = () => {
        setShowDetailModal(false);
        setSelectedDay(null);
    };

    // Navigate pages
    const goToNextPage = () => {
        if (currentPage < totalPages - 1) {
            setCurrentPage(currentPage + 1);
        }
    };

    const goToPreviousPage = () => {
        if (currentPage > 0) {
            setCurrentPage(currentPage - 1);
        }
    };

    // Jump to current day
    const jumpToCurrentDay = () => {
        const currentPageIndex = Math.floor((currentDay - 1) / daysPerPage);
        setCurrentPage(currentPageIndex);
        setFilter('all');
    };

    if (loading) {
        return (
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <LoadingNotification message="Loading calendar..." isVisible={true} />
            </div>
        );
    }

    const filteredDays = getFilteredDays();

    return (
        <div className="space-y-6">
            {/* Calendar Header */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                        <CalendarIcon className="w-8 h-8 text-white" />
                        <div>
                            <h2 className="text-2xl font-bold text-white">75 Day Calendar</h2>
                            <p className="text-white/70">Track your journey to mental toughness</p>
                        </div>
                    </div>

                    <button
                        onClick={jumpToCurrentDay}
                        className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-medium"
                    >
                        Jump to Today
                    </button>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white/10 rounded-lg p-4 text-center">
                        <div className="flex items-center justify-center mb-2">
                            <Target className="w-5 h-5 text-blue-400 mr-2" />
                            <span className="text-white/70 text-sm">Current Day</span>
                        </div>
                        <div className="text-2xl font-bold text-white">{stats.currentDay}</div>
                    </div>

                    <div className="bg-white/10 rounded-lg p-4 text-center">
                        <div className="flex items-center justify-center mb-2">
                            <CheckCircle2 className="w-5 h-5 text-green-400 mr-2" />
                            <span className="text-white/70 text-sm">Completed</span>
                        </div>
                        <div className="text-2xl font-bold text-white">{stats.completedDays}</div>
                    </div>

                    <div className="bg-white/10 rounded-lg p-4 text-center">
                        <div className="flex items-center justify-center mb-2">
                            <TrendingUp className="w-5 h-5 text-purple-400 mr-2" />
                            <span className="text-white/70 text-sm">Success Rate</span>
                        </div>
                        <div className="text-2xl font-bold text-white">{stats.completionRate}%</div>
                    </div>

                    <div className="bg-white/10 rounded-lg p-4 text-center">
                        <div className="flex items-center justify-center mb-2">
                            <Award className="w-5 h-5 text-yellow-400 mr-2" />
                            <span className="text-white/70 text-sm">Streak</span>
                        </div>
                        <div className="text-2xl font-bold text-white">{stats.streakDays}</div>
                    </div>
                </div>

                {/* Filter and Navigation */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Filter className="w-4 h-4 text-white/70" />
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value as any)}
                            className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Days</option>
                            <option value="completed">Completed</option>
                            <option value="incomplete">Incomplete</option>
                            <option value="current">Current</option>
                        </select>
                    </div>

                    <div className="flex items-center space-x-2">
                        <button
                            onClick={goToPreviousPage}
                            disabled={currentPage === 0}
                            className="p-2 bg-white/10 rounded-lg hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4 text-white" />
                        </button>

                        <span className="text-white text-sm">
                            Page {currentPage + 1} of {totalPages}
                        </span>

                        <button
                            onClick={goToNextPage}
                            disabled={currentPage === totalPages - 1}
                            className="p-2 bg-white/10 rounded-lg hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight className="w-4 h-4 text-white" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="grid grid-cols-3 md:grid-cols-5 gap-4 mb-6">
                    {filteredDays.map((dayData) => (
                        <DayCard
                            key={dayData.dayNumber}
                            dayData={dayData}
                            onClick={handleDayClick}
                            isSelected={false}
                        />
                    ))}
                </div>

                {/* Legend */}
                <div className="border-t border-white/20 pt-4">
                    <h4 className="text-white font-semibold mb-3 text-sm">Legend</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                        <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded border-2 border-yellow-300"></div>
                            <span className="text-white/70">Current Day</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded border-2 border-green-400"></div>
                            <span className="text-white/70">Completed</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 bg-gradient-to-br from-red-500 to-red-600 rounded border-2 border-red-400"></div>
                            <span className="text-white/70">Missed</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 bg-white/5 rounded border-2 border-white/20"></div>
                            <span className="text-white/70">Future</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Day Detail Modal */}
            <DayDetailModal
                dayData={showDetailModal ? selectedDay : null}
                customTasks={customTasks}
                onClose={handleCloseDetailModal}
            />
        </div>
    );
};

export default Calendar; 