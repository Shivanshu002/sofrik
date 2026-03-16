import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState, AppDispatch } from '../store';
import { fetchProjects, deleteProject } from '../store/actions/projectActions';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import ProjectForm from '../components/ProjectForm';
import { Project } from '../types';

const Dashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { data: projects, loading, totalPages, page } = useSelector((state: RootState) => state.projects);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const load = useCallback(() => {
    dispatch(fetchProjects({ page: currentPage, limit: 9, search, status }));
  }, [dispatch, currentPage, search, status]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this project?')) {
      dispatch(deleteProject(id));
      if (selectedProject?._id === id) setSelectedProject(null);
    }
  };

  const handleSuccess = () => {
    setShowModal(false);
    setEditProject(null);
    load();
  };

  const statusBadge = (s: string) =>
    s === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600';

  return (
    <Layout
      search={search}
      setSearch={(v) => { setSearch(v); setCurrentPage(1); }}
      status={status}
      setStatus={(v) => { setStatus(v); setCurrentPage(1); }}
      onNewProject={() => { setEditProject(null); setShowModal(true); }}
      selectedProject={selectedProject}
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
    >
      <div className="px-4 md:px-6 py-6 md:py-8">
        {/* Mobile top bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg border border-gray-200 text-gray-600"
            >
              ☰
            </button>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-800">My Projects</h1>
              <p className="text-xs text-gray-400 hidden sm:block">Click a project to get AI suggestions →</p>
            </div>
          </div>
          <button
            onClick={() => { setEditProject(null); setShowModal(true); }}
            className="bg-indigo-600 text-white px-3 py-2 md:px-4 rounded-lg hover:bg-indigo-700 text-sm font-medium"
          >
            + New
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-40 bg-white rounded-xl animate-pulse shadow" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-5xl mb-3">📂</div>
            <p className="font-medium">No projects found.</p>
            <p className="text-sm mt-1">Create your first project!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {projects.map((project) => (
              <div
                key={project._id}
                onClick={() => setSelectedProject(project)}
                className={`bg-white rounded-xl shadow p-5 flex flex-col gap-3 cursor-pointer transition-all border-2 ${
                  selectedProject?._id === project._id
                    ? 'border-indigo-500 shadow-lg'
                    : 'border-transparent hover:border-indigo-200 hover:shadow-md'
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <h2 className="font-semibold text-gray-800 flex-1 text-sm md:text-base">{project.title}</h2>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ${statusBadge(project.status)}`}>
                    {project.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500 line-clamp-2 flex-1">
                  {project.description || 'No description'}
                </p>
                {selectedProject?._id === project._id && (
                  <p className="text-xs text-indigo-500 font-medium">🤖 AI suggestions loading →</p>
                )}
                <div className="flex gap-2 mt-auto" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => navigate(`/projects/${project._id}`)}
                    className="flex-1 text-xs md:text-sm border border-indigo-600 text-indigo-600 py-1.5 rounded-lg hover:bg-indigo-50"
                  >
                    View
                  </button>
                  <button
                    onClick={() => { setEditProject(project); setShowModal(true); }}
                    className="flex-1 text-xs md:text-sm border border-gray-300 text-gray-600 py-1.5 rounded-lg hover:bg-gray-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(project._id)}
                    className="flex-1 text-xs md:text-sm border border-red-300 text-red-500 py-1.5 rounded-lg hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8 flex-wrap">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`px-3 py-1 rounded-lg text-sm border ${
                  p === page ? 'bg-indigo-600 text-white border-indigo-600' : 'hover:bg-gray-50'
                }`}
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
          project={editProject || undefined}
          onSuccess={handleSuccess}
          onCancel={() => { setShowModal(false); setEditProject(null); }}
        />
      </Modal>
    </Layout>
  );
};

export default Dashboard;
