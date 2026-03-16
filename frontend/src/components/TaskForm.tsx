import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { tasksApi } from '../api';
import { Task } from '../types';

const schema = yup.object({
  title: yup.string().required('Title is required'),
  description: yup.string().optional(),
  status: yup.string().oneOf(['todo', 'in-progress', 'done']).optional(),
  dueDate: yup.string().optional(),
});

type FormData = { title: string; description?: string; status?: string; dueDate?: string };

interface Props {
  task?: Task;
  projectId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const TaskForm: React.FC<Props> = ({ task, projectId, onSuccess, onCancel }) => {
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      title: task?.title || '',
      description: task?.description || '',
      status: task?.status || 'todo',
      dueDate: task?.dueDate ? task.dueDate.split('T')[0] : '',
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      if (task) await tasksApi.update(task._id, data as any);
      else await tasksApi.create({ ...data, project: projectId });
      onSuccess();
    } catch {
      setError('Something went wrong. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Title</label>
        <input {...register('title')} className="mt-1 w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
        {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea {...register('description')} rows={2} className="mt-1 w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Status</label>
        <select {...register('status')} className="mt-1 w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
          <option value="todo">Todo</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Due Date</label>
        <input type="date" {...register('dueDate')} className="mt-1 w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm border rounded hover:bg-gray-50">Cancel</button>
        <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50">
          {isSubmitting ? 'Saving...' : task ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
};

export default TaskForm;
