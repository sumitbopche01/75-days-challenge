// src/components/BottomNavigation.tsx
// BottomNavigation component: Renders the bottom navigation bar for switching views.
import React from 'react';
import { Trophy, Calendar, BarChart3, Users } from 'lucide-react';

interface BottomNavigationProps {
    currentView: 'home' | 'calendar' | 'stats' | 'community';
    onNavigate: (view: 'home' | 'calendar' | 'stats' | 'community') => void;
}

const navItems = [
    { id: 'home', icon: Trophy, label: 'Home' },
    { id: 'calendar', icon: Calendar, label: 'Calendar' },
    { id: 'stats', icon: BarChart3, label: 'Stats' },
    { id: 'community', icon: Users, label: 'Community' },
];

const BottomNavigation: React.FC<BottomNavigationProps> = ({ currentView, onNavigate }) => (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-bottom z-40">
        <div className="max-w-4xl mx-auto px-4">
            <div className="flex justify-around py-2">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onNavigate(item.id as any)}
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
);

export default BottomNavigation; 