import { useEffect, useState } from "react";
import axios from "axios";
import { useAuthStore } from "../store/useAuthStore";
import { Link } from "react-router-dom";
import { FolderGit2, Plus, Users, LayoutDashboard, Clock, ExternalLink } from "lucide-react";
import moment from "moment";

export default function Dashboard() {
  const { user } = useAuthStore();
  const [repos, setRepos] = useState({ owned: [], collaborated: [] });
  const [showModal, setShowModal] = useState(false);
  const [repoName, setRepoName] = useState("");
  const [repoDesc, setRepoDesc] = useState("");

  const fetchRepos = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/repos", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setRepos(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRepos();
  }, []);

  const handleCreateRepo = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "http://localhost:5000/api/repos",
        { name: repoName, description: repoDesc, isPublic: true },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setShowModal(false);
      setRepoName("");
      setRepoDesc("");
      fetchRepos();
    } catch (err) {
      console.error(err);
    }
  };

  const RepoCard = ({ repo, type }) => (
    <Link
      to={`/repo/${repo._id}`}
      className="glass-card p-6 rounded-2xl group relative overflow-hidden flex flex-col h-full"
    >
      {/* Accent Glow */}
      <div className={`absolute -right-16 -top-16 w-32 h-32 blur-3xl rounded-full opacity-10 transition-opacity group-hover:opacity-20 ${type === 'owned' ? 'bg-blue-500' : 'bg-purple-500'}`} />
      
      <div className="flex items-start justify-between mb-5 relative z-10">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl transition-transform group-hover:scale-110 duration-300 ${type === 'owned' ? 'bg-blue-500/10 text-blue-500' : 'bg-purple-500/10 text-purple-500'}`}>
            {type === 'owned' ? <LayoutDashboard className="w-6 h-6" /> : <Users className="w-6 h-6" />}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-100 group-hover:text-blue-400 transition-colors leading-tight">{repo.name}</h3>
            <p className="text-[11px] text-gray-500 uppercase tracking-widest mt-1 font-semibold">{type === 'owned' ? 'Personal' : 'Collaborated'}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
           <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${repo.isPublic ? 'border-green-500/20 text-green-500 bg-green-500/5' : 'border-orange-500/20 text-orange-500 bg-orange-500/5'}`}>
             {repo.isPublic ? "Public" : "Private"}
           </span>
        </div>
      </div>
      
      <p className="text-gray-400 text-sm mb-6 line-clamp-2 min-h-[40px] leading-relaxed relative z-10">{repo.description || "No description provided."}</p>
      
      <div className="mt-auto pt-5 border-t border-white/5 flex items-center justify-between text-[11px] relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center text-[10px] font-bold text-white uppercase overflow-hidden">
             {repo.owner.username.slice(0, 2)}
          </div>
          <span className="text-gray-500 font-medium tracking-tight">by <span className="text-gray-300">{repo.owner.username}</span></span>
        </div>
        <div className="flex items-center gap-1.5 text-gray-500">
          <Clock className="w-3 h-3" />
          <span>{moment(repo.createdAt).fromNow()}</span>
        </div>
      </div>
    </Link>
  );

  return (
    <div className="p-8 lg:p-12 max-w-7xl mx-auto min-h-full animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h1 className="text-4xl lg:text-5xl font-extrabold text-white mb-3 tracking-tight">
            Workspaces <span className="text-blue-500">.</span>
          </h1>
          <p className="text-gray-400 font-medium">Collaborate, architect, and deploy together.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-3 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3.5 rounded-2xl font-bold transition-all shadow-xl shadow-blue-500/10 hover:shadow-blue-500/20 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Create Repository
        </button>
      </div>

      <div className="space-y-12">
        <div>
          <h2 className="text-2xl font-semibold border-b border-gray-800 pb-4 mb-6 flex items-center gap-3">
            <FolderGit2 className="w-6 h-6 text-blue-400" />
            Owned by You
          </h2>
          {repos.owned.length === 0 ? (
            <div className="text-center py-12 bg-gray-900 rounded-2xl border border-gray-800 border-dashed">
              <p className="text-gray-500">You don't have any repositories yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {repos.owned.map((repo) => (
                <RepoCard key={repo._id} repo={repo} type="owned" />
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-semibold border-b border-gray-800 pb-4 mb-6 flex items-center gap-3">
            <Users className="w-6 h-6 text-purple-400" />
            Collaborations
          </h2>
          {repos.collaborated.length === 0 ? (
            <div className="text-center py-12 bg-gray-900 rounded-2xl border border-gray-800 border-dashed">
              <p className="text-gray-500">You are not a collaborator on any repositories.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {repos.collaborated.map((repo) => (
                <RepoCard key={repo._id} repo={repo} type="collab" />
              ))}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-[#0a0a0b]/80 backdrop-blur-md flex items-center justify-center z-50 p-6">
          <div className="glass p-8 rounded-3xl w-full max-w-md border border-white/5 shadow-2xl animate-fade-in">
            <h2 className="text-2xl font-bold text-white mb-2">Initialize Workspace</h2>
            <p className="text-gray-400 text-sm mb-8">Setup a new environment for your team to collaborate.</p>
            
            <form onSubmit={handleCreateRepo} className="space-y-6">
              <div>
                <label className="block text-[11px] font-extrabold text-gray-500 uppercase tracking-widest mb-2 px-1">Repository Name</label>
                <input
                  type="text"
                  value={repoName}
                  onChange={(e) => setRepoName(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-blue-500/50 focus:bg-white/10 outline-none transition-all placeholder:text-gray-600"
                  placeholder="e.g. system-architecture"
                />
              </div>
              <div>
                <label className="block text-[11px] font-extrabold text-gray-500 uppercase tracking-widest mb-2 px-1">Objective / Description</label>
                <textarea
                  value={repoDesc}
                  onChange={(e) => setRepoDesc(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-blue-500/50 focus:bg-white/10 outline-none transition-all min-h-[120px] placeholder:text-gray-600"
                  placeholder="What are we building today?"
                />
              </div>
              <div className="flex justify-end gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-2xl transition-colors font-bold text-sm"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl transition-all font-bold text-sm shadow-lg shadow-blue-500/20 active:scale-95"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

