import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { RootState, AppDispatch } from '../store';
import { logout } from '../store/authSlice';

interface Props {
  search: string;
  setSearch: (v: string) => void;
  status: string;
  setStatus: (v: string) => void;
  onNewProject: () => void;
  onClose?: () => void;
}

const Sidebar: React.FC<Props> = ({ search, setSearch, status, setStatus, onNewProject, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state: RootState) => state.auth.user);
  const { total, data: projects } = useSelector((state: RootState) => state.projects);

  const activeCount = projects.filter((p) => p.status === 'active').length;
  const completedCount = projects.filter((p) => p.status === 'completed').length;

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const isDashboard = location.pathname === '/dashboard';

  return (
    <aside className="w-64 shrink-0 flex flex-col bg-white border-r border-gray-200 min-h-screen">
      {/* Logo */}
      <div
        className="px-5 py-4 border-b cursor-pointer flex items-center justify-between"
      >
        <div className="flex items-center gap-2" onClick={() => { navigate('/dashboard'); onClose?.(); }}>
          <span className="text-2xl">📋</span>
          <span className="font-bold text-indigo-600 text-lg">ProjectMgr</span>
        </div>
        <button onClick={onClose} className="md:hidden text-gray-400 hover:text-gray-600 text-xl">✕</button>
      </div>

      {/* Profile */}
      <div className="px-5 py-4 border-b bg-indigo-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="font-semibold text-gray-800 text-sm truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="px-3 py-3 border-b">
        <button
          onClick={() => navigate('/dashboard')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
            isDashboard ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <span>🏠</span> Dashboard
        </button>
      </nav>

      {/* Stats */}
      <div className="px-5 py-4 border-b">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Overview</p>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Total Projects</span>
            <span className="text-sm font-bold text-indigo-600">{total}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Active</span>
            <span className="text-sm font-bold text-green-600">{activeCount}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Completed</span>
            <span className="text-sm font-bold text-gray-500">{completedCount}</span>
          </div>
        </div>
      </div>

      {/* Filters - only on dashboard */}
      {isDashboard && (
        <div className="px-5 py-4 border-b flex-1">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Filters</p>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Search</label>
              <input
                type="text"
                placeholder="Search projects..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <button
              onClick={onNewProject}
              className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
            >
              + New Project
            </button>
          </div>
        </div>
      )}

      {/* Logout */}
      <div className="px-5 py-4 mt-auto border-t">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 text-sm text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg transition"
        >
          <span>🚪</span> Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
