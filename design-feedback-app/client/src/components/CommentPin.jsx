import { useState } from 'react';

export default function CommentPin({ comment, number, isNew, isActive, onClick }) {
  const [showTooltip, setShowTooltip] = useState(false);

  const resolved = comment?.is_resolved;

  return (
    <div
      className={`absolute z-10 ${isNew ? 'pin-pulse' : ''}`}
      style={{
        left: `${comment?.pin_x ?? 0}%`,
        top: `${comment?.pin_y ?? 0}%`,
        transform: 'translate(-50%, -50%)',
      }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
    >
      <div
        className={`
          w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
          cursor-pointer select-none transition-all border-2 border-white shadow-md
          ${isActive ? 'ring-2 ring-accent ring-offset-1' : ''}
          ${resolved ? 'bg-gray-400 text-white' : 'bg-accent text-white hover:bg-accent-hover'}
        `}
      >
        {number}
      </div>

      {showTooltip && comment?.content && !isActive && (
        <div className="absolute left-8 top-1/2 -translate-y-1/2 bg-navy text-white text-xs rounded-lg px-3 py-2 w-52 shadow-lg pointer-events-none z-20">
          <p className="font-semibold mb-0.5">{comment.author_name}</p>
          <p className="opacity-80 leading-snug">
            {comment.content.length > 60
              ? comment.content.slice(0, 60) + '...'
              : comment.content}
          </p>
        </div>
      )}
    </div>
  );
}
