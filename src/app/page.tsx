/**
 * Home Page Component
 * Main landing page for the 75 Hard Challenge app with Supabase primary storage
 */

'use client';

import { useState, useEffect } from 'react';
import { supabaseStorage, StorageResult } from '@/lib/supabase-storage';
import { UserProfile, ChallengeSettings, DayProgress, TaskType } from '@/types/challenge';
import { DatabaseUser, DatabaseChallenge, DatabaseCustomTask } from '@/types/database';
import { getGreeting, getMotivationalMessage, dateUtils } from '@/lib/utils';
import { errorHandler, AppError } from '@/lib/error-handler';
import {
    Trophy,
    Target,
    Calendar as CalendarIcon,
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
    Trash,
    Wifi,
    WifiOff
} from 'lucide-react';
import Header from '@/components/Header';
import ProgressOverview from '@/components/ProgressOverview';
import TaskList from '@/components/TaskList';
import AddTaskForm from '@/components/AddTaskForm';
import BottomNavigation from '@/components/BottomNavigation';
import SettingsModal from '@/components/SettingsModal';
import ConfirmationModal from '@/components/ConfirmationModal';
import Calendar from '@/components/Calendar';
import Stats from '@/components/Stats';
import ErrorNotification, { SuccessNotification, LoadingNotification } from '@/components/ErrorNotification';
import { useSession, signIn } from 'next-auth/react';

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

    // Custom tasks and completions state
    const [customTasks, setCustomTasks] = useState<DatabaseCustomTask[]>([]);
    const [taskCompletions, setTaskCompletions] = useState<{ [taskId: string]: boolean }>({});
    const [newTaskText, setNewTaskText] = useState('');
    const [showAddTask, setShowAddTask] = useState(false);

    // UI state
    const [currentError, setCurrentError] = useState<AppError | null>(null);
    const [successMessage, setSuccessMessage] = useState<string>('');
    const [loadingMessage, setLoadingMessage] = useState<string>('');
    const [syncStatus, setSyncStatus] = useState<any>(null);

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

    const { data: session, status } = useSession();

    // Subscribe to sync status changes
    useEffect(() => {
        const unsubscribe = supabaseStorage.onSyncStatusChange((status) => {
            setSyncStatus(status);
        });

        return unsubscribe;
    }, []);

    // Task display helpers
    const getTaskDisplay = (taskText: string) => {
        const taskMap: { [key: string]: { icon: string; color: string; bgColor: string } } = {
            'water': { icon: '💧', color: 'text-blue-600', bgColor: 'from-blue-50 to-cyan-50' },
            'exercise': { icon: '💪', color: 'text-red-600', bgColor: 'from-red-50 to-orange-50' },
            'workout': { icon: '🏋️', color: 'text-orange-600', bgColor: 'from-orange-50 to-red-50' },
            'read': { icon: '📚', color: 'text-green-600', bgColor: 'from-green-50 to-emerald-50' },
            'diet': { icon: '🥗', color: 'text-green-600', bgColor: 'from-green-50 to-lime-50' },
            'junk food': { icon: '🚫', color: 'text-red-600', bgColor: 'from-red-50 to-pink-50' },
            'photo': { icon: '📸', color: 'text-purple-600', bgColor: 'from-purple-50 to-indigo-50' },
            'walk': { icon: '🚶', color: 'text-indigo-600', bgColor: 'from-indigo-50 to-blue-50' },
            'steps': { icon: '👣', color: 'text-blue-600', bgColor: 'from-blue-50 to-cyan-50' },
            'social media': { icon: '📱', color: 'text-gray-600', bgColor: 'from-gray-50 to-slate-50' },
            'meditation': { icon: '🧘', color: 'text-purple-600', bgColor: 'from-purple-50 to-violet-50' },
            'sleep': { icon: '😴', color: 'text-indigo-600', bgColor: 'from-indigo-50 to-purple-50' }
        };

        const lowerTask = taskText.toLowerCase();
        for (const [key, value] of Object.entries(taskMap)) {
            if (lowerTask.includes(key)) {
                return value;
            }
        }
        return { icon: '✅', color: 'text-gray-600', bgColor: 'from-gray-50 to-gray-100' };
    };

    // Initialize the application
    useEffect(() => {
        console.log('🔄 Component mounted, initializing...');

        const initialize = async () => {
            setLoadingMessage('Initializing application...');

            try {
                // Check if user is authenticated
                if (session?.user?.email) {
                    console.log('✅ User authenticated, loading from Supabase');
                    setLoadingMessage('Loading your profile...');

                    // Try to get user profile from Supabase
                    const profileResult = await supabaseStorage.getUserProfile();

                    if (profileResult.success && profileResult.data) {
                        setUserProfile(profileResult.data);
                        setLoadingMessage('Loading your tasks...');

                        // Load user's custom tasks
                        const tasksResult = await supabaseStorage.getTasks();
                        if (tasksResult.success && tasksResult.data) {
                            if (tasksResult.data.length > 0) {
                                setCustomTasks(tasksResult.data);
                            } else {
                                // Initialize default tasks for new user
                                console.log('📝 No tasks found, creating defaults');
                                setLoadingMessage('Setting up default tasks...');
                                const defaultTasksResult = await supabaseStorage.initializeDefaultTasks(DEFAULT_TASKS);
                                if (defaultTasksResult.success && defaultTasksResult.data) {
                                    setCustomTasks(defaultTasksResult.data);
                                }
                            }
                        }

                        setLoadingMessage('Loading your progress...');

                        // Load challenge data
                        const challengesResult = await supabaseStorage.getChallenges();
                        if (challengesResult.success && challengesResult.data) {
                            const activeChallenge = challengesResult.data.find(c => c.is_active);
                            if (activeChallenge) {
                                setChallengeSettings({
                                    id: activeChallenge.id,
                                    startDate: activeChallenge.start_date,
                                    endDate: activeChallenge.end_date,
                                    isActive: activeChallenge.is_active,
                                    currentDay: activeChallenge.current_day,
                                });
                            }
                        }

                        // Load today's task completions
                        const completionsResult = await supabaseStorage.getTaskCompletions();
                        if (completionsResult.success && completionsResult.data) {
                            const completions: { [taskId: string]: boolean } = {};
                            Object.values(completionsResult.data).forEach(completion => {
                                completions[completion.taskId] = completion.completed;
                            });
                            setTaskCompletions(completions);
                        }

                        setShowSetup(false);
                        setSuccessMessage('Welcome back! Your data has been loaded.');
                    } else {
                        console.log('❌ No existing user profile found');
                        setShowSetup(true);
                    }
                } else {
                    console.log('⚠️ No session, showing setup');
                    setShowSetup(true);
                }
            } catch (error) {
                console.error('💥 Error during initialization:', error);
                const appError = errorHandler.handle(error, { category: 'database' });
                setCurrentError(appError);
                setShowSetup(true);
            }

            setIsLoading(false);
            setLoadingMessage('');
            console.log('🏁 Initialization complete');
        };

        initialize();
    }, [session]);

    // Cleanup effect to prevent memory leaks
    useEffect(() => {
        return () => {
            // Cleanup SupabaseStorage when component unmounts
            supabaseStorage.cleanup();
            console.log('🧹 Component cleanup completed');
        };
    }, []);

    // Handle manual challenge start
    const handleStartChallenge = async () => {
        if (!userName.trim()) return;

        setLoadingMessage('Creating your profile...');

        try {
            // Create user profile
            const profileResult = await supabaseStorage.createUserProfile({
                name: userName.trim(),
            });

            if (profileResult.success && profileResult.data) {
                setUserProfile(profileResult.data);
                setLoadingMessage('Setting up your challenge...');

                // Create challenge
                const challengeResult = await supabaseStorage.createChallenge({
                    start_date: new Date().toISOString().split('T')[0],
                });

                if (challengeResult.success && challengeResult.data) {
                    setChallengeSettings({
                        id: challengeResult.data.id,
                        startDate: challengeResult.data.start_date,
                        endDate: challengeResult.data.end_date,
                        isActive: challengeResult.data.is_active,
                        currentDay: challengeResult.data.current_day,
                    });
                }

                setLoadingMessage('Setting up default tasks...');

                // Initialize default tasks
                const defaultTasksResult = await supabaseStorage.initializeDefaultTasks(DEFAULT_TASKS);
                if (defaultTasksResult.success && defaultTasksResult.data) {
                    setCustomTasks(defaultTasksResult.data);
                }

                setShowSetup(false);
                setSuccessMessage('Welcome to 75 Hard! Your challenge has been set up.');
            } else {
                setCurrentError(profileResult.error || errorHandler.handle('Failed to create profile', { category: 'database' }));
            }
        } catch (error) {
            const appError = errorHandler.handle(error, { category: 'database' });
            setCurrentError(appError);
        }

        setLoadingMessage('');
    };

    // Handle Google sign-in
    const handleGoogleSignIn = () => {
        signIn('google');
    };

    // Auto-start challenge when user signs in with Google
    useEffect(() => {
        if (session?.user?.name && session?.user?.email && !userProfile) {
            const createUserAndChallenge = async () => {
                setLoadingMessage('Setting up your account...');

                try {
                    // Create user profile via Supabase
                    const profileResult = await supabaseStorage.createUserProfile({
                        name: session.user?.name!,
                        google_id: session.user?.email!,
                        avatar_url: session.user?.image || undefined,
                    });

                    if (profileResult.success && profileResult.data) {
                        setUserProfile(profileResult.data);
                        setLoadingMessage('Creating your challenge...');

                        // Create challenge
                        const challengeResult = await supabaseStorage.createChallenge({
                            start_date: new Date().toISOString().split('T')[0],
                        });

                        if (challengeResult.success && challengeResult.data) {
                            setChallengeSettings({
                                id: challengeResult.data.id,
                                startDate: challengeResult.data.start_date,
                                endDate: challengeResult.data.end_date,
                                isActive: challengeResult.data.is_active,
                                currentDay: challengeResult.data.current_day,
                            });
                        }

                        setLoadingMessage('Setting up default tasks...');

                        // Initialize default tasks
                        const defaultTasksResult = await supabaseStorage.initializeDefaultTasks(DEFAULT_TASKS);
                        if (defaultTasksResult.success && defaultTasksResult.data) {
                            setCustomTasks(defaultTasksResult.data);
                        }

                        setShowSetup(false);
                        setSuccessMessage('Welcome to 75 Hard! Your Google account has been linked.');
                    } else {
                        setCurrentError(profileResult.error || errorHandler.handle('Failed to create profile', { category: 'database' }));
                    }
                } catch (error) {
                    const appError = errorHandler.handle(error, { category: 'database' });
                    setCurrentError(appError);
                }

                setLoadingMessage('');
            };

            createUserAndChallenge();
        }
    }, [session, userProfile]);

    // Handle adding custom task
    const handleAddCustomTask = async () => {
        if (!newTaskText.trim()) return;

        setLoadingMessage('Adding task...');

        try {
            const taskResult = await supabaseStorage.createTask({
                task_text: newTaskText.trim(),
                is_default: false,
                order_index: customTasks.length,
            });

            if (taskResult.success && taskResult.data) {
                setCustomTasks(prev => [...prev, taskResult.data!]);
                setNewTaskText('');
                setShowAddTask(false);
                setSuccessMessage('Task added successfully!');
            } else {
                setCurrentError(taskResult.error || errorHandler.handle('Failed to add task', { category: 'database' }));
            }
        } catch (error) {
            const appError = errorHandler.handle(error, { category: 'database' });
            setCurrentError(appError);
        }

        setLoadingMessage('');
    };

    // Handle deleting custom task
    const handleDeleteCustomTask = async (index: number) => {
        const taskToDelete = customTasks[index];
        if (!taskToDelete) return;

        setLoadingMessage('Deleting task...');

        try {
            const deleteResult = await supabaseStorage.deleteTask(taskToDelete.id);

            if (deleteResult.success) {
                setCustomTasks(prev => prev.filter((_, i) => i !== index));

                // Remove from completions
                const updatedCompletions = { ...taskCompletions };
                delete updatedCompletions[taskToDelete.id];
                setTaskCompletions(updatedCompletions);

                setSuccessMessage('Task deleted successfully!');
            } else {
                setCurrentError(deleteResult.error || errorHandler.handle('Failed to delete task', { category: 'database' }));
            }
        } catch (error) {
            const appError = errorHandler.handle(error, { category: 'database' });
            setCurrentError(appError);
        }

        setLoadingMessage('');
    };

    // Handle task completion toggle
    const handleToggleTask = async (taskId: string) => {
        const isCurrentlyCompleted = taskCompletions[taskId] || false;
        const newCompletionState = !isCurrentlyCompleted;

        // Update UI immediately for responsive feel
        setTaskCompletions(prev => ({
            ...prev,
            [taskId]: newCompletionState
        }));

        try {
            const completeResult = await supabaseStorage.completeTask(taskId, newCompletionState);

            if (completeResult.success) {
                const action = newCompletionState ? 'completed' : 'uncompleted';
                setSuccessMessage(`Task ${action} successfully!`);
            } else {
                // Revert on failure
                setTaskCompletions(prev => ({
                    ...prev,
                    [taskId]: isCurrentlyCompleted
                }));
                setCurrentError(completeResult.error || errorHandler.handle('Failed to update task', { category: 'database' }));
            }
        } catch (error) {
            // Revert on error
            setTaskCompletions(prev => ({
                ...prev,
                [taskId]: isCurrentlyCompleted
            }));
            const appError = errorHandler.handle(error, { category: 'database' });
            setCurrentError(appError);
        }
    };

    // Helper functions for celebration content
    const getCelebrationContent = (taskText: string) => {
        const celebrationMap: { [key: string]: { message: string; emoji: string } } = {
            'water': { message: 'Hydration hero!', emoji: '💧' },
            'exercise': { message: 'Fitness champion!', emoji: '💪' },
            'workout': { message: 'Workout warrior!', emoji: '🏋️' },
            'read': { message: 'Knowledge seeker!', emoji: '📚' },
            'diet': { message: 'Nutrition ninja!', emoji: '🥗' },
            'junk food': { message: 'Willpower winner!', emoji: '🚫' },
            'photo': { message: 'Progress captured!', emoji: '📸' },
            'walk': { message: 'Step master!', emoji: '🚶' },
            'steps': { message: 'Walking legend!', emoji: '👣' },
            'social media': { message: 'Digital detox!', emoji: '📱' },
            'meditation': { message: 'Mindful master!', emoji: '🧘' },
            'sleep': { message: 'Rest champion!', emoji: '😴' }
        };

        const lowerTask = taskText.toLowerCase();
        for (const [key, value] of Object.entries(celebrationMap)) {
            if (lowerTask.includes(key)) {
                return value;
            }
        }
        return { message: 'Task completed!', emoji: '✅' };
    };

    const formatCompletionTime = (timestamp: string) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Calculate current day and progress
    const getCurrentDay = () => {
        if (!challengeSettings?.startDate) return 1;
        const start = new Date(challengeSettings.startDate);
        const today = new Date();
        const diffTime = today.getTime() - start.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return Math.max(1, Math.min(75, diffDays));
    };

    const getProgressPercentage = () => {
        const currentDay = getCurrentDay();
        return Math.round((currentDay / 75) * 100);
    };

    // Navigation and settings handlers
    const handleNavigation = (view: 'home' | 'calendar' | 'stats' | 'community') => {
        setCurrentView(view);
    };

    const handleShowSettings = () => {
        setShowSettings(true);
        if (userProfile) {
            setEditName(userProfile.name);
        }
    };

    const handleRestartChallenge = async () => {
        setLoadingMessage('Restarting challenge...');

        try {
            // Clear cache and start fresh
            await supabaseStorage.clearCache();

            // Create new challenge
            const challengeResult = await supabaseStorage.createChallenge({
                start_date: new Date().toISOString().split('T')[0],
            });

            if (challengeResult.success && challengeResult.data) {
                setChallengeSettings({
                    id: challengeResult.data.id,
                    startDate: challengeResult.data.start_date,
                    endDate: challengeResult.data.end_date,
                    isActive: challengeResult.data.is_active,
                    currentDay: challengeResult.data.current_day,
                });

                // Reset task completions
                setTaskCompletions({});

                setSuccessMessage('Challenge restarted successfully!');
            } else {
                setCurrentError(challengeResult.error || errorHandler.handle('Failed to restart challenge', { category: 'database' }));
            }
        } catch (error) {
            const appError = errorHandler.handle(error, { category: 'database' });
            setCurrentError(appError);
        }

        setLoadingMessage('');
        setShowRestartConfirm(false);
        setShowSettings(false);
    };

    const handleClearAllData = async () => {
        setLoadingMessage('Clearing all data...');

        try {
            await supabaseStorage.clearCache();

            // Reset all state
            setUserProfile(null);
            setChallengeSettings(null);
            setCustomTasks([]);
            setTaskCompletions({});
            setShowSetup(true);

            setSuccessMessage('All data cleared successfully!');
        } catch (error) {
            const appError = errorHandler.handle(error, { category: 'database' });
            setCurrentError(appError);
        }

        setLoadingMessage('');
        setShowClearDataConfirm(false);
        setShowSettings(false);
    };

    // UI state management
    const currentDay = getCurrentDay();
    const progressPercentage = getProgressPercentage();
    const isActive = challengeSettings?.isActive;

    // Show loading screen
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white text-lg">Loading your 75 Hard journey...</p>
                </div>
            </div>
        );
    }

    // Show setup screen
    if (showSetup) {
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

                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/20">
                        <div className="space-y-3 sm:space-y-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <p className="text-white text-sm sm:text-base">Follow a structured diet (no cheat meals)</p>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <p className="text-white text-sm sm:text-base">Two 45-minute workouts (one must be outdoor)</p>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <p className="text-white text-sm sm:text-base">Drink 1 gallon of water daily</p>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <p className="text-white text-sm sm:text-base">Read 10 pages of non-fiction daily</p>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <p className="text-white text-sm sm:text-base">Take a daily progress photo</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/20">
                        <div className="flex items-center space-x-3 mb-3">
                            <AlertTriangle className="w-6 h-6 text-red-400" />
                            <h3 className="text-white font-semibold text-base sm:text-lg">Important Rule</h3>
                        </div>
                        <p className="text-red-200 text-sm sm:text-base">
                            If you miss ANY task on ANY day, you must restart from Day 1. No exceptions, no excuses.
                        </p>
                    </div>

                    <div className="space-y-3 sm:space-y-4">
                        <div className="space-y-2">
                            <input
                                type="text"
                                placeholder="Enter your name"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm sm:text-base"
                            />
                        </div>
                        <div className="space-y-2">
                            <button
                                onClick={handleStartChallenge}
                                disabled={!userName.trim()}
                                className="w-full py-2 sm:py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base"
                            >
                                <Play className="w-4 h-4 sm:w-5 sm:h-5 inline mr-2" />
                                Start 75 Hard Challenge
                            </button>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/30"></div>
                            </div>
                            <div className="relative flex justify-center">
                                <span className="px-3 bg-transparent text-white/80 text-sm">or</span>
                            </div>
                        </div>
                        <button
                            onClick={handleGoogleSignIn}
                            className="w-full py-2 sm:py-3 bg-white text-gray-800 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base"
                        >
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 inline mr-2" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Continue with Google
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
                {/* Sync Status Indicator */}
                {syncStatus && (
                    <div className={`fixed top-4 left-4 z-40 flex items-center space-x-2 px-3 py-2 rounded-lg text-sm ${syncStatus.isOnline
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                        }`}>
                        {syncStatus.isOnline ? (
                            <Wifi className="w-4 h-4" />
                        ) : (
                            <WifiOff className="w-4 h-4" />
                        )}
                        <span>
                            {syncStatus.isOnline
                                ? syncStatus.pendingChanges > 0
                                    ? `Syncing ${syncStatus.pendingChanges} changes...`
                                    : 'Synced'
                                : 'Offline'
                            }
                        </span>
                    </div>
                )}

                {/* Header */}
                <Header onShowSettings={handleShowSettings} />

                {/* Main Content */}
                <div className="max-w-4xl mx-auto px-4 py-3 pb-20">
                    {/* Views */}
                    {currentView === 'home' && (
                        <div className="space-y-6">
                            {/* Progress Overview - Only on Home page */}
                            <ProgressOverview
                                currentDay={currentDay}
                                progressPercentage={progressPercentage}
                                isActive={!!isActive}
                                completedTasks={taskCompletions}
                                customTasks={customTasks}
                                todayProgress={todayProgress}
                            />

                            {/* Task List */}
                            <TaskList
                                customTasks={customTasks}
                                completedTasks={taskCompletions}
                                onToggleTask={handleToggleTask}
                                onDeleteTask={handleDeleteCustomTask}
                                onShowAddTask={() => setShowAddTask(true)}
                                showAddTask={showAddTask}
                                AddTaskForm={
                                    <AddTaskForm
                                        newTaskText={newTaskText}
                                        onTextChange={setNewTaskText}
                                        onSubmit={handleAddCustomTask}
                                        onCancel={() => {
                                            setShowAddTask(false);
                                            setNewTaskText('');
                                        }}
                                    />
                                }
                                getTaskDisplay={getTaskDisplay}
                                getCelebrationContent={getCelebrationContent}
                                formatCompletionTime={formatCompletionTime}
                            />
                        </div>
                    )}

                    {currentView === 'calendar' && challengeSettings && (
                        <Calendar
                            challengeStartDate={challengeSettings.startDate}
                            currentDay={currentDay}
                            customTasks={customTasks}
                        />
                    )}

                    {currentView === 'stats' && challengeSettings && (
                        <Stats
                            challengeStartDate={challengeSettings.startDate}
                            currentDay={currentDay}
                            customTasks={customTasks}
                        />
                    )}

                    {currentView === 'community' && (
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 text-center">
                            <Users className="w-12 h-12 text-white/60 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-white mb-2">Community</h3>
                            <p className="text-white/70">Coming Soon - Connect with other challengers</p>
                        </div>
                    )}
                </div>

                {/* Bottom Navigation */}
                <BottomNavigation
                    currentView={currentView}
                    onNavigate={handleNavigation}
                />

                {/* Settings Modal */}
                {showSettings && (
                    <SettingsModal
                        userProfile={userProfile}
                        onClose={() => setShowSettings(false)}
                        onRestartChallenge={() => setShowRestartConfirm(true)}
                        onClearData={() => setShowClearDataConfirm(true)}
                        onUpdateProfile={(name) => {
                            // Handle profile update
                            console.log('Update profile:', name);
                        }}
                    />
                )}

                {/* Confirmation Modals */}
                {showRestartConfirm && (
                    <ConfirmationModal
                        title="Restart Challenge"
                        message="Are you sure you want to restart your 75 Hard Challenge? This will reset your progress and start from Day 1."
                        onConfirm={handleRestartChallenge}
                        onCancel={() => setShowRestartConfirm(false)}
                        confirmText="Restart"
                        cancelText="Cancel"
                        isDestructive={true}
                    />
                )}

                {showClearDataConfirm && (
                    <ConfirmationModal
                        title="Clear All Data"
                        message="Are you sure you want to clear all your data? This action cannot be undone."
                        onConfirm={handleClearAllData}
                        onCancel={() => setShowClearDataConfirm(false)}
                        confirmText="Clear Data"
                        cancelText="Cancel"
                        isDestructive={true}
                    />
                )}
            </div>

            {/* Notifications */}
            <ErrorNotification
                error={currentError}
                onClose={() => setCurrentError(null)}
            />

            <SuccessNotification
                message={successMessage}
                isVisible={!!successMessage}
                onClose={() => setSuccessMessage('')}
            />

            <LoadingNotification
                message={loadingMessage}
                isVisible={!!loadingMessage}
            />
        </>
    );
} 