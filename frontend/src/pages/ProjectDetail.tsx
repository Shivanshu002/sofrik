import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { fetchTasks, deleteTask } from '../store/tasksSlice';
import { projectsApi } from '../api';
import { Project, Task } from '../types';
import Layout from '../components/Layout';
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
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

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
    if (window.confirm('Delete this task?')) {
      dispatch(deleteTask(taskId));
      if (selectedTask?._id === taskId) setSelectedTask(null);
    }
  };

  const handleSuccess = () => {
    setShowModal(false);
    setEditTask(null);
    loadTasks();
  };

  return (
    <Layout selectedProject={project} selectedTask={selectedTask}>
      <div className="px-6 py-8">
        <button onClick={() => navigate('/dashboard')} className="text-indigo-600 text-sm mb-4 hover:underline flex items-center gap-1">
          ← Back to Dashboard
        </button>

        {project && (
          <div className="bg-white rounded-xl shadow p-6 mb-6 border border-gray-100">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{project.title}</h1>
                <p className="text-gray-500 mt-1 text-sm">{project.description}</p>
              </div>
              <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                project.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
              }`}>
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
              className="border rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <option value="">All</option>
              <option value="todo">Todo</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-xs text-gray-400">Click a task for AI suggestions →</p>
            <button
              onClick={() => { setEditTask(null); setShowModal(true); }}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm"
            >
              + Add Task
            </button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-white rounded-xl animate-pulse shadow" />)}
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-4xl mb-2">📝</div>
            <p>No tasks yet. Add one!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task._id}
                onClick={() => setSelectedTask(task)}
                className={`bg-white rounded-xl shadow p-4 flex justify-between items-start cursor-pointer transition-all border-2 ${
                  selectedTask?._id === task._id
                    ? 'border-indigo-500 shadow-md'
                    : 'border-transparent hover:border-indigo-200'
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-800">{task.title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge(task.status)}`}>
                      {task.status}
                    </span>
                    {selectedTask?._id === task._id && (
                      <span className="text-xs text-indigo-500">🤖 AI active</span>
                    )}
                  </div>
                  {task.description && <p className="text-sm text-gray-500">{task.description}</p>}
                  {task.dueDate && (
                    <p className="text-xs text-gray-400 mt-1">
                      📅 Due: {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 ml-4" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => { setEditTask(task); setShowModal(true); }}
                    className="text-sm border border-gray-300 text-gray-600 px-3 py-1 rounded-lg hover:bg-gray-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(task._id)}
                    className="text-sm border border-red-300 text-red-500 px-3 py-1 rounded-lg hover:bg-red-50"
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
    </Layout>
  );
};

export default ProjectDetail;
