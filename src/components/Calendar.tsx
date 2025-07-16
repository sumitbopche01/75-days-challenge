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
import { CalendarStatsSkeleton, CalendarGridSkeleton } from './SkeletonLoaders';

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

interface LoadingState {
    stats: boolean;
    calendarData: boolean;
    initialLoad: boolean;
}

const Calendar: React.FC<CalendarProps> = ({
    challengeStartDate,
    currentDay,
    customTasks
}) => {
    const [calendarData, setCalendarData] = useState<DayData[]>([]);
    const [selectedDay, setSelectedDay] = useState<DayData | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [loading, setLoading] = useState<LoadingState>({
        stats: true,
        calendarData: true,
        initialLoad: true
    });
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

    const daysPerPage = 10; // Show 10 days per page for better spacing (2 cols mobile, 4 cols medium, 5 cols large)
    const totalPages = Math.ceil(75 / daysPerPage);

    // Generate calendar data for all 75 days with progressive loading
    const generateCalendarData = async (): Promise<DayData[]> => {
        const days: DayData[] = [];
        const startDate = new Date(challengeStartDate);
        const today = new Date();

        // First, create basic day structure immediately
        for (let i = 1; i <= 75; i++) {
            const dayDate = new Date(startDate);
            dayDate.setDate(startDate.getDate() + (i - 1));

            const isCurrentDay = i === currentDay;
            const isPast = i < currentDay;
            const isFuture = i > currentDay;

            days.push({
                dayNumber: i,
                date: dayDate.toISOString().split('T')[0],
                isCompleted: false,
                isCurrent: isCurrentDay,
                isFuture,
                isPast,
                completedTasksCount: 0,
                totalTasksCount: customTasks.length,
                allTasksCompleted: false
            });
        }

        // Update calendar data immediately with basic structure
        setCalendarData([...days]);
        setLoading(prev => ({ ...prev, calendarData: false }));

        // Then load completion data progressively
        const batchSize = 7; // Load 7 days at a time
        const batches = Math.ceil(currentDay / batchSize);

        for (let batch = 0; batch < batches; batch++) {
            const startIdx = batch * batchSize;
            const endIdx = Math.min(startIdx + batchSize, currentDay);

            // Load completion data for this batch
            const updatedDays = [...days];

            for (let i = startIdx; i < endIdx; i++) {
                if (days[i] && !days[i].isFuture) {
                    try {
                        const dayDate = new Date(startDate);
                        dayDate.setDate(startDate.getDate() + i);

                        const completionsResult = await supabaseStorage.getTaskCompletions(
                            dayDate.toISOString().split('T')[0]
                        );

                        if (completionsResult.success && completionsResult.data) {
                            const completions = Object.values(completionsResult.data);
                            const completedTasksCount = completions.filter(c => c.completed).length;
                            const allTasksCompleted = completions.length === customTasks.length &&
                                completions.every(c => c.completed);

                            updatedDays[i] = {
                                ...updatedDays[i],
                                completedTasksCount,
                                allTasksCompleted,
                                isCompleted: allTasksCompleted
                            };
                        }
                    } catch (error) {
                        console.warn(`Failed to load completion data for day ${i + 1}:`, error);
                    }
                }
            }

            // Update state after each batch
            setCalendarData([...updatedDays]);

            // Calculate and update stats after each batch
            const newStats = calculateStats(updatedDays);
            setStats(newStats);

            // Small delay to prevent overwhelming the UI
            if (batch < batches - 1) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }

        setLoading(prev => ({ ...prev, stats: false }));
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

    // Load calendar data with progressive loading
    useEffect(() => {
        const loadCalendarData = async () => {
            setLoading({
                stats: true,
                calendarData: true,
                initialLoad: true
            });

            // Set initial stats immediately
            setStats({
                totalDays: 75,
                completedDays: 0,
                currentDay,
                streakDays: 0,
                completionRate: 0,
                daysRemaining: 75 - currentDay + 1
            });

            try {
                await generateCalendarData();
            } catch (error) {
                console.error('Failed to load calendar data:', error);
            }

            setLoading(prev => ({ ...prev, initialLoad: false }));
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

    const filteredDays = getFilteredDays();

    return (
        <div className="space-y-8">
            {/* Calendar Header */}
            <div className="bg-gradient-to-br from-white/15 via-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl shadow-purple-500/10">
                {/* Statistics with skeleton loading */}
                {loading.stats ? (
                    <CalendarStatsSkeleton />
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/10 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
                            <div className="flex items-center justify-center mb-3">
                                <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl mr-3">
                                    <Target className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-white/80 text-sm font-medium">Current Day</span>
                            </div>
                            <div className="text-3xl font-bold text-white mb-1">{stats.currentDay}</div>
                            <div className="text-white/60 text-xs">of 75 days</div>
                        </div>

                        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/10 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
                            <div className="flex items-center justify-center mb-3">
                                <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl mr-3">
                                    <CheckCircle2 className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-white/80 text-sm font-medium">Completed</span>
                            </div>
                            <div className="text-3xl font-bold text-white mb-1">{stats.completedDays}</div>
                            <div className="text-white/60 text-xs">perfect days</div>
                        </div>

                        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/10 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
                            <div className="flex items-center justify-center mb-3">
                                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl mr-3">
                                    <TrendingUp className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-white/80 text-sm font-medium">Success Rate</span>
                            </div>
                            <div className="text-3xl font-bold text-white mb-1">{stats.completionRate}%</div>
                            <div className="text-white/60 text-xs">completion</div>
                        </div>

                        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/10 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
                            <div className="flex items-center justify-center mb-3">
                                <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl mr-3">
                                    <Award className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-white/80 text-sm font-medium">Current Streak</span>
                            </div>
                            <div className="text-3xl font-bold text-white mb-1">{stats.streakDays}</div>
                            <div className="text-white/60 text-xs">consecutive</div>
                        </div>
                    </div>
                )}

                {/* Filter and Navigation */}
                <div className="flex items-center justify-between bg-gradient-to-r from-white/10 to-white/5 rounded-2xl p-4 border border-white/10">
                    <div className="flex items-center space-x-3">
                        <Filter className="w-4 h-4 text-white/60" />
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value as any)}
                            className="bg-transparent border-none text-white text-sm focus:outline-none font-medium cursor-pointer appearance-none"
                        >
                            <option value="all" className="bg-gray-800">All Days</option>
                            <option value="completed" className="bg-gray-800">Completed</option>
                            <option value="incomplete" className="bg-gray-800">Incomplete</option>
                            <option value="current" className="bg-gray-800">Current</option>
                        </select>
                    </div>

                    <div className="flex items-center space-x-3">
                        <button
                            onClick={jumpToCurrentDay}
                            className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white/80 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 text-xs font-medium"
                        >
                            Today
                        </button>

                        <button
                            onClick={goToPreviousPage}
                            disabled={currentPage === 0}
                            className="p-2 bg-white/10 rounded-lg hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 active:scale-95 disabled:hover:scale-100"
                        >
                            <ChevronLeft className="w-4 h-4 text-white" />
                        </button>

                        <span className="text-white/80 text-sm font-medium px-3 py-1 bg-white/10 rounded-lg">
                            {currentPage + 1}/{totalPages}
                        </span>

                        <button
                            onClick={goToNextPage}
                            disabled={currentPage === totalPages - 1}
                            className="p-2 bg-white/10 rounded-lg hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 active:scale-95 disabled:hover:scale-100"
                        >
                            <ChevronRight className="w-4 h-4 text-white" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="bg-gradient-to-br from-white/15 via-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-white/20 shadow-2xl shadow-purple-500/10">
                {loading.calendarData ? (
                    <CalendarGridSkeleton />
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 md:gap-10 mb-8">
                        {filteredDays.map((dayData) => (
                            <DayCard
                                key={dayData.dayNumber}
                                dayData={dayData}
                                onClick={handleDayClick}
                                isSelected={false}
                            />
                        ))}
                    </div>
                )}

                {/* Legend */}
                <div className="border-t border-white/20 pt-6">
                    <h4 className="text-white font-semibold mb-4 text-base">Status Legend</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center space-x-3">
                            <div className="w-5 h-5 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg border-2 border-amber-300 shadow-sm"></div>
                            <span className="text-white/80 font-medium">Current Day</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="w-5 h-5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg border-2 border-emerald-400 shadow-sm"></div>
                            <span className="text-white/80 font-medium">Completed</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="w-5 h-5 bg-gradient-to-br from-rose-500 to-pink-600 rounded-lg border-2 border-rose-400 shadow-sm"></div>
                            <span className="text-white/80 font-medium">Missed</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="w-5 h-5 bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-lg border-2 border-slate-600/30 shadow-sm"></div>
                            <span className="text-white/80 font-medium">Future</span>
                        </div>
                    </div>
                </div>

                {/* Loading indicator for progressive loading */}
                {loading.stats && !loading.initialLoad && (
                    <div className="text-center py-4">
                        <div className="inline-flex items-center text-white/70 text-sm bg-white/10 px-4 py-2 rounded-xl border border-white/20">
                            <Clock className="w-4 h-4 mr-2 animate-spin" />
                            Loading completion data...
                        </div>
                    </div>
                )}
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