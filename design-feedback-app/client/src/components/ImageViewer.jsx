import { useState, useRef, useCallback } from 'react';
import CommentPin from './CommentPin';
import CommentForm from './CommentForm';

export default function ImageViewer({
  asset,
  comments = [],
  activeCommentId,
  showResolved = false,
  onPinClick,
  onCommentSubmit,
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [newPin, setNewPin] = useState(null); // { x, y }
  const containerRef = useRef(null);

  const handleImageClick = useCallback(
    (e) => {
      if (!imageLoaded) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pinX = ((e.clientX - rect.left) / rect.width) * 100;
      const pinY = ((e.clientY - rect.top) / rect.height) * 100;
      setNewPin({ x: pinX, y: pinY });
    },
    [imageLoaded]
  );

  const handleCommentSubmit = async (data) => {
    await onCommentSubmit?.(data);
    setNewPin(null);
  };

  const visibleComments = showResolved
    ? comments
    : comments.filter((c) => !c.is_resolved);

  if (!asset) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
        <p className="text-gray-400 text-sm">No image uploaded yet</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative cursor-crosshair select-none"
      onClick={handleImageClick}
    >
      <img
        src={`/api/uploads/${asset.filename}`}
        alt={asset.original_name}
        className="w-full h-auto rounded-lg"
        onLoad={() => setImageLoaded(true)}
        draggable={false}
      />

      {!imageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <p className="text-gray-400 text-sm">Loading image...</p>
        </div>
      )}

      {/* Existing pins */}
      {imageLoaded &&
        visibleComments.map((comment) => (
          <CommentPin
            key={comment.id}
            comment={comment}
            number={comment.pin_number}
            isActive={activeCommentId === comment.id}
            onClick={() => onPinClick?.(comment)}
          />
        ))}

      {/* New pin being placed */}
      {imageLoaded && newPin && (
        <>
          <CommentPin
            comment={{ pin_x: newPin.x, pin_y: newPin.y }}
            number="+"
            isNew
          />
          <CommentForm
            pinX={newPin.x}
            pinY={newPin.y}
            onSubmit={handleCommentSubmit}
            onCancel={() => setNewPin(null)}
          />
        </>
      )}
    </div>
  );
}
