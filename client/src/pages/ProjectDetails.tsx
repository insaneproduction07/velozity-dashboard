import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../hooks/useSocket';
import { projectApi, taskApi, notificationApi } from '../services/api';
import type { Project, Task, TaskStatus, TaskPriority, User, Comment, Activity } from '../types';
import { TaskCard } from '../components/TaskCard';
import { TaskModal } from '../components/TaskModal';
import { CommentSection } from '../components/CommentSection';
import { ActivityFeed } from '../components/ActivityFeed';

const statusColumns: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'];
const statusLabels: Record<TaskStatus, string> = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  REVIEW: 'In Review',
  DONE: 'Done',
  OVERDUE: 'Overdue',
};

const priorityColors: Record<TaskPriority, string> = {
  LOW: 'bg-gray-100 text-gray-700',
  MEDIUM: 'bg-blue-100 text-blue-700',
  HIGH: 'bg-orange-100 text-orange-700',
  CRITICAL: 'bg-red-100 text-red-700',
};

const canCreateTask = (role: string) => role === 'ADMIN' || role === 'PROJECT_MANAGER';
const canUpdateTask = (role: string, task: Task, userId: string) => {
  if (role === 'ADMIN') return true;
  if (role === 'PROJECT_MANAGER') return true;
  if (role === 'DEVELOPER') return task.assigneeId === userId;
  return false;
};
const canAssignTask = (role: string) => role === 'ADMIN' || role === 'PROJECT_MANAGER';
const canDeleteTask = (role: string) => role === 'ADMIN' || role === 'PROJECT_MANAGER';

