import type { Activity, User } from '../types';

const activityIcons: Record<string, { icon: string; color: string }> = {
  PROJECT_CREATED: { icon: '📁', color: 'text-blue-600' },
  TASK_CREATED: { icon: '➕', color: 'text-green-600' },
  TASK_UPDATED: { icon: '✏️', color: 'text-blue-600' },
  TASK_ASSIGNED: { icon: '👤', color: 'text-purple-600' },
  TASK_STATUS_CHANGED: { icon: '🔄', color: 'text-yellow-600' },
  COMMENT_ADDED: { icon: '💬', color: 'text-gray-600' },
};

export function ActivityFeed({ activities }: { activities: Activity[] }) {
  if (activities.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
        <p className="text-gray-500">No activity yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-200">
      <div className="px-4 py-3 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900">Activity Feed</h3>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {activities.map((activity) => {
          const { icon, color } = activityIcons[activity.type] || { icon: '📝', color: 'text-gray-600' };
          return (
            <div key={activity.id} className="px-4 py-3 hover:bg-gray-50 flex items-start space-x-3">
              <span className={`text-lg ${color} flex-shrink-0 mt-1`}>{icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">
                  <span className="font-medium">{activity.user.name}</span>{' '}
                  {activity.message}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {new Date(activity.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}