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
    AlertTriangle,
    Plus,
    Edit,
    Trash
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

    // Custom tasks state
    const [customTasks, setCustomTasks] = useState<string[]>([]);
    const [newTaskText, setNewTaskText] = useState('');
    const [showAddTask, setShowAddTask] = useState(false);
    const [completedTasks, setCompletedTasks] = useState<{ [key: string]: string | boolean }>({});

    // Default tasks that are pre-populated
    const DEFAULT_TASKS = [
        "Drink 8 glasses of water daily",
        "Exercise for 30 minutes",
        "Read for 15 minutes",
        "Eat no junk food today",
        "Take a progress photo",
        "Walk 8,000 steps",
        "No social media for 1 hour before bed"
    ];

    // Task icons and colors for better visual appeal
    const getTaskDisplay = (taskText: string) => {
        const lowerTask = taskText.toLowerCase();

        if (lowerTask.includes('water') || lowerTask.includes('drink')) {
            return { icon: '💧', color: 'from-blue-400 to-cyan-400', bgColor: 'from-blue-50 to-cyan-50' };
        } else if (lowerTask.includes('exercise') || lowerTask.includes('workout') || lowerTask.includes('gym')) {
            return { icon: '💪', color: 'from-red-400 to-pink-400', bgColor: 'from-red-50 to-pink-50' };
        } else if (lowerTask.includes('read') || lowerTask.includes('book')) {
            return { icon: '📚', color: 'from-green-400 to-emerald-400', bgColor: 'from-green-50 to-emerald-50' };
        } else if (lowerTask.includes('food') || lowerTask.includes('diet') || lowerTask.includes('eat')) {
            return { icon: '🥗', color: 'from-orange-400 to-yellow-400', bgColor: 'from-orange-50 to-yellow-50' };
        } else if (lowerTask.includes('photo') || lowerTask.includes('picture')) {
            return { icon: '📸', color: 'from-purple-400 to-indigo-400', bgColor: 'from-purple-50 to-indigo-50' };
        } else if (lowerTask.includes('walk') || lowerTask.includes('step')) {
            return { icon: '🚶‍♂️', color: 'from-teal-400 to-green-400', bgColor: 'from-teal-50 to-green-50' };
        } else if (lowerTask.includes('social media') || lowerTask.includes('phone') || lowerTask.includes('screen')) {
            return { icon: '📱', color: 'from-gray-400 to-slate-400', bgColor: 'from-gray-50 to-slate-50' };
        } else {
            return { icon: '✅', color: 'from-indigo-400 to-purple-400', bgColor: 'from-indigo-50 to-purple-50' };
        }
    };

    useEffect(() => {
        console.log('🔄 Component mounted, initializing...');

        const initialize = () => {
            try {
                const profile = localStorage.getItem('user_profile');
                const storedTasks = localStorage.getItem('custom_tasks');
                const storedCompleted = localStorage.getItem('completed_tasks');

                if (storedTasks) {
                    const parsedTasks = JSON.parse(storedTasks);
                    if (Array.isArray(parsedTasks) && parsedTasks.length > 0) {
                        setCustomTasks(parsedTasks);
                    } else {
                        // If stored tasks exist but are empty, use defaults
                        console.log('📝 Empty stored tasks found, loading defaults');
                        setCustomTasks(DEFAULT_TASKS);
                        localStorage.setItem('custom_tasks', JSON.stringify(DEFAULT_TASKS));
                    }
                } else {
                    // If no stored tasks, use defaults
                    console.log('📝 No stored tasks found, loading defaults');
                    setCustomTasks(DEFAULT_TASKS);
                    localStorage.setItem('custom_tasks', JSON.stringify(DEFAULT_TASKS));
                }

                if (storedCompleted) {
                    const completed = JSON.parse(storedCompleted);
                    const lastReset = localStorage.getItem('last_reset_date');
                    const today = new Date().toDateString();

                    // Reset tasks if it's a new day
                    if (lastReset !== today) {
                        setCompletedTasks({});
                        localStorage.setItem('completed_tasks', JSON.stringify({}));
                        localStorage.setItem('last_reset_date', today);
                    } else {
                        setCompletedTasks(completed);
                    }
                } else {
                    // Set initial reset date
                    localStorage.setItem('last_reset_date', new Date().toDateString());
                }

                if (profile) {
                    const parsedProfile = JSON.parse(profile);
                    setUserProfile(parsedProfile);

                    const settings = localStorage.getItem('challenge_settings');
                    if (settings) {
                        setChallengeSettings(JSON.parse(settings));
                    }

                    console.log('✅ Existing user - loading main app');
                } else {
                    console.log('❌ New user - showing setup');
                    setShowSetup(true);
                }
            } catch (error) {
                console.error('💥 Error during initialization:', error);
                setShowSetup(true);
            }

            setIsLoading(false);
            console.log('🏁 Initialization complete');
            console.log('📊 Final state - customTasks.length:', customTasks.length);
        };

        initialize();
    }, []);

    // Debug effect to monitor customTasks changes
    useEffect(() => {
        console.log('📝 CustomTasks updated:', customTasks.length, customTasks);
    }, [customTasks]);

    // Force load defaults if we're loaded but have no tasks
    useEffect(() => {
        if (!isLoading && userProfile && customTasks.length === 0) {
            console.log('🔥 Force loading default tasks for existing user');
            setCustomTasks(DEFAULT_TASKS);
            localStorage.setItem('custom_tasks', JSON.stringify(DEFAULT_TASKS));
        }
    }, [isLoading, userProfile, customTasks.length]);

    const handleStartChallenge = () => {
        if (!userName.trim()) return;

        // Create user profile
        const profile = ChallengeStorage.createDefaultProfile(userName.trim());

        // Initialize challenge
        const settings = ChallengeStorage.initializeChallenge();

        // Create today's progress
        const today = dateUtils.toISOString(new Date());
        const dayProgress = ChallengeStorage.createDayProgress(today, 1);

        // Set default tasks for new users
        if (customTasks.length === 0) {
            setCustomTasks(DEFAULT_TASKS);
            localStorage.setItem('custom_tasks', JSON.stringify(DEFAULT_TASKS));
        }

        setUserProfile(profile);
        setChallengeSettings(settings);
        setTodayProgress(dayProgress);
        setShowSetup(false);
    };

    const handleAddCustomTask = () => {
        if (!newTaskText.trim()) return;

        const updatedTasks = [...customTasks, newTaskText.trim()];
        setCustomTasks(updatedTasks);
        localStorage.setItem('custom_tasks', JSON.stringify(updatedTasks));
        setNewTaskText('');
        setShowAddTask(false);
    };

    const handleDeleteCustomTask = (index: number) => {
        const updatedTasks = customTasks.filter((_, i) => i !== index);
        setCustomTasks(updatedTasks);
        localStorage.setItem('custom_tasks', JSON.stringify(updatedTasks));

        // Also remove from completed tasks
        const taskToRemove = customTasks[index];
        const updatedCompleted = { ...completedTasks };
        delete updatedCompleted[taskToRemove];
        setCompletedTasks(updatedCompleted);
        localStorage.setItem('completed_tasks', JSON.stringify(updatedCompleted));
    };

    const handleToggleTask = (taskName: string) => {
        const isCurrentlyCompleted = completedTasks[taskName];
        const updatedCompleted = {
            ...completedTasks,
            [taskName]: !isCurrentlyCompleted ? new Date().toISOString() : false
        };
        setCompletedTasks(updatedCompleted);
        localStorage.setItem('completed_tasks', JSON.stringify(updatedCompleted));
    };

    // Varied celebration messages and emojis
    const getCelebrationContent = (taskText: string) => {
        const celebrations = [
            { message: "Excellent work!", emoji: "⭐" },
            { message: "You're crushing it!", emoji: "🔥" },
            { message: "Well done!", emoji: "✨" },
            { message: "Great job!", emoji: "🎯" },
            { message: "Keep it up!", emoji: "💪" },
            { message: "Fantastic!", emoji: "🌟" }
        ];

        // Use task text to consistently pick the same celebration for the same task
        const index = taskText.length % celebrations.length;
        return celebrations[index];
    };

    const formatCompletionTime = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
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
        if (!todayProgress || !todayProgress.tasks || !todayProgress.tasks[taskType]) return;

        const currentTask = todayProgress.tasks[taskType] as any;
        const newCompletedState = !currentTask.completed;

        const updatedProgress = { ...todayProgress };
        if (updatedProgress.tasks) {
            (updatedProgress.tasks[taskType] as any).completed = newCompletedState;
            (updatedProgress.tasks[taskType] as any).completedAt = newCompletedState ? new Date() : undefined;
            updatedProgress.allCompleted = Object.values(updatedProgress.tasks).every((task: any) => task?.completed);
        }

        setTodayProgress(updatedProgress);
        ChallengeStorage.saveDailyProgress(updatedProgress);
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
        localStorage.removeItem('custom_tasks');
        localStorage.removeItem('completed_tasks');

        setUserProfile(null);
        setChallengeSettings(null);
        setTodayProgress(null);
        setCustomTasks([]);
        setCompletedTasks({});
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
        event.target.value = '';
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500">
                <div className="text-center">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/30 border-t-white mx-auto mb-6"></div>
                        <div className="absolute inset-0 rounded-full h-16 w-16 bg-white/10 blur-xl mx-auto"></div>
                    </div>
                    <p className="text-white font-bold text-xl mb-2">Loading your challenge...</p>
                    <p className="text-white/80">Get ready to transform your life! 🚀</p>
                </div>
            </div>
        );
    }

    if (showSetup || !userProfile) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 flex items-center justify-center p-4 py-8 safe-top safe-bottom overflow-y-auto">
                <div className="max-w-md w-full space-y-4 sm:space-y-8 my-auto">
                    <div className="text-center space-y-4 sm:space-y-6">
                        <div className="relative">
                            <div className="mx-auto w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-2xl">
                                <Trophy className="w-8 h-8 sm:w-12 sm:h-12 text-white" />
                            </div>
                            <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-pink-400 to-red-500 rounded-full flex items-center justify-center animate-bounce">
                                <span className="text-sm sm:text-lg">🔥</span>
                            </div>
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-4xl font-bold text-white mb-2 sm:mb-3">
                                Welcome to 75 Hard
                            </h1>
                            <p className="text-sm sm:text-xl text-blue-100 px-2">
                                Transform your life in 75 days through mental toughness and discipline
                            </p>
                        </div>
                    </div>

                    <div className="bg-white/95 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-2xl border border-white/30 p-4 sm:p-8">
                        <div className="space-y-4 sm:space-y-6">
                            <div className="text-center">
                                <h2 className="text-lg sm:text-2xl font-bold text-gray-800 mb-1 sm:mb-2">🚀 Get Started</h2>
                                <p className="text-sm sm:text-base text-gray-600">
                                    Enter your name to begin your personalized 75 Hard journey
                                </p>
                            </div>

                            <div className="space-y-3 sm:space-y-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                                        Your Name
                                    </label>
                                    <input
                                        id="name"
                                        type="text"
                                        value={userName}
                                        onChange={(e) => setUserName(e.target.value)}
                                        placeholder="Enter your name"
                                        className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 text-gray-800 text-sm sm:text-base"
                                        onKeyPress={(e) => e.key === 'Enter' && handleStartChallenge()}
                                        autoFocus
                                    />
                                </div>

                                <button
                                    onClick={handleStartChallenge}
                                    disabled={!userName.trim()}
                                    className="w-full px-4 py-3 sm:px-6 sm:py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg sm:rounded-xl hover:from-purple-600 hover:to-blue-600 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 font-bold text-sm sm:text-lg shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
                                >
                                    <Play className="w-4 h-4 sm:w-6 sm:h-6 mr-2 sm:mr-3 inline" />
                                    Start 75 Hard Challenge
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="text-center">
                        <p className="text-xs sm:text-base text-blue-100">
                            ✨ Create your own challenge with personalized tasks
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    const currentDay = getCurrentDay();
    const progressPercentage = getProgressPercentage();
    const isActive = challengeSettings?.isActive && currentDay <= 75;

    if (!userProfile) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
                <div className="text-center">
                    <p className="text-blue-700 font-medium">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
                {/* Header */}
                <header className="bg-gradient-to-r from-purple-600/90 to-blue-600/90 backdrop-blur-sm shadow-xl border-b border-white/20 safe-top">
                    <div className="max-w-4xl mx-auto px-4">
                        <div className="flex justify-between items-center py-4">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                                    <Trophy className="w-7 h-7 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-white">75 Hard Challenge</h1>
                                    <p className="text-sm text-blue-100">{getGreeting()}, {userProfile?.name || 'User'} 👋</p>
                                </div>
                            </div>
                            <button
                                onClick={handleShowSettings}
                                className="p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
                            >
                                <Settings className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <div className="max-w-4xl mx-auto px-4 py-3 pb-20">

                    {/* Progress Overview */}
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

                    {/* Custom Tasks Section */}
                    {currentView === 'home' && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <h2 className="text-lg font-semibold text-white">Your Tasks</h2>
                                    <p className="text-sm text-blue-200/80">Tap to complete, customize as needed</p>
                                </div>
                                <button
                                    onClick={() => setShowAddTask(true)}
                                    className="flex items-center space-x-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>Add</span>
                                </button>
                            </div>

                            {/* Add Task Form */}
                            {showAddTask && (
                                <div className="bg-white rounded-lg border border-gray-200 p-4 mb-3 shadow-md">
                                    <div className="space-y-3">
                                        <input
                                            type="text"
                                            value={newTaskText}
                                            onChange={(e) => setNewTaskText(e.target.value)}
                                            placeholder="Enter your task (e.g., Meditate for 10 minutes)"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 text-gray-800 placeholder-gray-500 text-sm"
                                            onKeyPress={(e) => e.key === 'Enter' && handleAddCustomTask()}
                                            autoFocus
                                        />
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={handleAddCustomTask}
                                                disabled={!newTaskText.trim()}
                                                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                                            >
                                                Add Task
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setShowAddTask(false);
                                                    setNewTaskText('');
                                                }}
                                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 border border-gray-300 transition-colors text-sm"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Custom Tasks List */}
                            {customTasks.length > 0 ? (
                                <div className="space-y-2">
                                    {customTasks.map((task, index) => {
                                        const completionData = completedTasks[task];
                                        const isCompleted = completionData !== false && !!completionData;
                                        const taskDisplay = getTaskDisplay(task);
                                        const celebration = getCelebrationContent(task);
                                        return (
                                            <div
                                                key={index}
                                                className={`relative rounded-lg border transition-all duration-200 hover:shadow-md ${isCompleted
                                                    ? `bg-gradient-to-r ${taskDisplay.bgColor} border-green-300`
                                                    : 'bg-white border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                <div className="p-3">
                                                    <div className="flex items-center">
                                                        <div
                                                            className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200 ${isCompleted
                                                                ? 'bg-green-500 text-white'
                                                                : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                                                                }`}
                                                            onClick={() => handleToggleTask(task)}
                                                        >
                                                            {isCompleted ? (
                                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                </svg>
                                                            ) : (
                                                                <span className="text-lg">{taskDisplay.icon}</span>
                                                            )}
                                                        </div>

                                                        <div className="flex-1 min-w-0 ml-3">
                                                            <h3 className={`font-medium text-base ${isCompleted ? 'text-green-700 opacity-75' : 'text-gray-800'}`}>
                                                                {task}
                                                            </h3>
                                                            <p className={`text-xs mt-0.5 ${isCompleted ? 'text-green-600' : 'text-gray-500'}`}>
                                                                {isCompleted
                                                                    ? `${celebration.message} • ${formatCompletionTime(completionData as string)}`
                                                                    : 'Tap to complete'
                                                                }
                                                            </p>
                                                        </div>

                                                        <button
                                                            onClick={() => handleDeleteCustomTask(index)}
                                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-2"
                                                        >
                                                            <Trash className="w-4 h-4" />
                                                        </button>

                                                        {isCompleted && (
                                                            <div className="ml-1">
                                                                <span className="text-lg">{celebration.emoji}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="bg-white rounded-lg border border-gray-200 p-6 text-center shadow-sm">
                                    <div className="w-12 h-12 bg-gray-100 rounded-lg mx-auto mb-3 flex items-center justify-center">
                                        <Target className="w-6 h-6 text-gray-400" />
                                    </div>
                                    <h3 className="text-base font-semibold text-gray-700 mb-2">No tasks yet</h3>
                                    <p className="text-sm text-gray-500 mb-4">
                                        Add your first task to get started with your challenge
                                    </p>
                                    <button
                                        onClick={() => setShowAddTask(true)}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                    >
                                        Add Your First Task
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Calendar View */}
                    {currentView === 'calendar' && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Challenge Calendar</h2>
                            <p className="text-gray-600">Calendar view coming soon...</p>
                        </div>
                    )}

                    {/* Stats View */}
                    {currentView === 'stats' && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Statistics</h2>
                            <p className="text-gray-600">Statistics view coming soon...</p>
                        </div>
                    )}

                    {/* Community View */}
                    {currentView === 'community' && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Community</h2>
                            <p className="text-gray-600">Community features coming soon...</p>
                        </div>
                    )}
                </div>

                {/* Bottom Navigation */}
                <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-bottom">
                    <div className="max-w-4xl mx-auto px-4">
                        <div className="flex justify-around py-2">
                            {[
                                { id: 'home', icon: Trophy, label: 'Home' },
                                { id: 'calendar', icon: Calendar, label: 'Calendar' },
                                { id: 'stats', icon: BarChart3, label: 'Stats' },
                                { id: 'community', icon: Users, label: 'Community' }
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => handleNavigation(item.id as any)}
                                    className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${currentView === item.id
                                        ? 'text-blue-600 bg-blue-50'
                                        : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    <item.icon className="w-5 h-5 mb-1" />
                                    <span className="text-xs font-medium">{item.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </nav>
            </div>

            {/* Settings Modal */}
            {showSettings && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-4 border-b border-gray-200">
                            <h2 className="text-lg font-bold text-gray-900">Settings</h2>
                            <button
                                onClick={() => setShowSettings(false)}
                                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-4 space-y-4">
                            {/* Profile Section */}
                            <div className="space-y-3">
                                <h3 className="font-semibold text-gray-900">Profile</h3>
                                <div className="flex items-center space-x-3">
                                    <User className="w-8 h-8 text-gray-400" />
                                    <div className="flex-1">
                                        {editingProfile ? (
                                            <div className="flex space-x-2">
                                                <input
                                                    type="text"
                                                    value={editName}
                                                    onChange={(e) => setEditName(e.target.value)}
                                                    className="flex-1 px-2 py-1 border border-gray-300 rounded"
                                                />
                                                <button
                                                    onClick={handleSaveProfile}
                                                    className="px-3 py-1 bg-green-600 text-white rounded text-sm"
                                                >
                                                    Save
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium">{userProfile?.name}</span>
                                                <button
                                                    onClick={() => setEditingProfile(true)}
                                                    className="p-1 text-gray-400 hover:text-gray-600"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Data Management */}
                            <div className="space-y-3">
                                <h3 className="font-semibold text-gray-900">Data</h3>
                                <div className="space-y-2">
                                    <button
                                        onClick={handleExportData}
                                        className="w-full flex items-center space-x-2 p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                                    >
                                        <Download className="w-4 h-4" />
                                        <span>Export Data</span>
                                    </button>

                                    <label className="w-full flex items-center space-x-2 p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors cursor-pointer">
                                        <Upload className="w-4 h-4" />
                                        <span>Import Data</span>
                                        <input
                                            type="file"
                                            accept=".json"
                                            onChange={handleImportData}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                            </div>

                            {/* Challenge Actions */}
                            <div className="space-y-3">
                                <h3 className="font-semibold text-gray-900">Challenge</h3>
                                <div className="space-y-2">
                                    <button
                                        onClick={() => setShowRestartConfirm(true)}
                                        className="w-full flex items-center space-x-2 p-3 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors"
                                    >
                                        <RotateCcw className="w-4 h-4" />
                                        <span>Restart Challenge</span>
                                    </button>

                                    <button
                                        onClick={() => setShowClearDataConfirm(true)}
                                        className="w-full flex items-center space-x-2 p-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        <span>Clear All Data</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Restart Confirmation Modal */}
            {showRestartConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <div className="flex items-center space-x-3 mb-4">
                            <AlertTriangle className="w-6 h-6 text-yellow-600" />
                            <h2 className="text-lg font-bold text-gray-900">Restart Challenge?</h2>
                        </div>
                        <p className="text-gray-600 mb-6">
                            This will reset your progress and start the challenge from Day 1. Your profile and tasks will be preserved.
                        </p>
                        <div className="flex space-x-3">
                            <button
                                onClick={handleRestartChallenge}
                                className="flex-1 bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 transition-colors"
                            >
                                Restart Challenge
                            </button>
                            <button
                                onClick={() => setShowRestartConfirm(false)}
                                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Clear Data Confirmation Modal */}
            {showClearDataConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <div className="flex items-center space-x-3 mb-4">
                            <AlertTriangle className="w-6 h-6 text-red-600" />
                            <h2 className="text-lg font-bold text-gray-900">Clear All Data?</h2>
                        </div>
                        <p className="text-gray-600 mb-6">
                            This will permanently delete all your data including progress, profile, and custom tasks. This action cannot be undone.
                        </p>
                        <div className="flex space-x-3">
                            <button
                                onClick={handleClearAllData}
                                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Clear All Data
                            </button>
                            <button
                                onClick={() => setShowClearDataConfirm(false)}
                                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
} 