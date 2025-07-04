/**
 * Challenge Templates Library
 * Predefined challenges that users can select and customize for their personal 75 Hard journey
 */

import { ChallengeTemplate } from '@/types/challenge';

// 💪 FITNESS & MOVEMENT CHALLENGES
export const fitnessTemplates: ChallengeTemplate[] = [
    {
        id: 'workout-45min',
        name: '45-Minute Workout',
        description: 'Complete a 45-minute workout session',
        category: 'fitness',
        type: 'duration',
        defaultTarget: 45,
        unit: 'minutes',
        icon: '💪',
        color: '#ef4444',
        tips: [
            'Mix cardio and strength training',
            'Track your workouts for consistency',
            'Progressive overload for better results'
        ]
    },
    {
        id: 'outdoor-workout',
        name: 'Outdoor Workout',
        description: 'Exercise outdoors regardless of weather',
        category: 'fitness',
        type: 'boolean',
        icon: '🏃',
        color: '#22c55e',
        tips: [
            'Running, walking, cycling, or sports',
            'Fresh air boosts mental health',
            'Weather resistance builds mental toughness'
        ]
    },
    {
        id: 'daily-steps',
        name: 'Daily Steps',
        description: 'Walk a target number of steps each day',
        category: 'fitness',
        type: 'quantity',
        defaultTarget: 10000,
        unit: 'steps',
        icon: '👟',
        color: '#3b82f6',
        tips: [
            'Use a fitness tracker or phone app',
            'Take stairs instead of elevators',
            'Park farther away for extra steps'
        ]
    },
    {
        id: 'strength-training',
        name: 'Strength Training',
        description: 'Complete a strength/resistance workout',
        category: 'fitness',
        type: 'boolean',
        icon: '🏋️',
        color: '#dc2626',
        tips: [
            'Focus on compound movements',
            'Progressive overload each week',
            'Rest between sets is important'
        ]
    },
    {
        id: 'yoga-stretching',
        name: 'Yoga or Stretching',
        description: 'Practice yoga or stretching for flexibility',
        category: 'fitness',
        type: 'duration',
        defaultTarget: 20,
        unit: 'minutes',
        icon: '🧘',
        color: '#8b5cf6',
        tips: [
            'Improves flexibility and recovery',
            'Great for stress relief',
            'Can be done anywhere'
        ]
    }
];

// 🥗 NUTRITION & HEALTH CHALLENGES
export const nutritionTemplates: ChallengeTemplate[] = [
    {
        id: 'follow-diet',
        name: 'Follow Diet Plan',
        description: 'Stick to your chosen diet with no cheat meals',
        category: 'nutrition',
        type: 'boolean',
        icon: '🥗',
        color: '#22c55e',
        tips: [
            'Plan meals in advance',
            'Remove tempting foods from home',
            'Focus on whole, unprocessed foods'
        ]
    },
    {
        id: 'drink-water',
        name: 'Drink Water',
        description: 'Stay hydrated with daily water intake',
        category: 'nutrition',
        type: 'quantity',
        defaultTarget: 128,
        unit: 'oz',
        icon: '💧',
        color: '#06b6d4',
        tips: [
            '1 gallon = 128 oz = 3.8 liters',
            'Carry a water bottle everywhere',
            'Start your day with a big glass'
        ]
    },
    {
        id: 'no-alcohol',
        name: 'No Alcohol',
        description: 'Avoid alcohol completely',
        category: 'nutrition',
        type: 'avoidance',
        icon: '🚫🍺',
        color: '#f59e0b',
        tips: [
            'Better sleep and recovery',
            'Improved mental clarity',
            'Support your fitness goals'
        ]
    },
    {
        id: 'no-junk-food',
        name: 'No Junk Food',
        description: 'Avoid processed and junk foods',
        category: 'nutrition',
        type: 'avoidance',
        icon: '🚫🍟',
        color: '#f59e0b',
        tips: [
            'Read ingredient labels carefully',
            'Prepare healthy snacks in advance',
            'Focus on whole foods'
        ]
    },
    {
        id: 'take-vitamins',
        name: 'Take Vitamins',
        description: 'Take your daily vitamins/supplements',
        category: 'nutrition',
        type: 'boolean',
        icon: '💊',
        color: '#10b981',
        tips: [
            'Set a daily reminder',
            'Take with food for better absorption',
            'Consult healthcare provider for advice'
        ]
    }
];

