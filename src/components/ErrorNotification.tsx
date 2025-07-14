// src/components/ErrorNotification.tsx
// Component for displaying user-friendly error notifications

import React, { useEffect, useState } from 'react';
import { X, AlertCircle, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { AppError } from '@/lib/error-handler';

interface ErrorNotificationProps {
    error: AppError | null;
    onClose: () => void;
    autoClose?: boolean;
    autoCloseDelay?: number;
}

const ErrorNotification: React.FC<ErrorNotificationProps> = ({
    error,
    onClose,
    autoClose = true,
    autoCloseDelay = 5000
}) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (error) {
            setIsVisible(true);

            if (autoClose && error.severity !== 'critical') {
                const timer = setTimeout(() => {
                    handleClose();
                }, autoCloseDelay);

                return () => clearTimeout(timer);
            }
        }
    }, [error, autoClose, autoCloseDelay]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => {
            onClose();
        }, 300); // Wait for animation to complete
    };

    if (!error) return null;

    const getNotificationStyle = () => {
        switch (error.severity) {
            case 'critical':
                return {
                    bgColor: 'bg-red-50',
                    borderColor: 'border-red-200',
                    textColor: 'text-red-800',
                    iconColor: 'text-red-600',
                    buttonColor: 'text-red-600 hover:bg-red-100',
                    icon: AlertCircle
                };
            case 'high':
                return {
                    bgColor: 'bg-orange-50',
                    borderColor: 'border-orange-200',
                    textColor: 'text-orange-800',
                    iconColor: 'text-orange-600',
                    buttonColor: 'text-orange-600 hover:bg-orange-100',
                    icon: AlertTriangle
                };
            case 'medium':
                return {
                    bgColor: 'bg-yellow-50',
                    borderColor: 'border-yellow-200',
                    textColor: 'text-yellow-800',
                    iconColor: 'text-yellow-600',
                    buttonColor: 'text-yellow-600 hover:bg-yellow-100',
                    icon: AlertTriangle
                };
            case 'low':
                return {
                    bgColor: 'bg-blue-50',
                    borderColor: 'border-blue-200',
                    textColor: 'text-blue-800',
                    iconColor: 'text-blue-600',
                    buttonColor: 'text-blue-600 hover:bg-blue-100',
                    icon: Info
                };
            default:
                return {
                    bgColor: 'bg-gray-50',
                    borderColor: 'border-gray-200',
                    textColor: 'text-gray-800',
                    iconColor: 'text-gray-600',
                    buttonColor: 'text-gray-600 hover:bg-gray-100',
                    icon: Info
                };
        }
    };

    const style = getNotificationStyle();
    const Icon = style.icon;

    return (
        <div className={`fixed top-4 right-4 z-50 max-w-md w-full transition-all duration-300 transform ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
            }`}>
            <div className={`${style.bgColor} ${style.borderColor} border rounded-lg shadow-lg p-4`}>
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        <Icon className={`w-5 h-5 ${style.iconColor}`} />
                    </div>
                    <div className="ml-3 flex-1">
                        <h3 className={`text-sm font-medium ${style.textColor}`}>
                            {error.severity === 'critical' ? 'Critical Error' :
                                error.severity === 'high' ? 'Error' :
                                    error.severity === 'medium' ? 'Warning' :
                                        'Notice'}
                        </h3>
                        <p className={`mt-1 text-sm ${style.textColor} opacity-90`}>
                            {error.userMessage}
                        </p>
                        {error.severity === 'critical' && (
                            <div className="mt-2">
                                <button
                                    onClick={() => window.location.reload()}
                                    className="text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors"
                                >
                                    Reload Page
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="ml-4 flex-shrink-0">
                        <button
                            onClick={handleClose}
                            className={`inline-flex rounded-md p-1.5 transition-colors ${style.buttonColor}`}
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ErrorNotification;

// Success notification variant
interface SuccessNotificationProps {
    message: string;
    isVisible: boolean;
    onClose: () => void;
    autoClose?: boolean;
    autoCloseDelay?: number;
}

export const SuccessNotification: React.FC<SuccessNotificationProps> = ({
    message,
    isVisible,
    onClose,
    autoClose = true,
    autoCloseDelay = 3000
}) => {
    useEffect(() => {
        if (isVisible && autoClose) {
            const timer = setTimeout(() => {
                onClose();
            }, autoCloseDelay);

            return () => clearTimeout(timer);
        }
    }, [isVisible, autoClose, autoCloseDelay, onClose]);

    return (
        <div className={`fixed top-4 right-4 z-50 max-w-md w-full transition-all duration-300 transform ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
            }`}>
            <div className="bg-green-50 border border-green-200 rounded-lg shadow-lg p-4">
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="ml-3 flex-1">
                        <h3 className="text-sm font-medium text-green-800">Success</h3>
                        <p className="mt-1 text-sm text-green-800 opacity-90">
                            {message}
                        </p>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                        <button
                            onClick={onClose}
                            className="inline-flex rounded-md p-1.5 text-green-600 hover:bg-green-100 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Loading notification variant
interface LoadingNotificationProps {
    message: string;
    isVisible: boolean;
}

export const LoadingNotification: React.FC<LoadingNotificationProps> = ({
    message,
    isVisible
}) => {
    return (
        <div className={`fixed top-4 right-4 z-50 max-w-md w-full transition-all duration-300 transform ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
            }`}>
            <div className="bg-blue-50 border border-blue-200 rounded-lg shadow-lg p-4">
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <div className="ml-3 flex-1">
                        <h3 className="text-sm font-medium text-blue-800">Loading</h3>
                        <p className="mt-1 text-sm text-blue-800 opacity-90">
                            {message}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}; 