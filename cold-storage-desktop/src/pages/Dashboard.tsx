import { useState, useEffect } from "react";
import { getAllAmadSlips, getAllNikasiSlips, getAllKisans, getAllRooms, getSyncQueueCount } from "../db/localDb";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalAmad: 0,
    totalNikasi: 0,
    totalKisans: 0,
    totalRooms: 0,
    pendingSync: 0,
    pendingApprovals: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    const [amadSlips, nikasiSlips, kisans, rooms, syncCount] = await Promise.all([
      getAllAmadSlips(),
      getAllNikasiSlips(),
      getAllKisans(),
      getAllRooms(),
      getSyncQueueCount(),
    ]);

    const pendingApprovals = amadSlips.filter((s) => s.status === "pending_approval").length;

    setStats({
      totalAmad: amadSlips.length,
      totalNikasi: nikasiSlips.length,
      totalKisans: kisans.length,
      totalRooms: rooms.length,
      pendingSync: syncCount,
      pendingApprovals,
    });
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Overview of today's cold storage operations</p>
        </div>
        <button className="btn btn-ghost" onClick={loadStats}>
          🔄 Refresh
        </button>
      </div>

      <div className="page-body">
        <div className="stat-grid">
          <div className="stat-card blue">
            <div className="stat-label">Total Amad (Inward)</div>
            <div className="stat-value">{stats.totalAmad}</div>
            <div className="stat-change">All time entries</div>
          </div>

          <div className="stat-card green">
            <div className="stat-label">Total Nikasi (Outward)</div>
            <div className="stat-value">{stats.totalNikasi}</div>
            <div className="stat-change">All time exits</div>
          </div>

          <div className="stat-card amber">
            <div className="stat-label">Pending Approvals</div>
            <div className="stat-value">{stats.pendingApprovals}</div>
            <div className="stat-change">Awaiting owner review</div>
          </div>

          <div className="stat-card red">
            <div className="stat-label">Pending Sync</div>
            <div className="stat-value">{stats.pendingSync}</div>
            <div className="stat-change">{navigator.onLine ? "Will sync shortly" : "Offline — queued"}</div>
          </div>
        </div>

        <div className="stat-grid">
          <div className="stat-card blue">
            <div className="stat-label">Registered Kisans</div>
            <div className="stat-value">{stats.totalKisans}</div>
            <div className="stat-change">Farmer accounts</div>
          </div>

          <div className="stat-card green">
            <div className="stat-label">Rooms / Chambers</div>
            <div className="stat-value">{stats.totalRooms}</div>
            <div className="stat-change">Storage chambers</div>
          </div>
        </div>

        {stats.totalAmad === 0 && stats.totalKisans === 0 && (
          <div className="empty-state" style={{ marginTop: 20 }}>
            <div className="empty-state-icon">🚀</div>
            <div className="empty-state-title">Welcome to Cold Storage ERP</div>
            <div className="empty-state-desc">
              Start by adding Rooms and Kisans (farmers), then create your first Amad (inward) slip.
            </div>
          </div>
        )}
      </div>
    </>
  );
}
