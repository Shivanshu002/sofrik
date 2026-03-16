import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Task } from '../types';
import { tasksApi } from '../api';

interface TasksState {
  data: Task[];
  loading: boolean;
  error: string | null;
}

const initialState: TasksState = { data: [], loading: false, error: null };

export const fetchTasks = createAsyncThunk(
  'tasks/fetchByProject',
  async ({ projectId, status }: { projectId: string; status?: string }) => {
    const res = await tasksApi.getByProject(projectId, status);
    return res.data;
  }
);

export const deleteTask = createAsyncThunk('tasks/delete', async (id: string) => {
  await tasksApi.delete(id);
  return id;
});

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchTasks.fulfilled, (state, action: PayloadAction<Task[]>) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch tasks';
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.data = state.data.filter((t) => t._id !== action.payload);
      });
  },
});

export default tasksSlice.reducer;
