import { doPost } from '../../services';
import { Routes } from '../../utils/routes';
import { loginStart, loginSuccess, loginFailure, registStart, registSuccess, registFailure } from '../slices/authSlice';

export const loginUser =
  (email: string, password: string, onSuccess?: () => void) =>
  async (dispatch: any) => {
    try {
      dispatch(loginStart());
      const res = await doPost(Routes.url.auth.login, { email, password });
      dispatch(loginSuccess(res.data));
      onSuccess?.();
    } catch (error: any) {
      dispatch(loginFailure(error?.response?.data?.message || 'Invalid credentials'));
    }
  };

export const registerUser =
  (payload: { name: string; email: string; password: string }, onSuccess?: () => void) =>
  async (dispatch: any) => {
    try {
      dispatch(registStart());
      const res = await doPost(Routes.url.auth.register, payload);
      dispatch(registSuccess(res.data));
      onSuccess?.();
    } catch (error: any) {
      dispatch(registFailure(error?.response?.data?.message || 'Registration failed'));
    }
  };
