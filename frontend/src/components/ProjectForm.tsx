import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { projectsApi } from '../api';
import { Project } from '../types';

const schema = yup.object({
  title: yup.string().required('Title is required'),
  description: yup.string().optional(),
  status: yup.string().oneOf(['active', 'completed']).optional(),
});

type FormData = { title: string; description?: string; status?: string };

interface Props {
  project?: Project;
  onSuccess: () => void;
  onCancel: () => void;
}

const ProjectForm: React.FC<Props> = ({ project, onSuccess, onCancel }) => {
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: yupResolver(schema) as any,
    defaultValues: { title: project?.title || '', description: project?.description || '', status: project?.status || 'active' },
  });

  const onSubmit = async (data: FormData) => {
    try {
      if (project) await projectsApi.update(project._id, data as any);
      else await projectsApi.create(data);
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
        <textarea {...register('description')} rows={3} className="mt-1 w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Status</label>
        <select {...register('status')} className="mt-1 w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
          <option value="active">Active</option>
          <option value="completed">Completed</option>
        </select>
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm border rounded hover:bg-gray-50">Cancel</button>
        <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50">
          {isSubmitting ? 'Saving...' : project ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
};

export default ProjectForm;
