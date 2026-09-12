import { useState } from 'react';
import type { Task, TaskPriority, User } from '../types';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
  canUpdate: boolean;
}

const priorityColors: Record<TaskPriority, string> = {
  LOW: 'bg-gray-100 text-gray-700',
  MEDIUM: 'bg-blue-100 text-blue-700',
  HIGH: 'bg-orange-100 text-orange-700',
  CRITICAL: 'bg-red-100 text-red-700',
};

const statusColors: Record<string, string> = {
  TODO: 'bg-gray-100 text-gray-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  REVIEW: 'bg-yellow-100 text-yellow-700',
  DONE: 'bg-green-100 text-green-700',
  OVERDUE: 'bg-red-100 text-red-700',
};

export function TaskCard({ task, onClick, canUpdate }: TaskCardProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE';

  return (
    <div 
      className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm hover:shadow-md cursor-pointer transition-shadow"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-gray-900 text-sm truncate pr-2">{task.title}</h4>
        <div className="relative">
          <button
            onClick={(e) => { e.stopPropagation(); setShowDropdown(!showDropdown); }}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
          {showDropdown && (
            <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1">
              <button
                onClick={(e) => { e.stopPropagation(); setShowDropdown(false); }}
                className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
              >
                View Details
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setShowDropdown(false); }}
                className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
              >
                Edit
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setShowDropdown(false); }}
                className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {task.description && (
        <p className="text-xs text-gray-500 mb-2 line-clamp-2">{task.description}</p>
      )}

      <div className="flex items-center justify-between mb-2">
        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[task.status] || 'bg-gray-100 text-gray-700'}`}>
          {task.status.replace('_', ' ')}
        </span>
        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${priorityColors[task.priority] || 'bg-gray-100 text-gray-700'}`}>
          {task.priority}
        </span>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-1">
          {task.assignee && (
            <div className="flex items-center">
              {task.assignee.avatarUrl ? (
                <img src={task.assignee.avatarUrl} alt={task.assignee.name} className="w-5 h-5 rounded-full" />
              ) : (
                <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-medium">
                  {task.assignee.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {isOverdue && (
            <span className="text-red-500 font-medium">⚠ Overdue</span>
          )}
          {task.dueDate && !isOverdue && (
            <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
          )}
        </div>
      </div>
    </div>
  );
}