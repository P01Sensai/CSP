import { useState, useEffect } from "react";
import type { AmadSlip, Kisan, Room } from "../types";
import { getAllAmadSlips, createAmadSlip, getAllKisans, getAllRooms } from "../db/localDb";

export default function AmadPage() {
  const [slips, setSlips] = useState<AmadSlip[]>([]);
  const [kisans, setKisans] = useState<Kisan[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    kisanId: "",
    roomId: "",
    slotNumber: "",
    totalBags: "",
    cropType: "",
    weightPerBag: "",
    ratePerBag: "",
    remarks: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [amadSlips, allKisans, allRooms] = await Promise.all([
      getAllAmadSlips(),
      getAllKisans(),
      getAllRooms(),
    ]);
    setSlips(amadSlips.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    setKisans(allKisans);
    setRooms(allRooms);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const selectedKisan = kisans.find((k) => k.id === formData.kisanId);
    const selectedRoom = rooms.find((r) => r.id === formData.roomId);

    if (!selectedKisan || !selectedRoom) return;

    await createAmadSlip({
      kisanId: formData.kisanId,
      kisanName: selectedKisan.name,
      roomId: formData.roomId,
      roomName: selectedRoom.name,
      slotNumber: formData.slotNumber,
      totalBags: parseInt(formData.totalBags),
      cropType: formData.cropType,
      weightPerBag: formData.weightPerBag ? parseFloat(formData.weightPerBag) : undefined,
      ratePerBag: formData.ratePerBag ? parseFloat(formData.ratePerBag) : undefined,
      totalWeight: formData.weightPerBag
        ? parseFloat(formData.weightPerBag) * parseInt(formData.totalBags)
        : undefined,
      entryDate: new Date().toISOString().split("T")[0],
      remarks: formData.remarks || undefined,
      status: "pending_approval",
      createdBy: "munim-local",
      tenantId: "default",
    });

    setShowForm(false);
    setFormData({ kisanId: "", roomId: "", slotNumber: "", totalBags: "", cropType: "", weightPerBag: "", ratePerBag: "", remarks: "" });
    loadData();
  }

  function getStatusBadge(status: string) {
    const map: Record<string, string> = {
      draft: "badge-draft",
      pending_approval: "badge-pending",
      approved: "badge-approved",
      rejected: "badge-rejected",
    };
    const labels: Record<string, string> = {
      draft: "Draft",
      pending_approval: "⏳ Pending",
      approved: "✓ Approved",
      rejected: "✗ Rejected",
    };
    return <span className={`badge ${map[status] || ""}`}>{labels[status] || status}</span>;
  }

  const selectedKisan = kisans.find((k) => k.id === formData.kisanId);

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">📥 Amad (Inward)</h1>
          <p className="page-subtitle">Record incoming bags from farmers</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          + New Amad Slip
        </button>
      </div>

      <div className="page-body">
        {slips.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📥</div>
            <div className="empty-state-title">No Amad Slips Yet</div>
            <div className="empty-state-desc">
              Click "New Amad Slip" to record the first inward entry.
            </div>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Slip #</th>
                  <th>Kisan</th>
                  <th>Room</th>
                  <th>Slot</th>
                  <th>Bags</th>
                  <th>Crop</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Sync</th>
                </tr>
              </thead>
              <tbody>
                {slips.map((slip) => (
                  <tr key={slip.id}>
                    <td style={{ fontWeight: 600, color: "var(--accent-blue)" }}>{slip.slipNumber}</td>
                    <td>{slip.kisanName}</td>
                    <td>{slip.roomName}</td>
                    <td>
                      <span style={{ fontWeight: 700, fontSize: 15 }}>{slip.slotNumber}</span>
                    </td>
                    <td>{slip.totalBags}</td>
                    <td>{slip.cropType}</td>
                    <td>{slip.entryDate}</td>
                    <td>{getStatusBadge(slip.status)}</td>
                    <td>
                      <span className={`badge ${slip.syncStatus === "synced" ? "badge-synced" : "badge-unsynced"}`}>
                        {slip.syncStatus === "synced" ? "✓" : "⏳"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Amad Slip Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">📥 New Amad (Inward) Slip</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Kisan (Farmer) *</label>
                  <select
                    className="form-select"
                    value={formData.kisanId}
                    onChange={(e) => setFormData({ ...formData, kisanId: e.target.value })}
                    required
                  >
                    <option value="">Select Kisan...</option>
                    {kisans.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.name} — {k.village}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Room / Chamber *</label>
                  <select
                    className="form-select"
                    value={formData.roomId}
                    onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                    required
                  >
                    <option value="">Select Room...</option>
                    {rooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Slot Number *</label>
                  <input
                    className="form-input"
                    type="text"
                    placeholder="e.g., 23"
                    value={formData.slotNumber}
                    onChange={(e) => setFormData({ ...formData, slotNumber: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Total Bags *</label>
                  <input
                    className="form-input"
                    type="number"
                    min="1"
                    placeholder="e.g., 50"
                    value={formData.totalBags}
                    onChange={(e) => setFormData({ ...formData, totalBags: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Crop Type *</label>
                  <input
                    className="form-input"
                    type="text"
                    placeholder="e.g., Potato"
                    value={formData.cropType}
                    onChange={(e) => setFormData({ ...formData, cropType: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Weight per Bag (kg)</label>
                  <input
                    className="form-input"
                    type="number"
                    step="0.5"
                    placeholder="Optional"
                    value={formData.weightPerBag}
                    onChange={(e) => setFormData({ ...formData, weightPerBag: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Rate per Bag (₹)</label>
                  <input
                    className="form-input"
                    type="number"
                    step="0.5"
                    placeholder="Optional"
                    value={formData.ratePerBag}
                    onChange={(e) => setFormData({ ...formData, ratePerBag: e.target.value })}
                  />
                </div>
              </div>

              {/* Live Slot & Bag Paint-Marking Display */}
              {formData.slotNumber && formData.totalBags && (
                <div className="slot-display" style={{ marginBottom: 16 }}>
                  <div className="slot-display-label">Paint on bags as</div>
                  <div className="slot-display-number">
                    {formData.slotNumber} | 01/{formData.totalBags}
                  </div>
                  <div className="slot-display-label" style={{ marginTop: 8 }}>
                    {selectedKisan ? `${selectedKisan.name} — ${selectedKisan.village}` : ""}
                  </div>
                </div>
              )}

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
                  💾 Save Amad Slip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
