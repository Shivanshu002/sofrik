import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Task } from '../../types';

interface TasksState {
  data: Task[];
  loading: boolean;
  error: string | null;
}

const initialState: TasksState = { data: [], loading: false, error: null };

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    fetchTasksStart(state) { state.loading = true; state.error = null; },
    fetchTasksSuccess(state, action: PayloadAction<Task[]>) {
      state.loading = false;
      state.data = action.payload;
    },
    fetchTasksFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    removeTask(state, action: PayloadAction<string>) {
      state.data = state.data.filter((t) => t._id !== action.payload);
    },
  },
});

export const { fetchTasksStart, fetchTasksSuccess, fetchTasksFailure, removeTask } = tasksSlice.actions;
export default tasksSlice.reducer;
