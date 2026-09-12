import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { projectApi, taskApi } from '../services/api';
import type { Project, Task } from '../types';

const statusColors: Record<string, string> = {
  TODO: 'bg-gray-100 text-gray-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  REVIEW: 'bg-yellow-100 text-yellow-700',
  DONE: 'bg-green-100 text-green-700',
  OVERDUE: 'bg-red-100 text-red-700',
};

const priorityColors: Record<string, string> = {
  LOW: 'bg-gray-100 text-gray-700',
  MEDIUM: 'bg-blue-100 text-blue-700',
  HIGH: 'bg-orange-100 text-orange-700',
  CRITICAL: 'bg-red-100 text-red-700',
};

export function Dashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsRes, tasksRes] = await Promise.all([
          projectApi.getAll(),
          taskApi.getAll ? taskApi.getAll() : Promise.resolve({ data: { success: true, data: { items: [], page: 1, limit: 20, total: 0 } } }),
        ]);

        if (projectsRes.data.success) {
          setProjects(projectsRes.data.data || []);
        }
        
        // For tasks, we might need to fetch per project
        setLoading(false);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const stats = {
    totalProjects: projects.length,
    totalTasks: tasks.length,
    inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
    completed: tasks.filter(t => t.status === 'DONE').length,
    overdue: tasks.filter(t => t.status === 'OVERDUE' || (t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'DONE')).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Welcome back, {user?.name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Total Projects" value={stats.totalProjects} icon="📁" color="blue" />
        <StatCard title="Total Tasks" value={stats.totalTasks} icon="✓" color="gray" />
        <StatCard title="In Progress" value={stats.inProgress} icon="⏳" color="blue" />
        <StatCard title="Completed" value={stats.completed} icon="✓" color="green" />
        <StatCard title="Overdue" value={stats.overdue} icon="⚠" color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Projects</h2>
          {projects.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No projects yet</p>
          ) : (
            <div className="space-y-3">
              {projects.slice(0, 5).map((project) => (
                <div key={project.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{project.name}</p>
                    <p className="text-sm text-gray-500">{project.client.name} • {project.owner.name}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[project.status] || 'bg-gray-100 text-gray-700'}`}>
                    {project.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <p className="text-gray-500 text-center py-8">Activity feed will appear here after project interactions</p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string; value: number; icon: string; color: string }) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600',
    gray: 'bg-gray-100 text-gray-600',
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`${colorClasses[color] || colorClasses.gray} p-3 rounded-lg`}>
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
    </div>
  );
}