// 🧠 MENTAL & MINDFULNESS CHALLENGES
export const mentalTemplates: ChallengeTemplate[] = [
    {
        id: 'read-books',
        name: 'Read Non-Fiction',
        description: 'Read pages from a non-fiction, self-development book',
        category: 'mental',
        type: 'quantity',
        defaultTarget: 10,
        unit: 'pages',
        icon: '📚',
        color: '#7c3aed',
        tips: [
            'Choose books that inspire growth',
            'Take notes on key insights',
            'Apply what you learn'
        ]
    },
    {
        id: 'meditation',
        name: 'Meditation',
        description: 'Practice mindfulness or meditation',
        category: 'mental',
        type: 'duration',
        defaultTarget: 10,
        unit: 'minutes',
        icon: '🧘‍♀️',
        color: '#06b6d4',
        tips: [
            'Start with guided meditations',
            'Focus on breath awareness',
            'Consistency matters more than duration'
        ]
    },
    {
        id: 'journaling',
        name: 'Journaling',
        description: 'Write in a personal journal or diary',
        category: 'mental',
        type: 'boolean',
        icon: '📝',
        color: '#f59e0b',
        tips: [
            'Reflect on your day and progress',
            'Express gratitude and goals',
            'Process emotions and thoughts'
        ]
    },
    {
        id: 'gratitude-practice',
        name: 'Gratitude Practice',
        description: 'Write down things you\'re grateful for',
        category: 'mental',
        type: 'quantity',
        defaultTarget: 3,
        unit: 'items',
        icon: '🙏',
        color: '#f59e0b',
        tips: [
            'Be specific about what you\'re grateful for',
            'Include big and small things',
            'Feel the emotion behind the gratitude'
        ]
    },
    {
        id: 'learning-skill',
        name: 'Learn New Skill',
        description: 'Practice or study a new skill',
        category: 'mental',
        type: 'duration',
        defaultTarget: 30,
        unit: 'minutes',
        icon: '🎯',
        color: '#8b5cf6',
        tips: [
            'Choose something you\'re passionate about',
            'Break complex skills into smaller parts',
            'Practice deliberately and consistently'
        ]
    }
];

// ⚡ PRODUCTIVITY & HABITS CHALLENGES
export const productivityTemplates: ChallengeTemplate[] = [
    {
        id: 'no-social-media',
        name: 'No Social Media',
        description: 'Avoid social media platforms',
        category: 'productivity',
        type: 'avoidance',
        icon: '🚫📱',
        color: '#ef4444',
        tips: [
            'Remove apps from your phone',
            'Use website blockers',
            'Replace scrolling with productive activities'
        ]
    },
    {
        id: 'wake-up-early',
        name: 'Wake Up Early',
        description: 'Wake up at a specific early time',
        category: 'productivity',
        type: 'boolean',
        icon: '⏰',
        color: '#f59e0b',
        tips: [
            'Go to bed earlier',
            'Create a morning routine',
            'Use natural light to wake up'
        ]
    },
    {
        id: 'cold-shower',
        name: 'Cold Shower',
        description: 'Take a cold shower for mental toughness',
        category: 'productivity',
        type: 'duration',
        defaultTarget: 2,
        unit: 'minutes',
        icon: '🚿',
        color: '#06b6d4',
        tips: [
            'Start with 30 seconds and build up',
            'Breathe deeply during the cold',
            'Builds discipline and resilience'
        ]
    },
    {
        id: 'make-bed',
        name: 'Make Your Bed',
        description: 'Make your bed every morning',
        category: 'productivity',
        type: 'boolean',
        icon: '🛏️',
        color: '#84cc16',
        tips: [
            'Start your day with an accomplishment',
            'Creates order and discipline',
            'Takes less than 2 minutes'
        ]
    },
    {
        id: 'plan-tomorrow',
        name: 'Plan Tomorrow',
        description: 'Plan the next day before going to bed',
        category: 'productivity',
        type: 'boolean',
        icon: '📋',
        color: '#3b82f6',
        tips: [
            'Write down 3 priority tasks',
            'Review your calendar',
            'Visualize a successful day'
        ]
    }
];

