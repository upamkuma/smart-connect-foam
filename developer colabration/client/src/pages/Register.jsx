import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { Github } from "lucide-react";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const register = useAuthStore((state) => state.register);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(username, email, password);
    } catch (err) {
      setError(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-[#0c0c0e]">
      {/* Background Orbs */}
      <div className="absolute top-0 -right-20 w-80 h-80 bg-purple-500/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-0 -left-20 w-80 h-80 bg-blue-500/10 blur-[120px] rounded-full" />

      <div className="max-w-md w-full glass p-10 rounded-[32px] border border-white/5 shadow-2xl animate-fade-in relative z-10">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 mb-6 -rotate-3">
             <Github className="w-9 h-9 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold text-white text-center tracking-tight">Create Identity</h2>
          <p className="text-gray-500 mt-2 text-sm font-medium">Join the global elite network</p>
        </div>

        {error && (
          <div className="bg-red-500/10 text-red-400 p-4 rounded-2xl mb-6 text-xs font-bold border border-red-500/20 text-center uppercase tracking-widest">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest px-1">Pseudonym (Username)</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-5 py-3.5 bg-white/5 border border-white/5 rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:bg-white/10 text-white outline-none transition-all placeholder:text-gray-700"
              placeholder="e.g. arch_master"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest px-1">Network Entry (Email)</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-5 py-3.5 bg-white/5 border border-white/5 rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:bg-white/10 text-white outline-none transition-all placeholder:text-gray-700"
              placeholder="dev@source.com"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest px-1">Passphrase (Password)</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-5 py-3.5 bg-white/5 border border-white/5 rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:bg-white/10 text-white outline-none transition-all placeholder:text-gray-700"
              placeholder="min. 6 characters"
            />
          </div>
          <button type="submit" className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-500/20 mt-4 active:scale-[0.98]">
            Initialize & Register
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-white/5 flex flex-col items-center gap-4">
          <p className="text-gray-500 text-sm font-medium">
            Already verified? <Link to="/login" className="text-blue-400 hover:text-blue-300 transition-colors font-bold underline underline-offset-4">Sign in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

