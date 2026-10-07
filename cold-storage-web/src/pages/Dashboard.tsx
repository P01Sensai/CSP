export default function Dashboard() {
  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Live Dashboard</h1>
          <p className="page-subtitle">Real-time overview from the cloud backend</p>
        </div>
      </div>

      <div className="page-body">
        <div className="stat-grid">
          <div className="stat-card blue">
            <div className="stat-label">Total Bags Inside</div>
            <div className="stat-value">45,210</div>
            <div className="stat-change">↑ 1,200 today</div>
          </div>

          <div className="stat-card green">
            <div className="stat-label">Total Capacity</div>
            <div className="stat-value">62%</div>
            <div className="stat-change">Overall Occupancy</div>
          </div>

          <div className="stat-card amber">
            <div className="stat-label">Pending Reviews</div>
            <div className="stat-value">5</div>
            <div className="stat-change">Slips need approval</div>
          </div>
        </div>

        <div className="card" style={{ marginTop: 24 }}>
          <h3 style={{ marginBottom: 16 }}>Live Activity Feed</h3>
          <div style={{ color: "var(--text-secondary)", fontSize: 13 }}>
            <p style={{ padding: "12px 0", borderBottom: "1px solid var(--border-color)" }}>
              🟢 <strong>Munim PC 1</strong> synced 3 new Amad slips. (2 mins ago)
            </p>
            <p style={{ padding: "12px 0", borderBottom: "1px solid var(--border-color)" }}>
              🔴 <strong>Worker PC (Gate)</strong> is currently offline. (15 mins ago)
            </p>
            <p style={{ padding: "12px 0" }}>
              🟢 <strong>Munim PC 1</strong> synced 1 new Nikasi slip. (1 hour ago)
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
