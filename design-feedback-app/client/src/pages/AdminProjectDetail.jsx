import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getProject,
  uploadAsset,
  getComments,
  createComment,
  deleteProject,
} from '../api/client';
import ImageViewer from '../components/ImageViewer';
import SidePanel from '../components/SidePanel';
import ShareLink from '../components/ShareLink';
import UserMenu from '../components/UserMenu';

export default function AdminProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [comments, setComments] = useState([]);
  const [activeComment, setActiveComment] = useState(null);
  const [showResolved, setShowResolved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  const asset = project?.assets?.[0] || null;

  const loadProject = useCallback(async () => {
    try {
      const data = await getProject(id);
      setProject(data);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const loadComments = useCallback(async () => {
    if (!asset) return;
    const data = await getComments(asset.id);
    setComments(data);
    // Update active comment if it's still in the list
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

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await uploadAsset(id, file);
      await loadProject();
    } finally {
      setUploading(false);
    }
  };

  const handleCommentSubmit = async (data) => {
    await createComment(asset.id, data);
    await loadComments();
  };

  const handlePinClick = (comment) => {
    setActiveComment(comment);
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this project and all its data?')) return;
    await deleteProject(id);
    navigate('/admin');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <p className="text-gray-500 text-sm">Project not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin')}
              className="text-gray-400 hover:text-navy text-sm transition-colors"
            >
              &larr; Back
            </button>
            <div>
              <h1 className="text-lg font-bold text-navy">{project.name}</h1>
              <p className="text-xs text-gray-500">{project.client_name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <UserMenu />
            <label className="bg-accent text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-accent-hover transition-colors cursor-pointer">
              {uploading ? 'Uploading...' : 'Upload Image'}
              <input
                type="file"
                accept=".png,.jpg,.jpeg,.webp"
                onChange={handleUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
            <button
              onClick={handleDelete}
              className="border border-red-200 text-red-500 text-sm font-medium px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </header>

      {/* Share link */}
      <div className="max-w-[1400px] mx-auto px-6 py-3">
        <ShareLink shareToken={project.share_token} />
      </div>

      {/* Main content */}
      <div className="max-w-[1400px] mx-auto px-6 pb-8 flex gap-0">
        {/* Image viewer */}
        <div className={`${activeComment ? 'w-[70%]' : 'w-full'} transition-all`}>
          {/* Resolved toggle */}
          {comments.some((c) => c.is_resolved) && (
            <div className="mb-3">
              <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showResolved}
                  onChange={(e) => setShowResolved(e.target.checked)}
                  className="rounded border-gray-300"
                />
                Show resolved comments
              </label>
            </div>
          )}

          <ImageViewer
            asset={asset}
            comments={comments}
            activeCommentId={activeComment?.id}
            showResolved={showResolved}
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
              isAdmin={true}
              onClose={() => setActiveComment(null)}
              onUpdate={loadComments}
            />
          </div>
        )}
      </div>
    </div>
  );
}
