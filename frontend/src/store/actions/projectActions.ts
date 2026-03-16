import { doGet, doPost, doPut, doDelete } from '../../services';
import { Routes } from '../../utils/routes';
import { fetchProjectsStart, fetchProjectsSuccess, fetchProjectsFailure, removeProject } from '../slices/projectsSlice';
import { Project } from '../../types';

export const fetchProjects =
  (params: { page?: number; limit?: number; search?: string; status?: string }) =>
  async (dispatch: any) => {
    try {
      dispatch(fetchProjectsStart());
      const res = await doGet(Routes.url.projects.base, params);
      dispatch(fetchProjectsSuccess(res.data));
    } catch (error: any) {
      dispatch(fetchProjectsFailure(error?.response?.data?.message || 'Failed to fetch projects'));
    }
  };

export const createProject =
  (data: { title: string; description?: string; status?: string }, onSuccess?: () => void) =>
  async (dispatch: any) => {
    try {
      await doPost(Routes.url.projects.base, data);
      onSuccess?.();
    } catch (error: any) {
      throw error;
    }
  };

export const updateProject =
  (id: string, data: Partial<Project>, onSuccess?: () => void) =>
  async (dispatch: any) => {
    try {
      await doPut(Routes.url.projects.byId(id), data);
      onSuccess?.();
    } catch (error: any) {
      throw error;
    }
  };

export const deleteProject =
  (id: string) =>
  async (dispatch: any) => {
    try {
      await doDelete(Routes.url.projects.byId(id));
      dispatch(removeProject(id));
    } catch (error: any) {
      throw error;
    }
  };
