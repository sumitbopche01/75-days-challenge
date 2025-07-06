// src/components/SettingsModal.tsx
// SettingsModal component: Handles the settings modal, including profile editing, data export/import, and challenge actions.
import React from 'react';
import { X, User, Edit, Download, Upload, RotateCcw, Trash2 } from 'lucide-react';

interface SettingsModalProps {
    show: boolean;
    onClose: () => void;
    editingProfile: boolean;
    editName: string;
    onEditNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSaveProfile: () => void;
    onEditProfile: () => void;
    userProfile: { name: string } | null;
    handleExportData: () => void;
    handleImportData: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onShowRestartConfirm: () => void;
    onShowClearDataConfirm: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
    show,
    onClose,
    editingProfile,
    editName,
    onEditNameChange,
    onSaveProfile,
    onEditProfile,
    userProfile,
    handleExportData,
    handleImportData,
    onShowRestartConfirm,
    onShowClearDataConfirm,
}) => {
    if (!show) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 className="text-lg font-bold text-gray-900">Settings</h2>
                    <button
                        onClick={onClose}
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
                                            onChange={onEditNameChange}
                                            className="flex-1 px-2 py-1 border border-gray-300 rounded"
                                        />
                                        <button
                                            onClick={onSaveProfile}
                                            className="px-3 py-1 bg-green-600 text-white rounded text-sm"
                                        >
                                            Save
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium">{userProfile?.name}</span>
                                        <button
                                            onClick={onEditProfile}
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
                                onClick={onShowRestartConfirm}
                                className="w-full flex items-center space-x-2 p-3 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors"
                            >
                                <RotateCcw className="w-4 h-4" />
                                <span>Restart Challenge</span>
                            </button>
                            <button
                                onClick={onShowClearDataConfirm}
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
    );
};

export default SettingsModal; 