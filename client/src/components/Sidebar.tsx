import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Role } from '../types';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', roles: ['ADMIN', 'PROJECT_MANAGER', 'DEVELOPER'] },
  { name: 'Projects', href: '/projects', roles: ['ADMIN', 'PROJECT_MANAGER', 'DEVELOPER'] },
  { name: 'Users', href: '/users', roles: ['ADMIN', 'PROJECT_MANAGER'] },
  { name: 'Profile', href: '/profile', roles: ['ADMIN', 'PROJECT_MANAGER', 'DEVELOPER'] },
];

export function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const filteredNav = navigation.filter((item) => 
    item.roles.includes(user?.role as Role)
  );

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold text-blue-400">Velozity</h1>
        <p className="text-xs text-gray-400 mt-1">Project Dashboard</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {filteredNav.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-medium">{user?.name}</p>
            <p className="text-xs text-gray-400 capitalize">{user?.role?.toLowerCase().replace('_', ' ')}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </div>
    </aside>
  );
}