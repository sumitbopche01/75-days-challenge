// src/components/SkeletonLoaders.tsx
// Reusable skeleton loader components for better loading UX

import React from 'react';

interface SkeletonProps {
    className?: string;
    style?: React.CSSProperties;
}

// Basic skeleton component
export const Skeleton: React.FC<SkeletonProps> = ({ className = '', style }) => (
    <div className={`animate-pulse bg-gradient-to-r from-white/10 via-white/15 to-white/10 rounded-lg ${className}`} style={style}></div>
);

// Stat card skeleton
export const StatCardSkeleton: React.FC = () => (
    <div className="bg-gradient-to-br from-white/15 via-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <div className="flex items-center justify-between mb-4">
            <Skeleton className="w-12 h-12 rounded-xl" />
            <Skeleton className="w-16 h-5" />
        </div>
        <Skeleton className="w-20 h-9 mb-2" />
        <Skeleton className="w-28 h-4 mb-1" />
        <Skeleton className="w-24 h-3" />
    </div>
);

// Day card skeleton for calendar
export const DayCardSkeleton: React.FC = () => (
    <div className="bg-gradient-to-br from-slate-700/30 to-slate-800/30 backdrop-blur-sm rounded-2xl p-5 border-2 border-slate-600/20 aspect-square min-h-[140px]">
        <div className="h-full flex flex-col justify-between">
            <div className="flex justify-between items-start">
                <div className="flex items-center space-x-2">
                    <Skeleton className="w-5 h-5 rounded-full" />
                    <Skeleton className="w-8 h-6" />
                </div>
                <Skeleton className="w-3 h-3 rounded-full" />
            </div>
            <div className="flex-1 flex flex-col justify-center space-y-4">
                <Skeleton className="w-full h-2 rounded-full" />
                <div className="text-center space-y-1">
                    <Skeleton className="w-10 h-4 mx-auto" />
                    <Skeleton className="w-8 h-3 mx-auto" />
                </div>
            </div>
            <Skeleton className="w-16 h-3 mx-auto" />
        </div>
    </div>
);

// Chart skeleton
export const ChartSkeleton: React.FC<{ title: string }> = ({ title }) => (
    <div className="bg-gradient-to-br from-white/15 via-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <div className="flex items-center mb-6">
            <Skeleton className="w-6 h-6 rounded-lg mr-3" />
            <span className="text-white font-bold text-lg">{title}</span>
        </div>
        <div className="h-40 flex items-end space-x-2 mb-4">
            {Array.from({ length: 14 }, (_, i) => (
                <div key={i} className="flex-1 flex flex-col items-center">
                    <Skeleton
                        className="w-full rounded-t-lg"
                        style={{ height: `${Math.random() * 80 + 20}%` }}
                    />
                    <Skeleton className="w-6 h-3 mt-2" />
                </div>
            ))}
        </div>
        <div className="flex justify-between bg-white/5 px-4 py-2 rounded-lg border border-white/10">
            <Skeleton className="w-20 h-4" />
            <Skeleton className="w-16 h-4" />
        </div>
    </div>
);

// Task breakdown skeleton
export const TaskBreakdownSkeleton: React.FC = () => (
    <div className="bg-gradient-to-br from-white/15 via-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <div className="flex items-center mb-6">
            <Skeleton className="w-6 h-6 rounded-lg mr-3" />
            <span className="text-white font-bold text-lg">Task Performance</span>
        </div>
        <div className="space-y-5">
            {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3 flex-1">
                            <div className="p-2 bg-white/10 rounded-lg">
                                <Skeleton className="w-5 h-5" />
                            </div>
                            <Skeleton className="w-32 h-4" />
                        </div>
                        <Skeleton className="w-12 h-6 rounded-lg" />
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                        <Skeleton
                            className="h-3 rounded-full"
                            style={{ width: `${Math.random() * 80 + 20}%` }}
                        />
                    </div>
                    <Skeleton className="w-24 h-3 ml-auto mt-2" />
                </div>
            ))}
        </div>
    </div>
);

// Calendar stats skeleton
export const CalendarStatsSkeleton: React.FC = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/10">
                <div className="flex items-center justify-center mb-3">
                    <div className="p-2 bg-white/20 rounded-xl mr-3">
                        <Skeleton className="w-5 h-5" />
                    </div>
                    <Skeleton className="w-20 h-4" />
                </div>
                <Skeleton className="w-16 h-9 mx-auto mb-1" />
                <Skeleton className="w-12 h-3 mx-auto" />
            </div>
        ))}
    </div>
);

// Calendar grid skeleton
export const CalendarGridSkeleton: React.FC = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 md:gap-10 mb-8">
        {Array.from({ length: 10 }, (_, i) => (
            <DayCardSkeleton key={i} />
        ))}
    </div>
); 