import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { fetchTasks, deleteTask } from '../store/tasksSlice';
import { projectsApi } from '../api';
import { Project, Task } from '../types';
import Navbar from '../components/Navbar';
import Modal from '../components/Modal';
import TaskForm from '../components/TaskForm';

const statusBadge = (s: string) => {
  if (s === 'done') return 'bg-green-100 text-green-700';
  if (s === 'in-progress') return 'bg-yellow-100 text-yellow-700';
  return 'bg-gray-100 text-gray-600';
};

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { data: tasks, loading } = useSelector((state: RootState) => state.tasks);

  const [project, setProject] = useState<Project | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);

  const loadTasks = useCallback(() => {
    if (id) dispatch(fetchTasks({ projectId: id, status: statusFilter }));
  }, [dispatch, id, statusFilter]);

  useEffect(() => {
    if (id) {
      projectsApi.getOne(id).then((res) => setProject(res.data)).catch(() => navigate('/dashboard'));
    }
  }, [id, navigate]);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  const handleDelete = (taskId: string) => {
    if (window.confirm('Delete this task?')) dispatch(deleteTask(taskId));
  };

  const handleSuccess = () => {
    setShowModal(false);
    setEditTask(null);
    loadTasks();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button onClick={() => navigate('/dashboard')} className="text-indigo-600 text-sm mb-4 hover:underline">
          ← Back to Dashboard
        </button>

        {project && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{project.title}</h1>
                <p className="text-gray-500 mt-1 text-sm">{project.description}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${project.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                {project.status}
              </span>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-700">Tasks</h2>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <option value="">All</option>
              <option value="todo">Todo</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>
          <button
            onClick={() => { setEditTask(null); setShowModal(true); }}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 text-sm"
          >
            + Add Task
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading...</div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-12 text-gray-400">No tasks yet. Add one!</div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <div key={task._id} className="bg-white rounded-lg shadow p-4 flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-800">{task.title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge(task.status)}`}>
                      {task.status}
                    </span>
                  </div>
                  {task.description && <p className="text-sm text-gray-500">{task.description}</p>}
                  {task.dueDate && (
                    <p className="text-xs text-gray-400 mt-1">
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => { setEditTask(task); setShowModal(true); }}
                    className="text-sm border border-gray-300 text-gray-600 px-3 py-1 rounded hover:bg-gray-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(task._id)}
                    className="text-sm border border-red-300 text-red-500 px-3 py-1 rounded hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={showModal}
        title={editTask ? 'Edit Task' : 'New Task'}
        onClose={() => { setShowModal(false); setEditTask(null); }}
      >
        <TaskForm
          task={editTask || undefined}
          projectId={id!}
          onSuccess={handleSuccess}
          onCancel={() => { setShowModal(false); setEditTask(null); }}
        />
      </Modal>
    </div>
  );
};

export default ProjectDetail;
