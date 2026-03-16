import { doGet, doPost, doPut, doDelete } from '../../services';
import { Routes } from '../../utils/routes';
import { fetchTasksStart, fetchTasksSuccess, fetchTasksFailure, removeTask } from '../slices/tasksSlice';
import { Task } from '../../types';

export const fetchTasks =
  (projectId: string, status?: string) =>
  async (dispatch: any) => {
    try {
      dispatch(fetchTasksStart());
      const res = await doGet(Routes.url.tasks.byProject(projectId), { status });
      dispatch(fetchTasksSuccess(res.data));
    } catch (error: any) {
      dispatch(fetchTasksFailure(error?.response?.data?.message || 'Failed to fetch tasks'));
    }
  };

export const createTask =
  (data: { title: string; description?: string; status?: string; dueDate?: string; project: string }, onSuccess?: () => void) =>
  async (dispatch: any) => {
    try {
      await doPost(Routes.url.tasks.base, data);
      onSuccess?.();
    } catch (error: any) {
      throw error;
    }
  };

export const updateTask =
  (id: string, data: Partial<Task>, onSuccess?: () => void) =>
  async (dispatch: any) => {
    try {
      await doPut(Routes.url.tasks.byId(id), data);
      onSuccess?.();
    } catch (error: any) {
      throw error;
    }
  };

export const deleteTask =
  (id: string) =>
  async (dispatch: any) => {
    try {
      await doDelete(Routes.url.tasks.byId(id));
      dispatch(removeTask(id));
    } catch (error: any) {
      throw error;
    }
  };
