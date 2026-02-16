import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { getReview, getComments, createComment } from '../api/client';
import ImageViewer from '../components/ImageViewer';
import SidePanel from '../components/SidePanel';

export default function ClientReview() {
  const { share_token } = useParams();

  const [project, setProject] = useState(null);
  const [comments, setComments] = useState([]);
  const [activeComment, setActiveComment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const asset = project?.assets?.[0] || null;

  const loadProject = useCallback(async () => {
    try {
      const data = await getReview(share_token);
      setProject(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [share_token]);

  const loadComments = useCallback(async () => {
    if (!asset) return;
    const data = await getComments(asset.id);
    setComments(data);
    if (activeComment) {
      const updated = data.find((c) => c.id === activeComment.id);
      if (updated) setActiveComment(updated);
      else setActiveComment(null);
    }
  }, [asset?.id, activeComment?.id]);

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  useEffect(() => {
    if (asset) loadComments();
  }, [asset?.id]);

  const handleCommentSubmit = async (data) => {
    await createComment(asset.id, data);
    await loadComments();
  };

  const handlePinClick = (comment) => {
    setActiveComment(comment);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading review...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-sm mb-2">This review link is invalid or has expired.</p>
          <p className="text-gray-400 text-xs">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-[1400px] mx-auto px-6 py-4">
          <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Design Review</p>
          <h1 className="text-lg font-bold text-navy">{project.name}</h1>
          <p className="text-sm text-gray-500">by {project.client_name}</p>
        </div>
      </header>

      {/* Instructions */}
      {!asset && (
        <div className="max-w-[1400px] mx-auto px-6 py-20 text-center">
          <p className="text-gray-400 text-sm">No design has been uploaded yet. Check back soon.</p>
        </div>
      )}

      {asset && (
        <div className="max-w-[1400px] mx-auto px-6 py-4">
          {comments.length === 0 && (
            <p className="text-xs text-gray-400 mb-3">
              Click anywhere on the image to leave a comment.
            </p>
          )}

          <div className="flex gap-0">
            {/* Image viewer */}
            <div className={`${activeComment ? 'w-[70%]' : 'w-full'} transition-all`}>
              <ImageViewer
                asset={asset}
                comments={comments}
                activeCommentId={activeComment?.id}
                showResolved={false}
                onPinClick={handlePinClick}
                onCommentSubmit={handleCommentSubmit}
              />
            </div>

            {/* Side panel */}
            {activeComment && (
              <div className="w-[30%] h-[calc(100vh-160px)] sticky top-4">
                <SidePanel
                  comment={activeComment}
                  pinNumber={activeComment.pin_number}
                  isAdmin={false}
                  onClose={() => setActiveComment(null)}
                  onUpdate={loadComments}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
