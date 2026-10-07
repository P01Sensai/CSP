import { useNavigate } from "react-router-dom";

export default function LoginPage({ onLogin, isDesktop = false }: { onLogin: () => void, isDesktop?: boolean }) {
  const navigate = useNavigate();

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDesktop) {
      onLogin();
      navigate("/");
    } else {
      window.location.href = "http://localhost:5173";
    }
  };

  const handleWorkerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (isDesktop) {
      onLogin();
      navigate("/");
    } else {
      window.location.href = "http://localhost:1420";
    }
  };

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      width: "100vw",
      background: "radial-gradient(circle at top center, rgba(255, 255, 255, 0.05), transparent 60%), var(--bg-base)",
      position: "relative",
      overflow: "hidden"
    }}>
      <div style={{ zIndex: 10, width: "100%", maxWidth: 900, padding: 24, textAlign: "center" }}>
        
        <div style={{ marginBottom: 48 }}>
          <h1 className="page-title" style={{ fontSize: 42, marginBottom: 8 }}>Cold Storage ERP</h1>
          <p className="page-subtitle" style={{ fontSize: 16 }}>Select your portal to continue</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: 32 }}>
          
          {/* Worker / Munim Login Card */}
          <div className="card" style={{ padding: 40, position: "relative", overflow: "hidden", textAlign: "left" }}>
            <div style={{ position: "absolute", top: -50, right: -50, width: 150, height: 150, background: "var(--accent-lime)", filter: "blur(60px)", opacity: 0.2 }}></div>
            
            <div className="sidebar-brand-icon" style={{ marginBottom: 24, width: 56, height: 56, fontSize: 24 }}>🏭</div>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, color: "#fff" }}>Worker Terminal</h2>
            <p style={{ color: "var(--text-tertiary)", fontSize: 13, marginBottom: 32, fontFamily: "var(--font-mono)" }}>OFFLINE-FIRST MUNIM PC</p>
            
            <form onSubmit={handleWorkerLogin}>
              <div className="form-group">
                <label className="form-label">Terminal ID</label>
                <input type="text" className="form-input" defaultValue="Munim-1" required />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}>
                Login as Worker
              </button>
            </form>
          </div>

          {/* Admin / Owner Login Card */}
          <div className="card" style={{ padding: 40, position: "relative", overflow: "hidden", textAlign: "left" }}>
            <div style={{ position: "absolute", top: -50, right: -50, width: 150, height: 150, background: "var(--accent-cyan)", filter: "blur(60px)", opacity: 0.2 }}></div>
            
            <div className="sidebar-brand-icon" style={{ marginBottom: 24, width: 56, height: 56, fontSize: 24, background: "linear-gradient(135deg, var(--accent-cyan), var(--accent-pink))", boxShadow: "0 0 20px var(--accent-cyan-glow)" }}>👑</div>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, color: "#fff" }}>Owner Portal</h2>
            <p style={{ color: "var(--text-tertiary)", fontSize: 13, marginBottom: 32, fontFamily: "var(--font-mono)" }}>CLOUD ADMIN DASHBOARD</p>
            
            <form onSubmit={handleAdminLogin}>
              <div className="form-group">
                <label className="form-label">Admin Email</label>
                <input type="text" className="form-input" defaultValue="admin@coldstorage.com" required />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center", background: "var(--accent-cyan)", color: "#000", boxShadow: "0 4px 15px var(--accent-cyan-glow)" }}>
                Login as Admin
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
