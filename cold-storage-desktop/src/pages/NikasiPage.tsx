import { useState, useEffect } from "react";
import type { NikasiSlip, AmadSlip } from "../types";
import { getAllNikasiSlips, getAllAmadSlips, createNikasiSlip } from "../db/localDb";

export default function NikasiPage() {
  const [slips, setSlips] = useState<NikasiSlip[]>([]);
  const [amadSlips, setAmadSlips] = useState<AmadSlip[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    amadSlipId: "",
    bagsRemoved: "",
    remarks: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [nikasiSlips, allAmad] = await Promise.all([getAllNikasiSlips(), getAllAmadSlips()]);
    setSlips(nikasiSlips.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    setAmadSlips(allAmad.filter((s) => s.status === "approved"));
  }

  const selectedAmad = amadSlips.find((a) => a.id === formData.amadSlipId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedAmad) return;

    const bagsRemoved = parseInt(formData.bagsRemoved);
    const remaining = selectedAmad.totalBags - bagsRemoved;

    await createNikasiSlip({
      amadSlipId: selectedAmad.id,
      kisanId: selectedAmad.kisanId,
      kisanName: selectedAmad.kisanName,
      roomId: selectedAmad.roomId,
      roomName: selectedAmad.roomName,
      slotNumber: selectedAmad.slotNumber,
      bagsRemoved,
      remainingBags: remaining,
      exitDate: new Date().toISOString().split("T")[0],
      remarks: formData.remarks || undefined,
      status: "pending_approval",
      createdBy: "munim-local",
      tenantId: "default",
    });

    setShowForm(false);
    setFormData({ amadSlipId: "", bagsRemoved: "", remarks: "" });
    loadData();
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">📤 Nikasi (Outward)</h1>
          <p className="page-subtitle">Record bags going out to farmers</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          + New Nikasi Slip
        </button>
      </div>

      <div className="page-body">
        {slips.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📤</div>
            <div className="empty-state-title">No Nikasi Slips Yet</div>
            <div className="empty-state-desc">
              Click "New Nikasi Slip" to record an outward exit. You need approved Amad slips first.
            </div>
          </div>
        ) : (
          <div style={{ borderRadius: "var(--radius-lg)", overflow: "hidden", border: "1px solid var(--border-color)" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Slip #</th>
                  <th>Kisan</th>
                  <th>Amad Ref</th>
                  <th>Room</th>
                  <th>Bags Out</th>
                  <th>Remaining</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {slips.map((slip) => (
                  <tr key={slip.id}>
                    <td style={{ fontWeight: 600, color: "var(--accent-green)" }}>{slip.slipNumber}</td>
                    <td>{slip.kisanName}</td>
                    <td style={{ color: "var(--accent-blue)" }}>{slip.amadSlipId.slice(0, 8)}...</td>
                    <td>{slip.roomName}</td>
                    <td style={{ fontWeight: 700 }}>{slip.bagsRemoved}</td>
                    <td>{slip.remainingBags}</td>
                    <td>{slip.exitDate}</td>
                    <td>
                      <span className={`badge ${slip.status === "approved" ? "badge-approved" : "badge-pending"}`}>
                        {slip.status === "approved" ? "✓ Approved" : "⏳ Pending"}
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
            <h2 className="modal-title">📤 New Nikasi (Outward) Slip</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Select Amad Slip (Inward Reference) *</label>
                <select
                  className="form-select"
                  value={formData.amadSlipId}
                  onChange={(e) => setFormData({ ...formData, amadSlipId: e.target.value })}
                  required
                >
                  <option value="">Select approved Amad slip...</option>
                  {amadSlips.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.slipNumber} — {a.kisanName} — {a.totalBags} bags ({a.cropType})
                    </option>
                  ))}
                </select>
              </div>

              {selectedAmad && (
                <div className="card" style={{ marginBottom: 16, background: "var(--bg-input)" }}>
                  <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                    <strong>Kisan:</strong> {selectedAmad.kisanName} &nbsp;|&nbsp;
                    <strong>Room:</strong> {selectedAmad.roomName} &nbsp;|&nbsp;
                    <strong>Slot:</strong> {selectedAmad.slotNumber} &nbsp;|&nbsp;
                    <strong>Total Bags:</strong> {selectedAmad.totalBags}
                  </p>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Bags to Remove *</label>
                <input
                  className="form-input"
                  type="number"
                  min="1"
                  max={selectedAmad?.totalBags}
                  placeholder="How many bags going out?"
                  value={formData.bagsRemoved}
                  onChange={(e) => setFormData({ ...formData, bagsRemoved: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Remarks</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="Any notes..."
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  💾 Save Nikasi Slip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
