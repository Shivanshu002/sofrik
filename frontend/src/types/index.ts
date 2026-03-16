export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Project {
  _id: string;
  title: string;
  description: string;
  status: 'active' | 'completed';
  owner: string;
  createdAt: string;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  dueDate?: string;
  project: string;
  owner: string;
  createdAt: string;
}

export interface PaginatedProjects {
  data: Project[];
  total: number;
  page: number;
  totalPages: number;
}
