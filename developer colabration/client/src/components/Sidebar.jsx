import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { LayoutDashboard, LogOut, Code2, User } from "lucide-react";

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="w-72 bg-[#0c0c0e] border-r border-white/5 flex flex-col h-full relative z-20">
      <div className="p-8 flex items-center gap-4 mb-2">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 rotate-3">
          <Code2 className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-xl font-black tracking-tighter text-white uppercase italic">
          FORGE<span className="text-blue-500">.</span>
        </h1>
      </div>

      <div className="px-6 py-8 mx-4 glass mb-8 rounded-3xl border-white/10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-black text-white shadow-xl shadow-blue-500/10 text-lg">
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="font-bold text-gray-100 truncate">{user?.username}</p>
            <p className="text-[10px] text-blue-500 font-extrabold uppercase tracking-widest opacity-80 mt-0.5 italic">Verified Architect</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        <p className="px-4 text-[10px] font-extrabold text-gray-600 uppercase tracking-[0.2em] mb-4">Main Navigation</p>
        <Link
          to="/"
          className={`group flex items-center gap-3 px-6 py-4 rounded-2xl transition-all duration-300 ${
            isActive("/") 
            ? "bg-blue-600/10 text-blue-500 border border-blue-500/20 shadow-xl shadow-blue-500/5 font-bold" 
            : "text-gray-500 hover:bg-white/5 hover:text-gray-300"
          }`}
        >
          <LayoutDashboard className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive("/") ? "text-blue-500" : "text-gray-600"}`} />
          <span>Dashboard</span>
        </Link>
      </nav>

      <div className="p-4 mt-auto">
        <button
          onClick={logout}
          className="w-full flex items-center justify-between px-6 py-4 rounded-2xl text-gray-500 hover:bg-red-500/5 hover:text-red-400 border border-transparent hover:border-red-500/10 transition-all font-bold group"
        >
          <div className="flex items-center gap-3">
            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span>Terminate Session</span>
          </div>
        </button>
      </div>
    </div>
  );
}

