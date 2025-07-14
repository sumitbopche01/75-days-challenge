// src/lib/error-handler.ts
// Comprehensive error handling system for the 75 Hard Challenge app

import React from 'react';

export interface AppError {
    code: string;
    message: string;
    userMessage: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    category: 'auth' | 'database' | 'network' | 'validation' | 'configuration' | 'unknown';
    details?: any;
    timestamp: Date;
}

export interface ErrorHandlerOptions {
    showToUser?: boolean;
    logToConsole?: boolean;
    category?: AppError['category'];
    severity?: AppError['severity'];
}

class ErrorHandler {
    private errors: AppError[] = [];
    private maxErrors = 100; // Keep last 100 errors

    /**
     * Handle and categorize errors with user-friendly messages
     */
    handle(error: any, options: ErrorHandlerOptions = {}): AppError {
        const {
            showToUser = true,
            logToConsole = true,
            category = 'unknown',
            severity = 'medium'
        } = options;

        const appError = this.createAppError(error, category, severity);

        // Store error for debugging
        this.addError(appError);

        // Log to console if enabled
        if (logToConsole) {
            this.logError(appError);
        }

        return appError;
    }

    /**
     * Create a structured app error from any error type
     */
    private createAppError(error: any, category: AppError['category'], severity: AppError['severity']): AppError {
        let code = 'UNKNOWN_ERROR';
        let message = 'An unexpected error occurred';
        let userMessage = 'Something went wrong. Please try again.';

        // Handle different error types
        if (error instanceof Error) {
            message = error.message;

            // Categorize based on error message patterns
            if (error.message.includes('Missing') && error.message.includes('environment')) {
                code = 'MISSING_ENV_VAR';
                category = 'configuration';
                severity = 'critical';
                userMessage = 'Application configuration is incomplete. Please check your environment variables.';
            } else if (error.message.includes('fetch')) {
                code = 'NETWORK_ERROR';
                category = 'network';
                severity = 'high';
                userMessage = 'Unable to connect to the server. Please check your internet connection.';
            } else if (error.message.includes('Unauthorized')) {
                code = 'AUTH_ERROR';
                category = 'auth';
                severity = 'medium';
                userMessage = 'Please sign in again to continue.';
            } else if (error.message.includes('Database error')) {
                code = 'DATABASE_ERROR';
                category = 'database';
                severity = 'high';
                userMessage = 'Unable to save your data. Please try again in a moment.';
            } else if (error.message.includes('validation')) {
                code = 'VALIDATION_ERROR';
                category = 'validation';
                severity = 'low';
                userMessage = 'Please check your input and try again.';
            }
        } else if (typeof error === 'string') {
            message = error;
        } else if (error?.error) {
            // API error response
            message = error.error;
            if (error.status === 401) {
                code = 'AUTH_ERROR';
                category = 'auth';
                userMessage = 'Please sign in again to continue.';
            } else if (error.status === 400) {
                code = 'VALIDATION_ERROR';
                category = 'validation';
                severity = 'low';
                userMessage = 'Please check your input and try again.';
            } else if (error.status === 500) {
                code = 'SERVER_ERROR';
                category = 'database';
                severity = 'high';
                userMessage = 'Server error. Please try again in a moment.';
            }
        }

        return {
            code,
            message,
            userMessage,
            severity,
            category,
            details: error,
            timestamp: new Date()
        };
    }

    /**
     * Add error to internal storage
     */
    private addError(error: AppError): void {
        this.errors.unshift(error);
        if (this.errors.length > this.maxErrors) {
            this.errors = this.errors.slice(0, this.maxErrors);
        }
    }

    /**
     * Log error to console with proper formatting
     */
    private logError(error: AppError): void {
        const logLevel = error.severity === 'critical' || error.severity === 'high' ? 'error' : 'warn';

        console[logLevel](`[${error.category.toUpperCase()}] ${error.code}: ${error.message}`, {
            userMessage: error.userMessage,
            severity: error.severity,
            timestamp: error.timestamp,
            details: error.details
        });
    }

    /**
     * Get recent errors for debugging
     */
    getErrors(category?: AppError['category']): AppError[] {
        if (category) {
            return this.errors.filter(error => error.category === category);
        }
        return this.errors;
    }

    /**
     * Clear all stored errors
     */
    clearErrors(): void {
        this.errors = [];
    }

    /**
     * Get error statistics
     */
    getErrorStats(): { [key: string]: number } {
        const stats: { [key: string]: number } = {};

        this.errors.forEach(error => {
            stats[error.category] = (stats[error.category] || 0) + 1;
        });

        return stats;
    }

    /**
     * Check if there are any critical errors
     */
    hasCriticalErrors(): boolean {
        return this.errors.some(error => error.severity === 'critical');
    }

    /**
     * Get user-friendly error message for display
     */
    getUserMessage(error: any): string {
        if (error?.userMessage) {
            return error.userMessage;
        }

        const appError = this.createAppError(error, 'unknown', 'medium');
        return appError.userMessage;
    }
}

// Export singleton instance
export const errorHandler = new ErrorHandler();

// Utility functions for common error scenarios
export const handleApiError = (error: any): AppError => {
    return errorHandler.handle(error, {
        category: 'network',
        severity: 'high',
        showToUser: true
    });
};

export const handleAuthError = (error: any): AppError => {
    return errorHandler.handle(error, {
        category: 'auth',
        severity: 'medium',
        showToUser: true
    });
};

export const handleDatabaseError = (error: any): AppError => {
    return errorHandler.handle(error, {
        category: 'database',
        severity: 'high',
        showToUser: true
    });
};

export const handleValidationError = (error: any): AppError => {
    return errorHandler.handle(error, {
        category: 'validation',
        severity: 'low',
        showToUser: true
    });
};

export const handleConfigurationError = (error: any): AppError => {
    return errorHandler.handle(error, {
        category: 'configuration',
        severity: 'critical',
        showToUser: true
    });
};

// Type guards for error checking
export const isAuthError = (error: AppError): boolean => {
    return error.category === 'auth';
};

export const isDatabaseError = (error: AppError): boolean => {
    return error.category === 'database';
};

export const isNetworkError = (error: AppError): boolean => {
    return error.category === 'network';
};

export const isCriticalError = (error: AppError): boolean => {
    return error.severity === 'critical';
};

// Error boundary helper
export const withErrorBoundary = (component: React.ComponentType<any>) => {
    return class extends React.Component<any, { hasError: boolean; error?: AppError }> {
        constructor(props: any) {
            super(props);
            this.state = { hasError: false };
        }

        static getDerivedStateFromError(error: any): { hasError: boolean; error: AppError } {
            const appError = errorHandler.handle(error, {
                category: 'unknown',
                severity: 'high',
                showToUser: true
            });

            return { hasError: true, error: appError };
        }

        componentDidCatch(error: any, errorInfo: any) {
            errorHandler.handle(error, {
                category: 'unknown',
                severity: 'high',
                showToUser: false
            });
        }

        render() {
            if (this.state.hasError) {
                return (
                    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                            <h1 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h1>
                            <p className="text-gray-600 mb-4">
                                {this.state.error?.userMessage || 'An unexpected error occurred'}
                            </p>
                            <button
                                onClick={() => window.location.reload()}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Reload Page
                            </button>
                        </div>
                    </div>
                );
            }

            return React.createElement(component, this.props);
        }
    };
}; 