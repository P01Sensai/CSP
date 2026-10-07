import { useState, useEffect } from "react";
import type { Kisan } from "../types";
import { getAllKisans, createKisan } from "../db/localDb";

export default function KisanPage() {
  const [kisans, setKisans] = useState<Kisan[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    fatherName: "",
    village: "",
    phone: "",
    accountNumber: "",
  });

  useEffect(() => {
    loadKisans();
  }, []);

  async function loadKisans() {
    const all = await getAllKisans();
    setKisans(all.sort((a, b) => a.name.localeCompare(b.name)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await createKisan({
      name: formData.name,
      fatherName: formData.fatherName,
      village: formData.village,
      phone: formData.phone || undefined,
      accountNumber: formData.accountNumber,
      tenantId: "default",
    });
    setShowForm(false);
    setFormData({ name: "", fatherName: "", village: "", phone: "", accountNumber: "" });
    loadKisans();
  }

  const filtered = kisans.filter(
    (k) =>
      k.name.toLowerCase().includes(search.toLowerCase()) ||
      k.village.toLowerCase().includes(search.toLowerCase()) ||
      k.accountNumber.includes(search)
  );

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">👨‍🌾 Kisan (Farmers)</h1>
          <p className="page-subtitle">Manage farmer accounts and khata</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          + Add Kisan
        </button>
      </div>

      <div className="page-body">
        <div style={{ marginBottom: 16 }}>
          <input
            className="form-input"
            type="text"
            placeholder="🔍  Search by name, village, or account number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: 400 }}
          />
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">👨‍🌾</div>
            <div className="empty-state-title">{kisans.length === 0 ? "No Kisans Registered" : "No results"}</div>
            <div className="empty-state-desc">
              {kisans.length === 0 ? "Add your first farmer to get started." : "Try a different search."}
            </div>
          </div>
        ) : (
          <div style={{ borderRadius: "var(--radius-lg)", overflow: "hidden", border: "1px solid var(--border-color)" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Account #</th>
                  <th>Name</th>
                  <th>Father's Name</th>
                  <th>Village</th>
                  <th>Phone</th>
                  <th>Sync</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((k) => (
                  <tr key={k.id}>
                    <td style={{ fontWeight: 600, color: "var(--accent-purple)" }}>{k.accountNumber}</td>
                    <td style={{ fontWeight: 600 }}>{k.name}</td>
                    <td>{k.fatherName}</td>
                    <td>{k.village}</td>
                    <td>{k.phone || "—"}</td>
                    <td>
                      <span className={`badge ${k.syncStatus === "synced" ? "badge-synced" : "badge-unsynced"}`}>
                        {k.syncStatus === "synced" ? "✓" : "⏳"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">👨‍🌾 Add New Kisan</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Kisan Name *</label>
                  <input
                    className="form-input"
                    type="text"
                    placeholder="Full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    autoFocus
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Father's Name *</label>
                  <input
                    className="form-input"
                    type="text"
                    placeholder="Father's name"
                    value={formData.fatherName}
                    onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Village *</label>
                  <input
                    className="form-input"
                    type="text"
                    placeholder="Village name"
                    value={formData.village}
                    onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input
                    className="form-input"
                    type="tel"
                    placeholder="Mobile number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Account / Khata Number *</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="Unique account number"
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                  required
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  💾 Save Kisan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
