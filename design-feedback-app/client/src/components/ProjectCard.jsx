import { Link } from 'react-router-dom';

export default function ProjectCard({ project }) {
  return (
    <Link
      to={`/admin/projects/${project.id}`}
      className="block bg-white rounded-xl border border-gray-200 hover:border-accent/30 hover:shadow-md transition-all overflow-hidden"
    >
      {/* Thumbnail */}
      <div className="aspect-video bg-gray-100 overflow-hidden">
        {project.thumbnail ? (
          <img
            src={`/api/uploads/${project.thumbnail}`}
            alt={project.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold text-navy text-sm">{project.name}</h3>
        <p className="text-xs text-gray-500 mt-0.5">{project.client_name}</p>
        <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
          <span>{project.comment_count || 0} comments</span>
          <span>{new Date(project.created_at + 'Z').toLocaleDateString()}</span>
        </div>
      </div>
    </Link>
  );
}
