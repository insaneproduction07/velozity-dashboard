import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import type { 
  ApiResponse, 
  AuthResponse, 
  User, 
  Client, 
  Project, 
  Task, 
  Activity, 
  Comment, 
  Notification 
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let accessToken: string | null = null;
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (error: Error) => void;
}> = [];

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiResponse<unknown>>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await axios.post<ApiResponse<AuthResponse>>(
          `${API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newToken = refreshResponse.data.data?.accessToken;
        if (newToken) {
          setAccessToken(newToken);
          processQueue(null, newToken);
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          return api(originalRequest);
        }
      } catch {
        processQueue(new Error('Token refresh failed'), null);
        setAccessToken(null);
        window.location.href = '/login';
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export const authApi = {
  login: (email: string, password: string) =>
    api.post<ApiResponse<AuthResponse>>('/auth/login', { email, password }),
  register: (data: { name: string; email: string; password: string }) =>
    api.post<ApiResponse<AuthResponse>>('/auth/register', data),
  logout: () => api.post<ApiResponse<{ message: string }>>('/auth/logout'),
  refresh: () => api.post<ApiResponse<AuthResponse>>('/auth/refresh'),
  me: () => api.get<ApiResponse<User>>('/auth/me'),
};

export const userApi = {
  getAll: () => api.get<ApiResponse<User[]>>('/users'),
  getById: (id: string) => api.get<ApiResponse<User>>(`/users/${id}`),
  update: (id: string, data: Partial<User>) => api.patch<ApiResponse<User>>(`/users/${id}`, data),
};

export const clientApi = {
  getAll: () => api.get<ApiResponse<Client[]>>('/clients'),
  create: (data: { name: string; email?: string; company?: string }) =>
    api.post<ApiResponse<Client>>('/clients', data),
};

export const projectApi = {
  getAll: () => api.get<ApiResponse<Project[]>>('/projects'),
  getById: (id: string) => api.get<ApiResponse<Project>>(`/projects/${id}`),
  create: (data: { name: string; description?: string; clientId: string; ownerId?: string }) =>
    api.post<ApiResponse<Project>>('/projects', data),
  update: (id: string, data: { name?: string; description?: string; clientId?: string; ownerId?: string }) =>
    api.patch<ApiResponse<Project>>(`/projects/${id}`, data),
  delete: (id: string) => api.delete<ApiResponse<{ message: string }>>(`/projects/${id}`),
  getTasks: (projectId: string, params?: { page?: number; limit?: number; status?: string; assigneeId?: string }) =>
    api.get<ApiResponse<{ items: Task[]; page: number; limit: number; total: number }>>(
      `/projects/${projectId}/tasks`,
      { params }
    ),
  createTask: (projectId: string, data: { title: string; description?: string; priority: string; assigneeId?: string; dueDate?: string }) =>
    api.post<ApiResponse<Task>>(`/projects/${projectId}/tasks`, data),
  getActivity: (projectId: string, params?: { page?: number; limit?: number }) =>
    api.get<ApiResponse<{ items: Activity[]; page: number; limit: number; total: number }>>(
      `/projects/${projectId}/activity`,
      { params }
    ),
};

export const taskApi = {
  getById: (id: string) => api.get<ApiResponse<Task>>(`/tasks/${id}`),
  update: (id: string, data: { title?: string; description?: string; status?: string; priority?: string; dueDate?: string }) =>
    api.patch<ApiResponse<Task>>(`/tasks/${id}`, data),
  assign: (id: string, assigneeId: string) =>
    api.post<ApiResponse<Task>>(`/tasks/${id}/assign`, { assigneeId }),
  delete: (id: string) => api.delete<ApiResponse<{ message: string }>>(`/tasks/${id}`),
  getComments: (taskId: string, params?: { page?: number; limit?: number }) =>
    api.get<ApiResponse<{ items: Comment[]; page: number; limit: number; total: number }>>(
      `/tasks/${taskId}/comments`,
      { params }
    ),
  createComment: (taskId: string, content: string) =>
    api.post<ApiResponse<Comment>>(`/tasks/${taskId}/comments`, { content }),
};

export const notificationApi = {
  getAll: (params?: { page?: number; limit?: number; unreadOnly?: boolean }) =>
    api.get<ApiResponse<{ items: Notification[]; page: number; limit: number; total: number }>>(
      '/notifications',
      { params }
    ),
  markRead: (id: string) => api.patch<ApiResponse<Notification>>(`/notifications/${id}/read`),
  markAllRead: () => api.patch<ApiResponse<{ count: number }>>('/notifications/read-all'),
};

export default api;