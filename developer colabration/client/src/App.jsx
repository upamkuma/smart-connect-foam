import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import RepoView from "./pages/RepoView";
import Sidebar from "./components/Sidebar";

function App() {
  const { user } = useAuthStore();

  return (
    <Router>
      <div className="flex h-screen bg-[#0c0c0e] text-white">
        {user && <Sidebar />}
        <div className="flex-1 overflow-hidden relative">
          <Routes>
            <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
            <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
            <Route path="/" element={user ? <Dashboard /> : <Navigate to="/login" />} />
            <Route path="/repo/:id" element={user ? <RepoView /> : <Navigate to="/login" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;

