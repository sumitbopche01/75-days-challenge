/**
 * Home Page Component
 * Main landing page for the 75 Hard Challenge app
 */

'use client';

import { useState, useEffect } from 'react';
import { ChallengeStorage } from '@/lib/storage';
import { UserProfile, ChallengeSettings, DayProgress, TaskType } from '@/types/challenge';
import { getGreeting, getMotivationalMessage, dateUtils } from '@/lib/utils';
import {
    Trophy,
    Target,
    Calendar,
    Users,
    TrendingUp,
    Play,
    Settings,
    BarChart3,
    X,
    Download,
    Upload,
    Trash2,
    User,
    RotateCcw,
    AlertTriangle
} from 'lucide-react';

export default function HomePage() {
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [challengeSettings, setChallengeSettings] = useState<ChallengeSettings | null>(null);
    const [showSetup, setShowSetup] = useState(false);
    const [userName, setUserName] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [todayProgress, setTodayProgress] = useState<DayProgress | null>(null);
    const [currentView, setCurrentView] = useState<'home' | 'calendar' | 'stats' | 'community'>('home');
    const [showSettings, setShowSettings] = useState(false);
    const [showRestartConfirm, setShowRestartConfirm] = useState(false);
    const [showClearDataConfirm, setShowClearDataConfirm] = useState(false);
    const [editingProfile, setEditingProfile] = useState(false);
    const [editName, setEditName] = useState('');

    useEffect(() => {
        // Load user data on component mount
        const loadUserData = () => {
            const profile = ChallengeStorage.getUserProfile();
            const settings = ChallengeStorage.getChallengeSettings();

            setUserProfile(profile);
            setChallengeSettings(settings);

            // Load today's progress if challenge is active
            if (settings && profile) {
                const today = dateUtils.toISOString(new Date());
                const currentDay = dateUtils.getCurrentDay(settings.startDate);

                let dayProgress = ChallengeStorage.getDailyProgress(today);
                if (!dayProgress && currentDay <= 75) {
                    // Create today's progress if it doesn't exist
                    dayProgress = ChallengeStorage.createDayProgress(today, currentDay);
                }
                setTodayProgress(dayProgress);
            }

            setIsLoading(false);

            // Show setup if no profile exists
            if (!profile) {
                setShowSetup(true);
            }
        };

        loadUserData();
    }, []);

    const handleStartChallenge = () => {
        if (!userName.trim()) return;

        // Create user profile
        const profile = ChallengeStorage.createDefaultProfile(userName.trim());

        // Initialize challenge
        const settings = ChallengeStorage.initializeChallenge();

        // Create today's progress
        const today = dateUtils.toISOString(new Date());
        const dayProgress = ChallengeStorage.createDayProgress(today, 1);

        setUserProfile(profile);
        setChallengeSettings(settings);
        setTodayProgress(dayProgress);
        setShowSetup(false);
    };

    const getCurrentDay = () => {
        if (!challengeSettings) return 1;
        return dateUtils.getCurrentDay(challengeSettings.startDate);
    };

    const getProgressPercentage = () => {
        if (!challengeSettings) return 0;
        const currentDay = getCurrentDay();
        return Math.min((currentDay / 75) * 100, 100);
    };

    const handleTaskToggle = (taskType: TaskType) => {
        if (!todayProgress) return;

        const today = dateUtils.toISOString(new Date());
        const newCompletedState = !todayProgress.tasks[taskType].completed;

        // Update in storage
        ChallengeStorage.updateTaskCompletion(today, taskType, newCompletedState);

        // Update local state
        const updatedProgress = ChallengeStorage.getDailyProgress(today);
        setTodayProgress(updatedProgress);
    };

    const handleNavigation = (view: 'home' | 'calendar' | 'stats' | 'community') => {
        setCurrentView(view);
    };

    const handleShowSettings = () => {
        setShowSettings(true);
        if (userProfile) {
            setEditName(userProfile.name);
        }
    };

    const handleRestartChallenge = () => {
        ChallengeStorage.resetChallenge();

        // Reinitialize with current user
        if (userProfile) {
            const newSettings = ChallengeStorage.initializeChallenge();
            const today = dateUtils.toISOString(new Date());
            const newProgress = ChallengeStorage.createDayProgress(today, 1);

            setChallengeSettings(newSettings);
            setTodayProgress(newProgress);
        }

        setShowRestartConfirm(false);
        setShowSettings(false);
    };

    const handleClearAllData = () => {
        ChallengeStorage.clearAllData();

        // Reset to initial state
        setUserProfile(null);
        setChallengeSettings(null);
        setTodayProgress(null);
        setShowSetup(true);
        setShowClearDataConfirm(false);
        setShowSettings(false);
    };

    const handleSaveProfile = () => {
        if (userProfile && editName.trim()) {
            const updatedProfile = { ...userProfile, name: editName.trim() };
            ChallengeStorage.saveUserProfile(updatedProfile);
            setUserProfile(updatedProfile);
            setEditingProfile(false);
        }
    };

    const handleExportData = () => {
        try {
            const data = ChallengeStorage.exportData();
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `75hard-backup-${dateUtils.toISOString(new Date())}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Export failed:', error);
            alert('Export failed. Please try again.');
        }
    };

    const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const jsonData = e.target?.result as string;
                const success = ChallengeStorage.importData(jsonData);

                if (success) {
                    // Reload all data
                    const profile = ChallengeStorage.getUserProfile();
                    const settings = ChallengeStorage.getChallengeSettings();

                    setUserProfile(profile);
                    setChallengeSettings(settings);

                    if (settings) {
                        const today = dateUtils.toISOString(new Date());
                        const progress = ChallengeStorage.getDailyProgress(today);
                        setTodayProgress(progress);
                    }

                    alert('Data imported successfully!');
                    setShowSettings(false);
                } else {
                    alert('Import failed. Please check the file format.');
                }
            } catch (error) {
                console.error('Import failed:', error);
                alert('Import failed. Please check the file format.');
            }
        };
        reader.readAsText(file);

        // Reset the input
        event.target.value = '';
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-blue-700 font-medium">Loading your challenge...</p>
                </div>
            </div>
        );
    }

    if (showSetup || !userProfile) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full space-y-6">
                    <div className="text-center space-y-4">
                        <div className="mx-auto w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center">
                            <Trophy className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Welcome to 75 Hard
                        </h1>
                        <p className="text-gray-600 text-lg">
                            Transform your life in 75 days through mental toughness and discipline
                        </p>
                    </div>

                    <div className="card">
                        <div className="card-header">
                            <h2 className="card-title text-xl">Get Started</h2>
                            <p className="card-description">
                                Enter your name to begin your 75 Hard journey
                            </p>
                        </div>
                        <div className="card-content space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="name" className="label">
                                    Your Name
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    value={userName}
                                    onChange={(e) => setUserName(e.target.value)}
                                    placeholder="Enter your name"
                                    className="input"
                                    onKeyPress={(e) => e.key === 'Enter' && handleStartChallenge()}
                                />
                            </div>

                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                <h3 className="font-semibold text-amber-800 mb-2">The 5 Rules:</h3>
                                <ul className="text-sm text-amber-700 space-y-1">
                                    <li>• Follow a diet (no cheat meals or alcohol)</li>
                                    <li>• Two 45-minute workouts (one outdoors)</li>
                                    <li>• Drink 1 gallon of water daily</li>
                                    <li>• Read 10 pages of non-fiction</li>
                                    <li>• Take a progress photo</li>
                                </ul>
                                <p className="text-xs text-amber-600 mt-2 font-medium">
                                    Missing any rule = Start over from Day 1
                                </p>
                            </div>

                            <button
                                onClick={handleStartChallenge}
                                disabled={!userName.trim()}
                                className="btn btn-primary btn-lg w-full"
                            >
                                <Play className="w-5 h-5 mr-2" />
                                Start 75 Hard Challenge
                            </button>
                        </div>
                    </div>

                    <div className="text-center">
                        <p className="text-sm text-gray-500">
                            Join thousands who have built mental toughness
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    const currentDay = getCurrentDay();
    const progressPercentage = getProgressPercentage();
    const isActive = challengeSettings?.isActive && currentDay <= 75;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Header */}
            <header className="bg-white shadow-sm border-b safe-top">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="flex justify-between items-center py-3">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                <Trophy className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-gray-900">75 Hard</h1>
                                <p className="text-xs text-gray-600">{getGreeting()}, {userProfile.name}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleShowSettings}
                            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <Settings className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 py-4 pb-20">

                {/* Compact Progress Overview */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Day {currentDay} of 75</h2>
                            <p className="text-sm text-gray-600">
                                {isActive ? getMotivationalMessage(currentDay, todayProgress?.allCompleted || false) : 'Challenge Complete! 🎉'}
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-blue-600">
                                {progressPercentage.toFixed(0)}%
                            </div>
                            <div className="text-xs text-gray-500">Complete</div>
                        </div>
                    </div>

                    <div className="progress mb-3">
                        <div
                            className="progress-bar"
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-center">
                        <div>
                            <div className="text-sm font-semibold text-gray-900">{Math.max(0, currentDay - 1)}</div>
                            <div className="text-xs text-gray-500">Days</div>
                        </div>
                        <div>
                            <div className="text-sm font-semibold text-gray-900">{Math.max(0, 75 - currentDay + 1)}</div>
                            <div className="text-xs text-gray-500">Left</div>
                        </div>
                        <div>
                            <div className="text-sm font-semibold text-gray-900">
                                {todayProgress ? Object.values(todayProgress.tasks).filter(t => t.completed).length : 0}/6
                            </div>
                            <div className="text-xs text-gray-500">Tasks</div>
                        </div>
                        <div>
                            <div className="text-sm font-semibold text-green-600">
                                {todayProgress?.allCompleted ? '🎉' : '⏳'}
                            </div>
                            <div className="text-xs text-gray-500">Status</div>
                        </div>
                    </div>
                </div>

                {/* Today's Tasks - Main Content */}
                {currentView === 'home' && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-gray-900">Today's Challenge</h2>
                            {todayProgress && (
                                <div className="text-sm text-gray-600">
                                    {Object.values(todayProgress.tasks).filter(t => t.completed).length} / 6 complete
                                </div>
                            )}
                        </div>

                        {todayProgress ? (
                            <div className="space-y-2">
                                {[
                                    { key: 'diet' as TaskType, icon: '🥗', name: 'Diet', shortDesc: 'No cheat meals or alcohol' },
                                    { key: 'workout1' as TaskType, icon: '💪', name: 'Workout 1', shortDesc: '45 minutes indoors' },
                                    { key: 'workout2' as TaskType, icon: '🏃', name: 'Outdoor Workout', shortDesc: '45 minutes outside' },
                                    { key: 'water' as TaskType, icon: '💧', name: 'Water', shortDesc: '1 gallon (128 oz)' },
                                    { key: 'reading' as TaskType, icon: '📚', name: 'Reading', shortDesc: '10 pages non-fiction' },
                                    { key: 'photo' as TaskType, icon: '📸', name: 'Progress Photo', shortDesc: 'Daily photo' },
                                ].map((task) => {
                                    const taskData = todayProgress.tasks[task.key];
                                    return (
                                        <div
                                            key={task.key}
                                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${taskData.completed
                                                ? 'bg-green-50 border-green-200 shadow-sm'
                                                : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
                                                }`}
                                            onClick={() => handleTaskToggle(task.key)}
                                        >
                                            <div className="flex items-center space-x-4">
                                                <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${taskData.completed
                                                    ? 'bg-green-500 border-green-500'
                                                    : 'border-gray-300 hover:border-blue-400'
                                                    }`}>
                                                    {taskData.completed && (
                                                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    )}
                                                </div>

                                                <div className="text-2xl">{task.icon}</div>

                                                <div className="flex-1 min-w-0">
                                                    <div className={`font-semibold ${taskData.completed ? 'text-green-700' : 'text-gray-900'}`}>
                                                        {task.name}
                                                    </div>
                                                    <div className={`text-sm ${taskData.completed ? 'text-green-600' : 'text-gray-500'}`}>
                                                        {task.shortDesc}
                                                    </div>
                                                </div>

                                                {taskData.completed && (
                                                    <div className="flex-shrink-0 text-green-600 font-medium text-sm">
                                                        ✓ Done
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-gray-50 rounded-xl">
                                <p className="text-gray-500">No challenge data available</p>
                            </div>
                        )}

                        {todayProgress && todayProgress.allCompleted && (
                            <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200">
                                <div className="text-center">
                                    <div className="text-2xl mb-2">🎉</div>
                                    <div className="font-bold text-green-700">Day {currentDay} Complete!</div>
                                    <div className="text-sm text-green-600 mt-1">Great job! You're building mental toughness.</div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Calendar View */}
                {currentView === 'calendar' && (
                    <div className="space-y-3">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Challenge Calendar</h2>
                        <div className="bg-white rounded-xl border border-gray-200 p-8">
                            <div className="text-center">
                                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="font-semibold text-gray-700 mb-2">Calendar View Coming Soon!</h3>
                                <p className="text-gray-500 text-sm">
                                    This will show all 75 days with completion status, streaks, and detailed progress tracking.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Statistics View */}
                {currentView === 'stats' && (
                    <div className="space-y-3">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Progress Statistics</h2>
                        <div className="bg-white rounded-xl border border-gray-200 p-8">
                            <div className="text-center">
                                <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="font-semibold text-gray-700 mb-2">Stats Dashboard Coming Soon!</h3>
                                <p className="text-gray-500 text-sm">
                                    Track completion rates, streaks, workout analytics, reading progress, and more detailed insights.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Community View */}
                {currentView === 'community' && (
                    <div className="space-y-3">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Community</h2>
                        <div className="bg-white rounded-xl border border-gray-200 p-8">
                            <div className="text-center">
                                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="font-semibold text-gray-700 mb-2">Community Features Coming Soon!</h3>
                                <p className="text-gray-500 text-sm">
                                    Share progress, get motivation, connect with other challengers, and join accountability groups.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

            </div>

            {/* Settings Modal */}
            {showSettings && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-gray-900">Settings</h2>
                            <button
                                onClick={() => setShowSettings(false)}
                                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-4 space-y-6">
                            {/* Profile Section */}
                            <div>
                                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                                    <User className="w-4 h-4 mr-2" />
                                    Profile
                                </h3>
                                <div className="space-y-3">
                                    {editingProfile ? (
                                        <div className="space-y-2">
                                            <input
                                                type="text"
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                className="input w-full"
                                                placeholder="Enter your name"
                                            />
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={handleSaveProfile}
                                                    disabled={!editName.trim()}
                                                    className="btn btn-primary btn-sm flex-1"
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    onClick={() => setEditingProfile(false)}
                                                    className="btn btn-secondary btn-sm flex-1"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div>
                                                <div className="font-medium text-gray-900">{userProfile?.name}</div>
                                                <div className="text-sm text-gray-500">
                                                    Attempt #{userProfile?.challengeAttempts || 1}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setEditingProfile(true)}
                                                className="btn btn-outline btn-sm"
                                            >
                                                Edit
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Challenge Management */}
                            <div>
                                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                                    <RotateCcw className="w-4 h-4 mr-2" />
                                    Challenge
                                </h3>
                                <div className="space-y-2">
                                    <button
                                        onClick={() => setShowRestartConfirm(true)}
                                        className="w-full p-3 text-left bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200 transition-colors"
                                    >
                                        <div className="font-medium text-amber-800">Restart Challenge</div>
                                        <div className="text-sm text-amber-600">Start over from Day 1</div>
                                    </button>
                                </div>
                            </div>

                            {/* Data Management */}
                            <div>
                                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                                    <Download className="w-4 h-4 mr-2" />
                                    Data
                                </h3>
                                <div className="space-y-2">
                                    <button
                                        onClick={handleExportData}
                                        className="w-full p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
                                    >
                                        <div className="font-medium text-blue-800 flex items-center">
                                            <Download className="w-4 h-4 mr-2" />
                                            Export Data
                                        </div>
                                        <div className="text-sm text-blue-600">Download backup file</div>
                                    </button>

                                    <label className="w-full p-3 text-left bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors cursor-pointer block">
                                        <div className="font-medium text-green-800 flex items-center">
                                            <Upload className="w-4 h-4 mr-2" />
                                            Import Data
                                        </div>
                                        <div className="text-sm text-green-600">Restore from backup</div>
                                        <input
                                            type="file"
                                            accept=".json"
                                            onChange={handleImportData}
                                            className="hidden"
                                        />
                                    </label>

                                    <button
                                        onClick={() => setShowClearDataConfirm(true)}
                                        className="w-full p-3 text-left bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition-colors"
                                    >
                                        <div className="font-medium text-red-800 flex items-center">
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Clear All Data
                                        </div>
                                        <div className="text-sm text-red-600">Reset everything</div>
                                    </button>
                                </div>
                            </div>

                            {/* App Info */}
                            <div>
                                <h3 className="text-sm font-semibold text-gray-900 mb-3">About</h3>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <div className="text-sm text-gray-600">
                                        <div className="font-medium text-gray-900 mb-1">75 Hard Challenge Tracker</div>
                                        <div>Version 1.0.0</div>
                                        <div>Built with Next.js & TypeScript</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Restart Confirmation Modal */}
            {showRestartConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-sm w-full p-6">
                        <div className="text-center">
                            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertTriangle className="w-6 h-6 text-amber-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Restart Challenge?</h3>
                            <p className="text-gray-600 mb-6">
                                This will reset your progress and start from Day 1. All task completions will be lost.
                            </p>
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setShowRestartConfirm(false)}
                                    className="btn btn-secondary flex-1"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleRestartChallenge}
                                    className="btn btn-destructive flex-1"
                                >
                                    Restart
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Clear Data Confirmation Modal */}
            {showClearDataConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-sm w-full p-6">
                        <div className="text-center">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="w-6 h-6 text-red-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Clear All Data?</h3>
                            <p className="text-gray-600 mb-6">
                                This will permanently delete your profile, progress, and all data. This action cannot be undone.
                            </p>
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setShowClearDataConfirm(false)}
                                    className="btn btn-secondary flex-1"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleClearAllData}
                                    className="btn btn-destructive flex-1"
                                >
                                    Clear All
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Bottom Navigation */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-bottom">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="grid grid-cols-4 gap-1">
                        <button
                            onClick={() => handleNavigation('home')}
                            className={`flex flex-col items-center py-3 px-2 transition-colors ${currentView === 'home'
                                ? 'text-blue-600'
                                : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            <Target className="w-6 h-6 mb-1" />
                            <span className="text-xs font-medium">Tasks</span>
                        </button>

                        <button
                            onClick={() => handleNavigation('calendar')}
                            className={`flex flex-col items-center py-3 px-2 transition-colors ${currentView === 'calendar'
                                ? 'text-blue-600'
                                : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            <Calendar className="w-6 h-6 mb-1" />
                            <span className="text-xs font-medium">Calendar</span>
                        </button>

                        <button
                            onClick={() => handleNavigation('stats')}
                            className={`flex flex-col items-center py-3 px-2 transition-colors ${currentView === 'stats'
                                ? 'text-blue-600'
                                : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            <BarChart3 className="w-6 h-6 mb-1" />
                            <span className="text-xs font-medium">Stats</span>
                        </button>

                        <button
                            onClick={() => handleNavigation('community')}
                            className={`flex flex-col items-center py-3 px-2 transition-colors ${currentView === 'community'
                                ? 'text-blue-600'
                                : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            <Users className="w-6 h-6 mb-1" />
                            <span className="text-xs font-medium">Community</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
} 