import { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { createReply, resolveComment } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function SidePanel({ comment, pinNumber, isAdmin, onClose, onUpdate }) {
  const { user, signIn, clientId } = useAuth();
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!comment) return null;

  const handleReply = async (e) => {
    e.preventDefault();
    if (!user || !replyContent.trim()) return;
    setSubmitting(true);
    try {
      await createReply(comment.id, {
        content: replyContent.trim(),
      });
      setReplyContent('');
      onUpdate?.();
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolve = async () => {
    await resolveComment(comment.id);
    onUpdate?.();
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr + 'Z');
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <div className="w-full h-full bg-white border-l border-gray-200 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-accent text-white text-xs font-bold flex items-center justify-center">
            {pinNumber}
          </span>
          {comment.author_avatar && (
            <img
              src={comment.author_avatar}
              alt=""
              className="w-6 h-6 rounded-full"
              referrerPolicy="no-referrer"
            />
          )}
          <span className="font-semibold text-sm text-navy">{comment.author_name}</span>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-lg leading-none"
        >
          &times;
        </button>
      </div>

      {/* Comment body */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="mb-4">
          <p className="text-sm text-gray-800 leading-relaxed">{comment.content}</p>
          <p className="text-xs text-gray-400 mt-1">{formatDate(comment.created_at)}</p>
          {comment.is_resolved ? (
            <span className="inline-block mt-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
              Resolved
            </span>
          ) : null}
        </div>

        {isAdmin && (
          <button
            onClick={handleResolve}
            className={`text-xs font-medium mb-4 px-3 py-1.5 rounded-lg border transition-colors ${
              comment.is_resolved
                ? 'border-gray-300 text-gray-500 hover:bg-gray-50'
                : 'border-green-300 text-green-700 hover:bg-green-50'
            }`}
          >
            {comment.is_resolved ? 'Unresolve' : 'Mark as Resolved'}
          </button>
        )}

        {/* Replies */}
        {comment.replies?.length > 0 && (
          <div className="border-t border-gray-100 pt-3 space-y-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Replies ({comment.replies.length})
            </p>
            {comment.replies.map((reply) => (
              <div key={reply.id} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-1.5 mb-0.5">
                  {reply.author_avatar && (
                    <img
                      src={reply.author_avatar}
                      alt=""
                      className="w-4 h-4 rounded-full"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  <p className="text-xs font-semibold text-navy">{reply.author_name}</p>
                </div>
                <p className="text-sm text-gray-700 mt-0.5 leading-relaxed">{reply.content}</p>
                <p className="text-xs text-gray-400 mt-1">{formatDate(reply.created_at)}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reply form */}
      {user ? (
        <form onSubmit={handleReply} className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <img
              src={user.picture}
              alt=""
              className="w-5 h-5 rounded-full"
              referrerPolicy="no-referrer"
            />
            <span className="text-xs font-medium text-navy">{user.name}</span>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Write a reply..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              required
            />
            <button
              type="submit"
              disabled={submitting || !replyContent.trim()}
              className="bg-accent text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-accent-hover disabled:opacity-50 transition-colors"
            >
              Reply
            </button>
          </div>
        </form>
      ) : (
        <div className="p-4 border-t border-gray-100">
          <p className="text-xs text-gray-500 mb-2">Sign in to reply</p>
          {clientId && (
            <GoogleLogin
              onSuccess={(response) => signIn(response.credential)}
              onError={() => {}}
              size="small"
              theme="outline"
            />
          )}
        </div>
      )}
    </div>
  );
}
