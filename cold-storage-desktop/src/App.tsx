import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, NavLink, useLocation } from "react-router-dom";
import "./index.css";
import Dashboard from "./pages/Dashboard";
import AmadPage from "./pages/AmadPage";
import NikasiPage from "./pages/NikasiPage";
import KisanPage from "./pages/KisanPage";
import RoomsPage from "./pages/RoomsPage";
import LoginPage from "./pages/LoginPage";
import { startAutoSync } from "./db/syncEngine";
import { getSyncQueueCount } from "./db/localDb";

function Sidebar() {
  const location = useLocation();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingSync, setPendingSync] = useState(0);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Check pending sync count every 10s
    const interval = setInterval(async () => {
      const count = await getSyncQueueCount();
      setPendingSync(count);
    }, 10_000);

    // Initial check
    getSyncQueueCount().then(setPendingSync);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, []);

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">🏭</div>
          <div>
            <div className="sidebar-brand-text">Cold Storage ERP</div>
            <div className="sidebar-brand-sub">शीत भंडार</div>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section-title">Main</div>
        <NavLink to="/" className={`sidebar-link ${isActive("/") ? "active" : ""}`}>
          <span className="sidebar-link-icon">📊</span>
          Dashboard
        </NavLink>
        <NavLink to="/amad" className={`sidebar-link ${isActive("/amad") ? "active" : ""}`}>
          <span className="sidebar-link-icon">📥</span>
          Amad (Inward)
        </NavLink>
        <NavLink to="/nikasi" className={`sidebar-link ${isActive("/nikasi") ? "active" : ""}`}>
          <span className="sidebar-link-icon">📤</span>
          Nikasi (Outward)
        </NavLink>

        <div className="sidebar-section-title">Masters</div>
        <NavLink to="/kisans" className={`sidebar-link ${isActive("/kisans") ? "active" : ""}`}>
          <span className="sidebar-link-icon">👨‍🌾</span>
          Kisan (Farmers)
        </NavLink>
        <NavLink to="/rooms" className={`sidebar-link ${isActive("/rooms") ? "active" : ""}`}>
          <span className="sidebar-link-icon">🏠</span>
          Rooms / Chambers
        </NavLink>
      </nav>

      <div className="sync-status">
        <span className={`sync-dot ${isOnline ? (pendingSync > 0 ? "pending" : "online") : "offline"}`}></span>
        {isOnline
          ? pendingSync > 0
            ? `${pendingSync} pending sync`
            : "Synced ✓"
          : "Offline mode"}
      </div>
    </aside>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      startAutoSync((result) => {
        console.log(`Sync complete: ${result.synced} synced, ${result.failed} failed`);
      });
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<LoginPage onLogin={() => setIsAuthenticated(true)} isDesktop={true} />} />
        </Routes>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/amad" element={<AmadPage />} />
            <Route path="/nikasi" element={<NikasiPage />} />
            <Route path="/kisans" element={<KisanPage />} />
            <Route path="/rooms" element={<RoomsPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
