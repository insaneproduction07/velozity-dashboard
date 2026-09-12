import { useState, useEffect, useCallback } from 'react';
import type { Comment, User } from '../types';
import { taskApi } from '../services/api';

interface CommentSectionProps {
  taskId: string;
  currentUserId: string;
}

export function CommentSection({ taskId, currentUserId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await taskApi.getComments(taskId);
      if (response.data.success && response.data.data) {
        setComments(response.data.data.items);
      }
    } catch (err) {
      console.error('Failed to load comments:', err);
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    setError('');
    setSubmitting(true);
    
    try {
      const response = await taskApi.createComment(taskId, newComment.trim());
      if (response.data.success && response.data.data) {
        setComments(prev => [response.data.data!, ...prev]);
        setNewComment('');
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-gray-100 rounded"></div>
          <div className="h-12 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Comments</h3>
      </div>

      {error && (
        <div className="p-2 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No comments yet. Be the first to comment!
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  {comment.author.avatarUrl ? (
                    <img src={comment.author.avatarUrl} alt={comment.author.name} className="w-8 h-8 rounded-full" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                      {comment.author.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{comment.author.name}</p>
                      <p className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                  <p className="text-gray-700 mt-1 whitespace-pre-wrap">{comment.content}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="mt-4">
        {error && (
          <div className="p-2 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm mb-3">
            {error}
          </div>
        )}
        <div className="flex items-start space-x-3">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            rows={3}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            disabled={submitting}
          />
          <button
            type="submit"
            disabled={submitting || !newComment.trim()}
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Posting...' : 'Comment'}
          </button>
        </div>
      </form>
    </div>
  );
}