import { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';

export default function CommentForm({ pinX, pinY, onSubmit, onCancel }) {
  const { user, signIn, clientId } = useAuth();
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !content.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit({ content: content.trim(), pin_x: pinX, pin_y: pinY });
    } finally {
      setSubmitting(false);
    }
  };

  // Position the form near the pin but keep it on-screen
  const formStyle = {
    position: 'absolute',
    left: `${pinX}%`,
    top: `${pinY}%`,
    transform: pinX > 60 ? 'translate(-110%, -50%)' : 'translate(20px, -50%)',
    zIndex: 30,
  };

  // Not signed in - show sign-in prompt
  if (!user) {
    return (
      <div style={formStyle} onClick={(e) => e.stopPropagation()}>
        <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-4 w-72">
          <p className="text-sm text-gray-600 mb-3">Sign in with Google to leave a comment</p>
          {clientId && (
            <GoogleLogin
              onSuccess={(response) => signIn(response.credential)}
              onError={() => {}}
              size="medium"
              theme="outline"
            />
          )}
          <button
            onClick={onCancel}
            className="mt-3 text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={formStyle} onClick={(e) => e.stopPropagation()}>
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-xl border border-gray-200 p-4 w-72"
      >
        <div className="flex items-center gap-2 mb-3">
          <img
            src={user.picture}
            alt=""
            className="w-6 h-6 rounded-full"
            referrerPolicy="no-referrer"
          />
          <span className="text-sm font-medium text-navy">{user.name}</span>
        </div>
        <textarea
          placeholder="Leave a comment..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-3 resize-none focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
          autoFocus
          required
        />
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={submitting || !content.trim()}
            className="flex-1 bg-accent text-white text-sm font-medium py-2 rounded-lg hover:bg-accent-hover disabled:opacity-50 transition-colors"
          >
            {submitting ? 'Posting...' : 'Submit'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 border border-gray-300 text-gray-600 text-sm font-medium py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
