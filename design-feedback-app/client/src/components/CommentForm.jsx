import { useState } from 'react';

export default function CommentForm({ pinX, pinY, onSubmit, onCancel }) {
  const [authorName, setAuthorName] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!authorName.trim() || !content.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit({ author_name: authorName.trim(), content: content.trim(), pin_x: pinX, pin_y: pinY });
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

  return (
    <div style={formStyle} onClick={(e) => e.stopPropagation()}>
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-xl border border-gray-200 p-4 w-72"
      >
        <input
          type="text"
          placeholder="Your name"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
          autoFocus
          required
        />
        <textarea
          placeholder="Leave a comment..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-3 resize-none focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
          required
        />
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={submitting || !authorName.trim() || !content.trim()}
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