export function ProjectDetails() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { joinProject, leaveProject, onTaskCreated, onTaskUpdated, onTaskAssigned, onCommentAdded, onActivityNew } = useSocket();
  
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskModalMode, setTaskModalMode] = useState<'create' | 'edit'>('create');
  const [error, setError] = useState('');

  const fetchProject = useCallback(async () => {
    if (!projectId) return;
    try {
      const [projectRes, tasksRes, activitiesRes, usersRes] = await Promise.all([
        projectApi.getById(projectId!),
        projectApi.getTasks(projectId!, { limit: 100 }),
        projectApi.getActivity(projectId!, { limit: 50 }),
        projectApi.getAll(), // get users from projects endpoint won't work, need userApi
      ]);

      if (projectRes.data.success && projectRes.data.data) {
        setProject(projectRes.data.data);
      }
      if (tasksRes.data.success && tasksRes.data.data) {
        setTasks(tasksRes.data.data.items);
      }
      if (activitiesRes.data.success && activitiesRes.data.data) {
        setActivities(activitiesRes.data.data.items);
      }
      // Fetch users separately
      try {
        const usersRes = await projectApi.getAll(); // This is wrong, need proper user API
      } catch (e) {
        // ignore
      }
    } catch (err) {
      console.error('Failed to load project:', err);
      setError('Failed to load project');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId) {
      fetchProject();
    }
  }, [projectId, fetchProject]);

  useEffect(() => {
    if (projectId) {
      joinProject(projectId);
    }
    return () => {
      if (projectId) {
        leaveProject(projectId);
      }
    };
  }, [projectId, joinProject, leaveProject]);

  useEffect(() => {
    if (!projectId) return;
    
    const offTaskCreated = onTaskCreated((task) => {
      if (task.projectId === projectId) {
        setTasks(prev => [task, ...prev]);
      }
    });
    
    const offTaskUpdated = onTaskUpdated((task) => {
      if (task.projectId === projectId) {
        setTasks(prev => prev.map(t => t.id === task.id ? task : t));
        if (selectedTask?.id === task.id) {
          setSelectedTask(task);
        }
      }
    });
    
    const offTaskAssigned = onTaskAssigned((task, assignee) => {
      if (task.projectId === projectId) {
        setTasks(prev => prev.map(t => t.id === task.id ? { ...t, assigneeId: assignee.id, assignee } : t));
      }
    });
    
    const offCommentAdded = onCommentAdded((comment) => {
      if (selectedTask?.id === comment.taskId) {
        // Comments are handled in CommentSection
      }
    });
    
    const offActivityNew = onActivityNew((activity) => {
      if (activity.projectId === projectId) {
        setActivities(prev => [activity, ...prev]);
      }
    });

    return () => {
      offTaskCreated();
      offTaskUpdated();
      offTaskAssigned();
      offCommentAdded();
      offActivityNew();
    };
  }, [projectId, joinProject, leaveProject, onTaskCreated, onTaskUpdated, onTaskAssigned, onCommentAdded, onActivityNew]);

  const tasksByStatus = (status: TaskStatus) => 
    tasks.filter(t => t.status === status).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setTaskModalMode('edit');
    setShowTaskModal(true);
  };

  const handleCreateTask = () => {
    setSelectedTask(null);
    setTaskModalMode('create');
    setShowTaskModal(true);
  };

  const handleTaskUpdate = async (updatedTask: Task) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
    if (selectedTask?.id === updatedTask.id) {
      setSelectedTask(updatedTask);
    }
    setShowTaskModal(false);
  };

  const handleTaskCreate = async (newTask: Task) => {
    setTasks(prev => [newTask, ...prev]);
    setShowTaskModal(false);
  };

  const handleTaskDelete = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const handleStatusChange = async (task: Task, newStatus: TaskStatus) => {
    if (!canUpdateTask(user?.role || '', task, user?.id || '')) return;
    
    try {
      const response = await taskApi.update(task.id, { status: newStatus });
      if (response.data.success && response.data.data) {
        setTasks(prev => prev.map(t => t.id === task.id ? response.data.data! : t));
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to update task');
    }
  };

  const handleAssignTask = async (task: Task, assigneeId: string) => {
    if (!canAssignTask(user?.role || '')) return;
    
    try {
      const response = await taskApi.assign(task.id, assigneeId);
      if (response.data.success && response.data.data) {
        setTasks(prev => prev.map(t => t.id === task.id ? response.data.data! : t));
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to assign task');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Project not found</p>
        <button onClick={() => navigate('/projects')} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg">
          Back to Projects
        </button>
      </div>
    );
  }

  const canCreate = canCreateTask(user?.role || '');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
          <p className="text-gray-500">{project.description || 'No description'}</p>
          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
            <span>Client: {project.client.name}</span>
            <span>Owner: {project.owner.name}</span>
            <span>Created: {new Date(project.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="flex space-x-3">
          <button onClick={() => navigate('/projects')} className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            Back to Projects
          </button>
          {canCreate && (
            <button onClick={handleCreateTask} className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700">
              + Add Task
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-100 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">To Do</h3>
          <p className="text-2xl font-bold text-gray-900">{tasksByStatus('TODO').length}</p>
        </div>
        <div className="bg-blue-100 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-700 uppercase tracking-wider mb-2">In Progress</h3>
          <p className="text-2xl font-bold text-blue-700">{tasksByStatus('IN_PROGRESS').length}</p>
        </div>
        <div className="bg-yellow-100 rounded-lg p-4">
          <h3 className="text-sm font-medium text-yellow-700 uppercase tracking-wider mb-2">In Review</h3>
          <p className="text-2xl font-bold text-yellow-700">{tasksByStatus('REVIEW').length}</p>
        </div>
        <div className="bg-green-100 rounded-lg p-4">
          <h3 className="text-sm font-medium text-green-700 uppercase tracking-wider mb-2">Done</h3>
          <p className="text-2xl font-bold text-green-700">{tasksByStatus('DONE').length}</p>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: '500px' }}>
        {statusColumns.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            label={statusLabels[status]}
            tasks={tasksByStatus(status)}
            onTaskClick={handleTaskClick}
            onStatusChange={handleStatusChange}
            canUpdate={canUpdateTask(user?.role || '', { id: '', status, priority: 'MEDIUM', projectId: projectId || '', assigneeId: '', creatorId: '', dueDate: null, title: '', description: null, createdAt: '', updatedAt: '', assignee: null, creator: { id: '', name: '', email: '', role: 'DEVELOPER', avatarUrl: null, createdAt: '', updatedAt: '' } }, user?.id || '')}
            projectId={projectId!}
            projectUsers={users}
          />
        ))}
      </div>

      {showTaskModal && (
        <TaskModal
          mode={taskModalMode}
          task={selectedTask}
          projectId={projectId!}
          projectUsers={users}
          onClose={() => { setShowTaskModal(false); setSelectedTask(null); }}
          onSave={taskModalMode === 'create' ? handleTaskCreate : handleTaskUpdate}
          onDelete={handleTaskDelete}
          onAssign={handleAssignTask}
          projectOwnerId={project.ownerId}
          currentUserId={user?.id}
          currentUserRole={user?.role}
        />
      )}
    </div>
  );
}

interface KanbanColumnProps {
  status: TaskStatus;
  label: string;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onStatusChange: (task: Task, newStatus: TaskStatus) => void;
  canUpdate: boolean;
  projectId: string;
  projectUsers: User[];
}

function KanbanColumn({ status, label, tasks, onTaskClick, onStatusChange, canUpdate, projectId, projectUsers }: KanbanColumnProps) {
  return (
    <div className="bg-gray-100 rounded-lg flex flex-col min-w-[280px] max-w-[280px] flex-shrink-0" style={{ maxHeight: '600px' }}>
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-700 capitalize">{label}</h3>
          <span className="bg-white text-gray-700 text-sm font-medium px-2 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>
      </div>
      <div className="p-3 space-y-3 overflow-y-auto" style={{ flex: 1, overflowX: 'hidden' }}>
        {tasks.length === 0 ? (
          <div className="text-center text-gray-400 text-sm py-8">No tasks</div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={() => onTaskClick(task)}
              canUpdate={true}
            />
          ))
        )}
      </div>
    </div>
  );
}