// src/components/AddTaskForm.tsx
// AddTaskForm component: Handles the UI and logic for adding a new custom task.
import React from 'react';

interface AddTaskFormProps {
    newTaskText: string;
    onChangeNewTaskText: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onAddCustomTask: () => void;
    onCancel: () => void;
}

const AddTaskForm: React.FC<AddTaskFormProps> = ({
    newTaskText,
    onChangeNewTaskText,
    onAddCustomTask,
    onCancel,
}) => (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-3 shadow-md">
        <div className="space-y-3">
            <input
                type="text"
                value={newTaskText}
                onChange={onChangeNewTaskText}
                placeholder="Enter your task (e.g., Meditate for 10 minutes)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 text-gray-800 placeholder-gray-500 text-sm"
                onKeyPress={(e) => e.key === 'Enter' && onAddCustomTask()}
                autoFocus
            />
            <div className="flex space-x-2">
                <button
                    onClick={onAddCustomTask}
                    disabled={!newTaskText.trim()}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                >
                    Add Task
                </button>
                <button
                    onClick={onCancel}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 border border-gray-300 transition-colors text-sm"
                >
                    Cancel
                </button>
            </div>
        </div>
    </div>
);

export default AddTaskForm; 