// 📚 LEARNING & GROWTH CHALLENGES  
export const learningTemplates: ChallengeTemplate[] = [
    {
        id: 'language-practice',
        name: 'Language Practice',
        description: 'Practice a foreign language',
        category: 'learning',
        type: 'duration',
        defaultTarget: 15,
        unit: 'minutes',
        icon: '🗣️',
        color: '#8b5cf6',
        tips: [
            'Use language learning apps',
            'Practice speaking out loud',
            'Watch content in target language'
        ]
    },
    {
        id: 'creative-work',
        name: 'Creative Work',
        description: 'Work on a creative project or hobby',
        category: 'learning',
        type: 'duration',
        defaultTarget: 30,
        unit: 'minutes',
        icon: '🎨',
        color: '#ec4899',
        tips: [
            'Art, music, writing, crafts',
            'Focus on process over perfection',
            'Express yourself authentically'
        ]
    },
    {
        id: 'listen-podcast',
        name: 'Educational Podcast',
        description: 'Listen to educational or self-improvement content',
        category: 'learning',
        type: 'duration',
        defaultTarget: 20,
        unit: 'minutes',
        icon: '🎧',
        color: '#6366f1',
        tips: [
            'Choose podcasts aligned with your goals',
            'Take notes on key insights',
            'Listen during commute or exercise'
        ]
    },
    {
        id: 'practice-instrument',
        name: 'Practice Instrument',
        description: 'Practice playing a musical instrument',
        category: 'learning',
        type: 'duration',
        defaultTarget: 30,
        unit: 'minutes',
        icon: '🎵',
        color: '#14b8a6',
        tips: [
            'Start with scales and basics',
            'Practice regularly, even if briefly',
            'Record yourself to track progress'
        ]
    }
];

// 📸 TRACKING & ACCOUNTABILITY CHALLENGES
export const trackingTemplates: ChallengeTemplate[] = [
    {
        id: 'progress-photo',
        name: 'Progress Photo',
        description: 'Take a daily progress photo',
        category: 'fitness',
        type: 'boolean',
        icon: '📸',
        color: '#f59e0b',
        tips: [
            'Same time, same pose, same lighting',
            'Shows physical and mental transformation',
            'Powerful motivation tool'
        ]
    },
    {
        id: 'weigh-yourself',
        name: 'Weigh Yourself',
        description: 'Track your weight daily',
        category: 'fitness',
        type: 'boolean',
        icon: '⚖️',
        color: '#6b7280',
        tips: [
            'Same time each day (morning is best)',
            'Weight fluctuates naturally',
            'Focus on trends, not daily changes'
        ]
    }
];

// Combine all templates
export const allChallengeTemplates: ChallengeTemplate[] = [
    ...fitnessTemplates,
    ...nutritionTemplates,
    ...mentalTemplates,
    ...productivityTemplates,
    ...learningTemplates,
    ...trackingTemplates,
];

// Helper functions
export const getChallengeTemplatesByCategory = (category: ChallengeTemplate['category']) => {
    return allChallengeTemplates.filter(template => template.category === category);
};

export const getChallengeTemplateById = (id: string) => {
    return allChallengeTemplates.find(template => template.id === id);
};

export const getPopularChallenges = (): ChallengeTemplate[] => {
    // Return commonly chosen challenges for quick setup
    return [
        getChallengeTemplateById('workout-45min'),
        getChallengeTemplateById('outdoor-workout'),
        getChallengeTemplateById('follow-diet'),
        getChallengeTemplateById('drink-water'),
        getChallengeTemplateById('read-books'),
        getChallengeTemplateById('progress-photo'),
    ].filter(Boolean) as ChallengeTemplate[];
};

export const getClassic75Hard = (): ChallengeTemplate[] => {
    // Original 75 Hard challenge setup
    return [
        getChallengeTemplateById('follow-diet'),
        getChallengeTemplateById('workout-45min'),
        getChallengeTemplateById('outdoor-workout'),
        getChallengeTemplateById('drink-water'),
        getChallengeTemplateById('read-books'),
        getChallengeTemplateById('progress-photo'),
    ].filter(Boolean) as ChallengeTemplate[];
}; 