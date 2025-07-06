// src/components/Header.tsx
// Header component: Renders the top navigation bar with the app title and settings button.
import React from 'react';
import { Settings, Trophy } from 'lucide-react';

interface HeaderProps {
    onShowSettings: () => void;
}

const Header: React.FC<HeaderProps> = ({ onShowSettings }) => (
    <header className="bg-gradient-to-r from-purple-600/90 to-blue-600/90 backdrop-blur-sm shadow-xl border-b border-white/20 safe-top">
        <div className="max-w-4xl mx-auto px-4">
            <div className="flex justify-between items-center py-4">
                <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                        <Trophy className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white">75 Hard Challenge</h1>
                    </div>
                </div>
                <button
                    onClick={onShowSettings}
                    className="p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
                >
                    <Settings className="w-6 h-6" />
                </button>
            </div>
        </div>
    </header>
);

export default Header; 