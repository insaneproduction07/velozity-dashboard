import { useEffect, useState, useCallback } from 'react';
import type { Task, Comment, Activity } from '../types';
import { socketService } from '../services/socket';
import { useAuth } from '../context/AuthContext';

export function useSocket() {
  const { user } = useAuth();
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (user) {
      const token = localStorage.getItem('accessToken');
      if (token) {
        socketService.connect(token);
      }
    } else {
      socketService.disconnect();
    }

    const checkConnection = setInterval(() => {
      setConnected(socketService.isConnected());
    }, 2000);

    return () => {
      clearInterval(checkConnection);
    };
  }, [user]);

  const joinProject = useCallback((projectId: string) => {
    socketService.joinProject(projectId);
  }, []);

  const leaveProject = useCallback((projectId: string) => {
    socketService.leaveProject(projectId);
  }, []);

  const onTaskCreated = useCallback((callback: (task: any) => void) => {
    return socketService.on('task:created', callback);
  }, []);

  const onTaskUpdated = useCallback((callback: (task: any) => void) => {
    return socketService.on('task:updated', callback);
  }, []);

  const onTaskAssigned = useCallback((callback: (task: any, assignee: any) => void) => {
    return socketService.on('task:assigned', callback);
  }, []);

  const onCommentAdded = useCallback((callback: (comment: any) => void) => {
    return socketService.on('comment:added', callback);
  }, []);

  const onActivityNew = useCallback((callback: (activity: any) => void) => {
    return socketService.on('activity:new', callback);
  }, []);

  return {
    connected,
    joinProject,
    leaveProject,
    onTaskCreated,
    onTaskUpdated,
    onTaskAssigned,
    onCommentAdded,
    onActivityNew,
  };
}