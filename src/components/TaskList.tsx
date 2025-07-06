// src/components/TaskList.tsx
// TaskList component: Renders the list of tasks, add task button, and handles task completion/deletion.
import React from 'react';
import { Plus, Trash, Target } from 'lucide-react';
import { DatabaseCustomTask } from '@/types/database';

interface TaskListProps {
    customTasks: DatabaseCustomTask[];
    completedTasks: { [key: string]: string | boolean };
    onToggleTask: (task: string) => void;
    onDeleteTask: (index: number) => void;
    onShowAddTask: () => void;
    showAddTask: boolean;
    AddTaskForm: React.ReactNode;
    getTaskDisplay: (task: string) => { icon: string; color: string; bgColor: string };
    getCelebrationContent: (task: string) => { message: string; emoji: string };
    formatCompletionTime: (timestamp: string) => string;
}

const TaskList: React.FC<TaskListProps> = ({
    customTasks,
    completedTasks,
    onToggleTask,
    onDeleteTask,
    onShowAddTask,
    showAddTask,
    AddTaskForm,
    getTaskDisplay,
    getCelebrationContent,
    formatCompletionTime,
}) => (
    <div className="space-y-3">
        <div className="flex items-center justify-between mb-3">
            <div>
                <h2 className="text-lg font-semibold text-white">Your Tasks</h2>
                <p className="text-sm text-blue-200/80">Tap to complete, customize as needed</p>
            </div>
            <button
                onClick={onShowAddTask}
                className="flex items-center space-x-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
                <Plus className="w-4 h-4" />
                <span>Add</span>
            </button>
        </div>
        {showAddTask && AddTaskForm}
        {customTasks.length > 0 ? (
            <div className="space-y-2">
                {customTasks.map((taskObj, index) => {
                    const task = taskObj.task_text;
                    const completionData = completedTasks[task];
                    const isCompleted = completionData !== false && !!completionData;
                    const taskDisplay = getTaskDisplay(task);
                    const celebration = getCelebrationContent(task);
                    return (
                        <div
                            key={taskObj.id || index}
                            className={`relative rounded-lg border transition-all duration-200 hover:shadow-md ${isCompleted
                                ? `bg-gradient-to-r ${taskDisplay.bgColor} border-green-300`
                                : 'bg-white border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            <div className="p-3">
                                <div className="flex items-center">
                                    <div
                                        className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200 ${isCompleted
                                            ? 'bg-green-500 text-white'
                                            : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                                            }`}
                                        onClick={() => onToggleTask(task)}
                                    >
                                        {isCompleted ? (
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        ) : (
                                            <span className="text-lg">{taskDisplay.icon}</span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0 ml-3">
                                        <h3 className={`font-medium text-base ${isCompleted ? 'text-green-700 opacity-75' : 'text-gray-800'}`}>
                                            {task}
                                        </h3>
                                        <p className={`text-xs mt-0.5 ${isCompleted ? 'text-green-600' : 'text-gray-500'}`}>
                                            {isCompleted
                                                ? `${celebration.message} • ${formatCompletionTime(completionData as string)}`
                                                : 'Tap to complete'
                                            }
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => onDeleteTask(index)}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-2"
                                    >
                                        <Trash className="w-4 h-4" />
                                    </button>
                                    {isCompleted && (
                                        <div className="ml-1">
                                            <span className="text-lg">{celebration.emoji}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-6 text-center shadow-sm">
                <div className="w-12 h-12 bg-gray-100 rounded-lg mx-auto mb-3 flex items-center justify-center">
                    <Target className="w-6 h-6 text-gray-400" />
                </div>
                <h3 className="text-base font-semibold text-gray-700 mb-2">No tasks yet</h3>
                <p className="text-sm text-gray-500 mb-4">
                    Add your first task to get started with your challenge
                </p>
                <button
                    onClick={onShowAddTask}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                    Add Your First Task
                </button>
            </div>
        )}
    </div>
);

export default TaskList; 