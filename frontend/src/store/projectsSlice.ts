import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Project, PaginatedProjects } from '../types';
import { projectsApi } from '../api';

interface ProjectsState {
  data: Project[];
  total: number;
  page: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
}

const initialState: ProjectsState = {
  data: [], total: 0, page: 1, totalPages: 1, loading: false, error: null,
};

export const fetchProjects = createAsyncThunk(
  'projects/fetchAll',
  async (params: { page?: number; limit?: number; search?: string; status?: string }) => {
    const res = await projectsApi.getAll(params);
    return res.data;
  }
);

export const deleteProject = createAsyncThunk('projects/delete', async (id: string) => {
  await projectsApi.delete(id);
  return id;
});

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchProjects.fulfilled, (state, action: PayloadAction<PaginatedProjects>) => {
        state.loading = false;
        state.data = action.payload.data;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch projects';
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.data = state.data.filter((p) => p._id !== action.payload);
      });
  },
});

export default projectsSlice.reducer;
