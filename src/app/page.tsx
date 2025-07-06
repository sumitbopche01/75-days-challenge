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
import Header from '@/components/Header';
import ProgressOverview from '@/components/ProgressOverview';
import TaskList from '@/components/TaskList';
import AddTaskForm from '@/components/AddTaskForm';
import BottomNavigation from '@/components/BottomNavigation';
import SettingsModal from '@/components/SettingsModal';
import ConfirmationModal from '@/components/ConfirmationModal';
import { useSession, signIn } from 'next-auth/react';
import { apiClient } from '@/lib/api-client';
import { DatabaseCustomTask } from '@/types/database';

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
    const [customTasks, setCustomTasks] = useState<DatabaseCustomTask[]>([]);
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

    const { data: session, status } = useSession();

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

        const initialize = async () => {
            try {
                // Check if user is authenticated
                if (session?.user?.email) {
                    console.log('✅ User authenticated, loading from API');

                    // Try to get user profile from API
                    try {
                        const { user } = await apiClient.getProfile();
                        if (user) {
                            setUserProfile({
                                id: user.id,
                                name: user.name,
                                email: user.email,
                                createdAt: user.created_at,
                            });

                            // Load user's custom tasks
                            const { tasks } = await apiClient.getTasks();
                            if (tasks.length > 0) {
                                setCustomTasks(tasks);
                            } else {
                                // Initialize default tasks for new user
                                console.log('📝 No tasks found, creating defaults');
                                const { tasks: defaultTasks } = await apiClient.initializeDefaultTasks(DEFAULT_TASKS);
                                setCustomTasks(defaultTasks);
                            }

                            // Load challenge data
                            const { challenges } = await apiClient.getChallenges();
                            const activeChallenge = challenges.find(c => c.is_active);
                            if (activeChallenge) {
                                setChallengeSettings({
                                    id: activeChallenge.id,
                                    startDate: activeChallenge.start_date,
                                    endDate: activeChallenge.end_date,
                                    isActive: activeChallenge.is_active,
                                    currentDay: activeChallenge.current_day,
                                });
                            }

                            console.log('✅ User data loaded from API');
                        } else {
                            console.log('❌ No user profile found');
                            setShowSetup(true);
                        }
                    } catch (error) {
                        console.log('❌ Error loading user data, showing setup:', error);
                        setShowSetup(true);
                    }
                } else {
                    // Fallback to localStorage for non-authenticated users
                    console.log('⚠️ No session, checking localStorage');
                    const profile = localStorage.getItem('user_profile');
                    const storedTasks = localStorage.getItem('custom_tasks');
                    const storedCompleted = localStorage.getItem('completed_tasks');

                    if (storedTasks) {
                        const parsedTasks = JSON.parse(storedTasks);
                        if (Array.isArray(parsedTasks) && parsedTasks.length > 0) {
                            // Convert string array to DatabaseCustomTask format for backward compatibility
                            const formattedTasks = parsedTasks.map((task, index) => ({
                                id: `local-${index}`,
                                user_id: 'local',
                                task_text: typeof task === 'string' ? task : task.task_text,
                                is_default: true,
                                order_index: index,
                                created_at: new Date().toISOString(),
                                updated_at: new Date().toISOString(),
                            }));
                            setCustomTasks(formattedTasks);
                        } else {
                            const formattedDefaults = DEFAULT_TASKS.map((task, index) => ({
                                id: `default-${index}`,
                                user_id: 'local',
                                task_text: task,
                                is_default: true,
                                order_index: index,
                                created_at: new Date().toISOString(),
                                updated_at: new Date().toISOString(),
                            }));
                            setCustomTasks(formattedDefaults);
                            localStorage.setItem('custom_tasks', JSON.stringify(DEFAULT_TASKS));
                        }
                    } else {
                        const formattedDefaults = DEFAULT_TASKS.map((task, index) => ({
                            id: `default-${index}`,
                            user_id: 'local',
                            task_text: task,
                            is_default: true,
                            order_index: index,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                        }));
                        setCustomTasks(formattedDefaults);
                        localStorage.setItem('custom_tasks', JSON.stringify(DEFAULT_TASKS));
                    }

                    if (storedCompleted) {
                        const completed = JSON.parse(storedCompleted);
                        const lastReset = localStorage.getItem('last_reset_date');
                        const today = new Date().toDateString();

                        if (lastReset !== today) {
                            setCompletedTasks({});
                            localStorage.setItem('completed_tasks', JSON.stringify({}));
                            localStorage.setItem('last_reset_date', today);
                        } else {
                            setCompletedTasks(completed);
                        }
                    } else {
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
                }
            } catch (error) {
                console.error('💥 Error during initialization:', error);
                setShowSetup(true);
            }

            setIsLoading(false);
            console.log('🏁 Initialization complete');
        };

        initialize();
    }, [session]);

    // Debug effect to monitor customTasks changes
    useEffect(() => {
        console.log('📝 CustomTasks updated:', customTasks.length, customTasks);
    }, [customTasks]);

    // Force load defaults if we're loaded but have no tasks
    useEffect(() => {
        if (!isLoading && userProfile && customTasks.length === 0) {
            console.log('🔥 Force loading default tasks for existing user');
            setCustomTasks(DEFAULT_TASKS.map((task, index) => ({
                id: `default-${index}`,
                user_id: 'local',
                task_text: task,
                is_default: true,
                order_index: index,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })));
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
            setCustomTasks(DEFAULT_TASKS.map((task, index) => ({
                id: `default-${index}`,
                user_id: 'local',
                task_text: task,
                is_default: true,
                order_index: index,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })));
            localStorage.setItem('custom_tasks', JSON.stringify(DEFAULT_TASKS));
        }

        setUserProfile(profile);
        setChallengeSettings(settings);
        setTodayProgress(dayProgress);
        setShowSetup(false);
    };

    const handleGoogleSignIn = () => {
        signIn('google');
    };

    // Auto-start challenge when user signs in with Google
    useEffect(() => {
        if (session?.user?.name && session?.user?.email && !userProfile) {
            const createUserAndChallenge = async () => {
                try {
                    // Create user profile via API
                    const { user } = await apiClient.createProfile({
                        name: session.user?.name!,
                        google_id: session.user?.email!, // Use email as google_id since session.user.id doesn't exist
                        avatar_url: session.user?.image || undefined,
                    });

                    // Create challenge via API
                    const { challenge } = await apiClient.createChallenge({
                        start_date: new Date().toISOString().split('T')[0],
                    });

                    // Initialize default tasks
                    const { tasks } = await apiClient.initializeDefaultTasks(DEFAULT_TASKS);

                    // Update local state
                    setUserProfile({
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        createdAt: user.created_at,
                    });

                    setChallengeSettings({
                        id: challenge.id,
                        startDate: challenge.start_date,
                        endDate: challenge.end_date,
                        isActive: challenge.is_active,
                        currentDay: challenge.current_day,
                    });

                    setCustomTasks(tasks);
                    setShowSetup(false);
                } catch (error) {
                    console.error('Failed to create user and challenge:', error);
                    // Fallback to localStorage approach
                    const profile = ChallengeStorage.createDefaultProfile(session.user?.name!);
                    const settings = ChallengeStorage.initializeChallenge();
                    const today = dateUtils.toISOString(new Date());
                    const dayProgress = ChallengeStorage.createDayProgress(today, 1);

                    if (customTasks.length === 0) {
                        const formattedDefaults = DEFAULT_TASKS.map((task, index) => ({
                            id: `default-${index}`,
                            user_id: 'local',
                            task_text: task,
                            is_default: true,
                            order_index: index,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                        }));
                        setCustomTasks(formattedDefaults);
                        localStorage.setItem('custom_tasks', JSON.stringify(DEFAULT_TASKS));
                    }

                    setUserProfile(profile);
                    setChallengeSettings(settings);
                    setTodayProgress(dayProgress);
                    setShowSetup(false);
                }
            };

            createUserAndChallenge();
        }
    }, [session, userProfile]);

    const handleAddCustomTask = async () => {
        if (!newTaskText.trim()) return;

        try {
            if (session?.user?.email) {
                // Add task via API
                const { task } = await apiClient.createTask({
                    task_text: newTaskText.trim(),
                    is_default: false,
                });
                setCustomTasks(prev => [...prev, task]);
            } else {
                // Fallback to localStorage
                const newTask = {
                    id: `local-${Date.now()}`,
                    user_id: 'local',
                    task_text: newTaskText.trim(),
                    is_default: false,
                    order_index: customTasks.length,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                };
                const updatedTasks = [...customTasks, newTask];
                setCustomTasks(updatedTasks);
                localStorage.setItem('custom_tasks', JSON.stringify(updatedTasks.map(t => t.task_text)));
            }

            setNewTaskText('');
            setShowAddTask(false);
        } catch (error) {
            console.error('Failed to add task:', error);
            alert('Failed to add task. Please try again.');
        }
    };

    const handleDeleteCustomTask = async (index: number) => {
        try {
            const taskToDelete = customTasks[index];

            if (session?.user?.email && !taskToDelete.id.startsWith('local-')) {
                // Delete task via API
                await apiClient.deleteTask({ task_id: taskToDelete.id });
            } else {
                // Update localStorage
                const updatedTasks = customTasks.filter((_, i) => i !== index);
                localStorage.setItem('custom_tasks', JSON.stringify(updatedTasks.map(t => t.task_text)));
            }

            // Update local state
            const updatedTasks = customTasks.filter((_, i) => i !== index);
            setCustomTasks(updatedTasks);

            // Also remove from completed tasks
            const updatedCompleted = { ...completedTasks };
            delete updatedCompleted[taskToDelete.task_text];
            setCompletedTasks(updatedCompleted);
            localStorage.setItem('completed_tasks', JSON.stringify(updatedCompleted));
        } catch (error) {
            console.error('Failed to delete task:', error);
            alert('Failed to delete task. Please try again.');
        }
    };

    const handleToggleTask = (taskName: string) => {
        const isCurrentlyCompleted = completedTasks[taskName];
        const updatedCompleted = {
            ...completedTasks,
            [taskName]: !isCurrentlyCompleted ? new Date().toISOString() : false
        };
        setCompletedTasks(updatedCompleted);
        localStorage.setItem('completed_tasks', JSON.stringify(updatedCompleted));

        // TODO: In the future, this should also save to the API for authenticated users
        // For now, we'll keep using localStorage for task completion tracking
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
                                    Choose how you'd like to begin your 75 Hard journey
                                </p>
                            </div>

                            {/* Google Sign In Button */}
                            <div className="space-y-3">
                                <button
                                    onClick={handleGoogleSignIn}
                                    disabled={status === 'loading'}
                                    className="w-full flex items-center justify-center px-4 py-3 sm:px-6 sm:py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-lg sm:rounded-xl hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold text-sm sm:text-base shadow-md hover:shadow-lg"
                                >
                                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                    {status === 'loading' ? 'Loading...' : 'Continue with Google'}
                                </button>

                                {/* Divider */}
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-300"></div>
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-2 bg-white text-gray-500">or enter manually</span>
                                    </div>
                                </div>
                            </div>

                            {/* Manual Name Entry */}
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
                <Header onShowSettings={handleShowSettings} />

                {/* Main Content */}
                <div className="max-w-4xl mx-auto px-4 py-3 pb-20">
                    {/* Progress Overview */}
                    <ProgressOverview
                        currentDay={currentDay}
                        progressPercentage={progressPercentage}
                        isActive={!!isActive}
                        completedTasks={completedTasks}
                        customTasks={customTasks}
                        todayProgress={todayProgress}
                    />

                    {/* Views */}
                    {currentView === 'home' && (
                        <TaskList
                            customTasks={customTasks}
                            completedTasks={completedTasks}
                            onToggleTask={handleToggleTask}
                            onDeleteTask={handleDeleteCustomTask}
                            onShowAddTask={() => setShowAddTask(true)}
                            showAddTask={showAddTask}
                            AddTaskForm={
                                <AddTaskForm
                                    newTaskText={newTaskText}
                                    onChangeNewTaskText={(e) => setNewTaskText(e.target.value)}
                                    onAddCustomTask={handleAddCustomTask}
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
                    )}
                    {currentView === 'calendar' && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Challenge Calendar</h2>
                            <p className="text-gray-600">Calendar view coming soon...</p>
                        </div>
                    )}
                    {currentView === 'stats' && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Statistics</h2>
                            <p className="text-gray-600">Statistics view coming soon...</p>
                        </div>
                    )}
                    {currentView === 'community' && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Community</h2>
                            <p className="text-gray-600">Community features coming soon...</p>
                        </div>
                    )}
                </div>

                {/* Bottom Navigation */}
                <BottomNavigation currentView={currentView} onNavigate={handleNavigation} />
            </div>

            {/* Settings Modal */}
            <SettingsModal
                show={showSettings}
                onClose={() => setShowSettings(false)}
                editingProfile={editingProfile}
                editName={editName}
                onEditNameChange={(e) => setEditName(e.target.value)}
                onSaveProfile={handleSaveProfile}
                onEditProfile={() => setEditingProfile(true)}
                userProfile={userProfile}
                handleExportData={handleExportData}
                handleImportData={handleImportData}
                onShowRestartConfirm={() => setShowRestartConfirm(true)}
                onShowClearDataConfirm={() => setShowClearDataConfirm(true)}
            />

            {/* Restart Confirmation Modal */}
            <ConfirmationModal
                show={showRestartConfirm}
                onClose={() => setShowRestartConfirm(false)}
                onConfirm={handleRestartChallenge}
                title="Restart Challenge?"
                description="This will reset your progress and start the challenge from Day 1. Your profile and tasks will be preserved."
                confirmLabel="Restart Challenge"
                confirmColor="bg-yellow-600"
                icon={<AlertTriangle className="w-6 h-6 text-yellow-600" />}
            />

            {/* Clear Data Confirmation Modal */}
            <ConfirmationModal
                show={showClearDataConfirm}
                onClose={() => setShowClearDataConfirm(false)}
                onConfirm={handleClearAllData}
                title="Clear All Data?"
                description="This will permanently delete all your data including progress, profile, and custom tasks. This action cannot be undone."
                confirmLabel="Clear All Data"
                confirmColor="bg-red-600"
                icon={<AlertTriangle className="w-6 h-6 text-red-600" />}
            />
        </>
    );
} 