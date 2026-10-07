import { BrowserRouter, Routes, Route, NavLink, useLocation } from "react-router-dom";
import "./index.css";
import Dashboard from "./pages/Dashboard";
import Approvals from "./pages/Approvals";

function Sidebar() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon" style={{ background: "linear-gradient(135deg, var(--accent-green), var(--accent-blue))" }}>👑</div>
          <div>
            <div className="sidebar-brand-text">Owner Portal</div>
            <div className="sidebar-brand-sub">शीत भंडार Management</div>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section-title">Overview</div>
        <NavLink to="/" className={`sidebar-link ${isActive("/") ? "active" : ""}`}>
          <span className="sidebar-link-icon">📈</span>
          Live Dashboard
        </NavLink>
        
        <div className="sidebar-section-title">Maker-Checker</div>
        <NavLink to="/approvals" className={`sidebar-link ${isActive("/approvals") ? "active" : ""}`}>
          <span className="sidebar-link-icon">✅</span>
          Pending Approvals
        </NavLink>

        <div className="sidebar-section-title">Management</div>
        <button className="sidebar-link">
          <span className="sidebar-link-icon">👥</span>
          Staff & PCs
        </button>
        <button className="sidebar-link">
          <span className="sidebar-link-icon">⚙️</span>
          Settings
        </button>
      </nav>
      
      <div className="sync-status">
        <span className="sync-dot online"></span>
        Connected to Cloud DB
      </div>
    </aside>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/approvals" element={<Approvals />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
