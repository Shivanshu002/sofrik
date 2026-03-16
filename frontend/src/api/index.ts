import api from './axios';
import { Project, Task, PaginatedProjects } from '../types';

export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
};

export const projectsApi = {
  getAll: (params: { page?: number; limit?: number; search?: string; status?: string }) =>
    api.get<PaginatedProjects>('/projects', { params }),
  getOne: (id: string) => api.get<Project>(`/projects/${id}`),
  create: (data: { title: string; description?: string; status?: string }) =>
    api.post<Project>('/projects', data),
  update: (id: string, data: Partial<Project>) =>
    api.put<Project>(`/projects/${id}`, data),
  delete: (id: string) => api.delete(`/projects/${id}`),
};

export const tasksApi = {
  getByProject: (projectId: string, status?: string) =>
    api.get<Task[]>(`/tasks/project/${projectId}`, { params: { status } }),
  create: (data: { title: string; description?: string; status?: string; dueDate?: string; project: string }) =>
    api.post<Task>('/tasks', data),
  update: (id: string, data: Partial<Task>) =>
    api.put<Task>(`/tasks/${id}`, data),
  delete: (id: string) => api.delete(`/tasks/${id}`),
};
