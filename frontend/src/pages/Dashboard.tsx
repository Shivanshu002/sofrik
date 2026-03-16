import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState, AppDispatch } from '../store';
import { fetchProjects, deleteProject } from '../store/projectsSlice';
import Navbar from '../components/Navbar';
import Modal from '../components/Modal';
import ProjectForm from '../components/ProjectForm';

const Dashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { data: projects, loading, totalPages, page } = useSelector((state: RootState) => state.projects);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editProject, setEditProject] = useState<any>(null);

  const load = useCallback(() => {
    dispatch(fetchProjects({ page: currentPage, limit: 9, search, status }));
  }, [dispatch, currentPage, search, status]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this project?')) dispatch(deleteProject(id));
  };

  const handleSuccess = () => {
    setShowModal(false);
    setEditProject(null);
    load();
  };

  const statusBadge = (s: string) =>
    s === 'active'
      ? 'bg-green-100 text-green-700'
      : 'bg-gray-100 text-gray-600';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-800">My Projects</h1>
          <button
            onClick={() => { setEditProject(null); setShowModal(true); }}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 text-sm"
          >
            + New Project
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="border rounded px-3 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setCurrentPage(1); }}
            className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading...</div>
        ) : projects.length === 0 ? (
          <div className="text-center py-16 text-gray-400">No projects found. Create one!</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <div key={project._id} className="bg-white rounded-lg shadow p-5 flex flex-col gap-3 hover:shadow-md transition">
                <div className="flex justify-between items-start">
                  <h2
                    className="font-semibold text-gray-800 cursor-pointer hover:text-indigo-600"
                    onClick={() => navigate(`/projects/${project._id}`)}
                  >
                    {project.title}
                  </h2>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusBadge(project.status)}`}>
                    {project.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500 line-clamp-2">{project.description || 'No description'}</p>
                <div className="flex gap-2 mt-auto">
                  <button
                    onClick={() => navigate(`/projects/${project._id}`)}
                    className="flex-1 text-sm border border-indigo-600 text-indigo-600 py-1 rounded hover:bg-indigo-50"
                  >
                    View
                  </button>
                  <button
                    onClick={() => { setEditProject(project); setShowModal(true); }}
                    className="flex-1 text-sm border border-gray-300 text-gray-600 py-1 rounded hover:bg-gray-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(project._id)}
                    className="flex-1 text-sm border border-red-300 text-red-500 py-1 rounded hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`px-3 py-1 rounded text-sm border ${p === page ? 'bg-indigo-600 text-white border-indigo-600' : 'hover:bg-gray-50'}`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={showModal}
        title={editProject ? 'Edit Project' : 'New Project'}
        onClose={() => { setShowModal(false); setEditProject(null); }}
      >
        <ProjectForm
          project={editProject}
          onSuccess={handleSuccess}
          onCancel={() => { setShowModal(false); setEditProject(null); }}
        />
      </Modal>
    </div>
  );
};

export default Dashboard;
