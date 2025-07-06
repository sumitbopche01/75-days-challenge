// src/components/ConfirmationModal.tsx
// ConfirmationModal component: Generic modal for confirming actions (restart, clear data, etc.)
import React from 'react';

interface ConfirmationModalProps {
    show: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmLabel: string;
    confirmColor: string; // e.g., 'bg-yellow-600', 'bg-red-600'
    icon: React.ReactNode;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    show,
    onClose,
    onConfirm,
    title,
    description,
    confirmLabel,
    confirmColor,
    icon,
}) => {
    if (!show) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <div className="flex items-center space-x-3 mb-4">
                    {icon}
                    <h2 className="text-lg font-bold text-gray-900">{title}</h2>
                </div>
                <p className="text-gray-600 mb-6">{description}</p>
                <div className="flex space-x-3">
                    <button
                        onClick={onConfirm}
                        className={`flex-1 ${confirmColor} text-white py-2 px-4 rounded-lg hover:opacity-90 transition-colors`}
                    >
                        {confirmLabel}
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal; 