import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<Function>> = new Map();

  connect(token: string) {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    this.socket.on('socket:error', (error: { message: string }) => {
      console.warn('Socket error:', error.message);
    });

    this.socket.on('task:created', (data: { task: any }) => {
      this.emit('task:created', data.task);
    });

    this.socket.on('task:updated', (data: { task: any }) => {
      this.emit('task:updated', data.task);
    });

    this.socket.on('task:assigned', (data: { task: any; assignee: any }) => {
      this.emit('task:assigned', data.task, data.assignee);
    });

    this.socket.on('comment:added', (data: { comment: any }) => {
      this.emit('comment:added', data.comment);
    });

    this.socket.on('activity:new', (data: { activity: any }) => {
      this.emit('activity:new', data.activity);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinProject(projectId: string) {
    if (this.socket?.connected) {
      this.socket.emit('join:project', { projectId });
    }
  }

  leaveProject(projectId: string) {
    if (this.socket?.connected) {
      this.socket.emit('leave:project', { projectId });
    }
  }

  on<T>(event: string, callback: (data: T) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    return () => {
      this.off(event, callback);
    };
  }

  off<T>(event: string, callback: (data: T) => void) {
    this.listeners.get(event)?.delete(callback);
  }

  private emit<T>(event: string, data: T) {
    this.listeners.get(event)?.forEach((callback) => callback(data));
  }

  isConnected() {
    return this.socket?.connected ?? false;
  }
}

export const socketService = new SocketService();