import axios from 'axios';

export const BASE_URL = 'http://localhost:3001/api/';
const TIMEOUT_MS = 50000;

const instance = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT_MS,
  headers: { 'Content-Type': 'application/json' },
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

instance.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const doGet = (url: string, params?: object) =>
  instance.get(url, { params });

export const doPost = (url: string, body?: object) =>
  instance.post(url, body);

export const doPut = (url: string, body?: object) =>
  instance.put(url, body);

export const doPatch = (url: string, body?: object) =>
  instance.patch(url, body);

export const doDelete = (url: string) =>
  instance.delete(url);

export default instance;
