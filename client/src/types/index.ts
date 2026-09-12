export type Role = 'ADMIN' | 'PROJECT_MANAGER' | 'DEVELOPER';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE' | 'OVERDUE';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type ActivityType = 
  | 'PROJECT_CREATED'
  | 'TASK_CREATED'
  | 'TASK_UPDATED'
  | 'TASK_ASSIGNED'
  | 'TASK_STATUS_CHANGED'
  | 'COMMENT_ADDED';

export type NotificationType = 'TASK_ASSIGNED' | 'TASK_MOVED_TO_REVIEW';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: string;
  name: string;
  email: string | null;
  company: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  clientId: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  client: Client;
  owner: User;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  projectId: string;
  assigneeId: string | null;
  creatorId: string;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  assignee: User | null;
  creator: User;
}

export interface TaskComment {
  id: string;
  content: string;
  taskId: string;
  authorId: string;
  createdAt: string;
  author: User;
}

export interface Activity {
  id: string;
  type: ActivityType;
  message: string;
  userId: string;
  projectId: string;
  taskId: string | null;
  createdAt: string;
  user: User;
  task: Task | null;
  comment: TaskComment | null;
}

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  userId: string;
  taskId: string | null;
  projectId: string | null;
  readAt: string | null;
  createdAt: string;
  task: Task | null;
  project: Project | null;
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  clientId: string;
  ownerId?: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority: TaskPriority;
  assigneeId?: string;
  dueDate?: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
}

export interface AssignTaskRequest {
  assigneeId: string;
}

export interface CreateCommentRequest {
  content: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  avatarUrl?: string | null;
  role?: Role;
}

export interface CreateClientRequest {
  name: string;
  email?: string;
  company?: string;
}