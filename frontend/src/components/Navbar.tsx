import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState, AppDispatch } from '../store';
import { logout } from '../store/authSlice';

const Navbar: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <nav className="bg-indigo-600 text-white px-6 py-3 flex justify-between items-center shadow">
      <span
        className="font-bold text-lg cursor-pointer"
        onClick={() => navigate('/dashboard')}
      >
        ProjectManager
      </span>
      <div className="flex items-center gap-4">
        <span className="text-sm">{user?.name}</span>
        <button
          onClick={handleLogout}
          className="bg-white text-indigo-600 text-sm px-3 py-1 rounded hover:bg-indigo-50"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
