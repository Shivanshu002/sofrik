import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Project, PaginatedProjects } from '../../types';

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

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    fetchProjectsStart(state) { state.loading = true; state.error = null; },
    fetchProjectsSuccess(state, action: PayloadAction<PaginatedProjects>) {
      state.loading = false;
      state.data = action.payload.data;
      state.total = action.payload.total;
      state.page = action.payload.page;
      state.totalPages = action.payload.totalPages;
    },
    fetchProjectsFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    removeProject(state, action: PayloadAction<string>) {
      state.data = state.data.filter((p) => p._id !== action.payload);
    },
  },
});

export const { fetchProjectsStart, fetchProjectsSuccess, fetchProjectsFailure, removeProject } = projectsSlice.actions;
export default projectsSlice.reducer;
