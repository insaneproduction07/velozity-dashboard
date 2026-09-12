import { useState, useEffect } from 'react';
import type { Task, TaskStatus, TaskPriority, User } from '../types';

interface TaskModalProps {
  mode: 'create' | 'edit';
  task: Task | null;
  projectId: string;
  projectUsers: User[];
  projectOwnerId: string;
  currentUserId: string | undefined;
  currentUserRole: string | undefined;
  onClose: () => void;
  onSave: (task: Task) => Promise<void>;
  onDelete?: (taskId: string) => void;
  onAssign?: (task: Task, assigneeId: string) => Promise<void>;
}

const statusOptions: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE', 'OVERDUE'];
const priorityOptions: TaskPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

const statusLabels: Record<TaskStatus, string> = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  REVIEW: 'In Review',
  DONE: 'Done',
  OVERDUE: 'Overdue',
};

export function TaskModal({ 
  mode, 
  task, 
  projectId, 
  projectUsers, 
  projectOwnerId, 
  currentUserId, 
  currentUserRole,
  onClose, 
  onSave, 
  onDelete, 
  onAssign 
}: TaskModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'TODO' as TaskStatus,
    priority: 'MEDIUM' as TaskPriority,
    assigneeId: '',
    dueDate: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showAssignDropdown, setShowAssignDropdown] = useState(false);

  const isAdmin = currentUserRole === 'ADMIN';
  const isPM = currentUserRole === 'PROJECT_MANAGER';
  const isDev = currentUserRole === 'DEVELOPER';

  const developers = projectUsers.filter(u => u.role === 'DEVELOPER');

  const canEdit = () => {
    if (!task) return false;
    if (isAdmin || isPM) return true;
    if (isDev) return task.assigneeId === currentUserId;
    return false;
  };

  const canAssign = () => isAdmin || isPM;
  const canDelete = () => isAdmin || isPM;

  useEffect(() => {
    if (mode === 'edit' && task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        assigneeId: task.assigneeId || '',
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        status: 'TODO' as TaskStatus,
        priority: 'MEDIUM' as TaskPriority,
        assigneeId: '',
        dueDate: '',
      });
    }
  }, [task, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const payload = {
        title: formData.title,
        description: formData.description || undefined,
        status: formData.status,
        priority: formData.priority,
        assigneeId: formData.assigneeId || undefined,
        dueDate: formData.dueDate || undefined,
      };

      if (mode === 'create') {
        // For create, we need to create via project API
        // This will be handled by the parent
        await onSave({
          id: '',
          ...payload,
          projectId,
          creatorId: currentUserId || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          assignee: null,
          creator: { id: currentUserId || '', name: '', email: '', role: 'DEVELOPER', avatarUrl: null, createdAt: '', updatedAt: '' },
        } as any);
      } else {
        await onSave({ ...task!, ...payload } as Task);
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to save task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!task || !onDelete) return;
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    onDelete(task.id);
    onClose();
  };

  const handleAssign = async () => {
    if (!formData.assigneeId || !onAssign || !task) return;
    await onAssign(task, formData.assigneeId);
    setShowAssignDropdown(false);
  };

  if (!canEdit()) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {mode === 'create' ? 'Create Task' : 'Edit Task'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={mode === 'create' || isDev}
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {priorityOptions.map((priority) => (
                  <option key={priority} value={priority}>{priority}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assignee</label>
            <div className="relative">
              <select
                value={formData.assigneeId}
                onChange={(e) => setFormData({ ...formData, assigneeId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Unassigned</option>
                {developers.map((dev) => (
                  <option key={dev.id} value={dev.id}>{dev.name}</option>
                ))}
              </select>
              {canAssign() && formData.assigneeId && (
                <button
                  type="button"
                  onClick={handleAssign}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-blue-600 hover:text-blue-700"
                >
                  Assign
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            
            {mode === 'edit' && canDelete() && onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
              >
                Delete
              </button>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? 'Saving...' : mode === 'create' ? 'Create Task' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}