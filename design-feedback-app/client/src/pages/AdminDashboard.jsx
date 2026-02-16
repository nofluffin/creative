import { useState, useEffect } from 'react';
import { getProjects, createProject } from '../api/client';
import ProjectCard from '../components/ProjectCard';
import UserMenu from '../components/UserMenu';

export default function AdminDashboard() {
  const [projects, setProjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [clientName, setClientName] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const loadProjects = async () => {
    try {
      const data = await getProjects();
      setProjects(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim() || !clientName.trim()) return;
    setCreating(true);
    try {
      await createProject({ name: name.trim(), client_name: clientName.trim() });
      setName('');
      setClientName('');
      setShowForm(false);
      await loadProjects();
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-lg font-bold text-navy">No Fluff</h1>
          <div className="flex items-center gap-4">
            <UserMenu />
            <button
              onClick={() => setShowForm(true)}
              className="bg-accent text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-accent-hover transition-colors"
            >
              + New Project
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Create form modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
              <h2 className="text-lg font-bold text-navy mb-4">Create New Project</h2>
              <form onSubmit={handleCreate}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  placeholder="e.g. Homepage Redesign"
                  autoFocus
                  required
                />
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client Name
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-6 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  placeholder="e.g. Acme Corp"
                  required
                />
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={creating}
                    className="flex-1 bg-accent text-white text-sm font-medium py-2.5 rounded-lg hover:bg-accent-hover disabled:opacity-50 transition-colors"
                  >
                    {creating ? 'Creating...' : 'Create Project'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 border border-gray-300 text-gray-600 text-sm font-medium py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Projects grid */}
        {loading ? (
          <div className="text-center py-20 text-gray-400 text-sm">Loading projects...</div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-sm mb-4">No projects yet</p>
            <button
              onClick={() => setShowForm(true)}
              className="text-accent text-sm font-medium hover:underline"
            >
              Create your first project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
