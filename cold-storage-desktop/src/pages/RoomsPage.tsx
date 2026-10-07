import { useState, useEffect } from "react";
import type { Room } from "../types";
import { getAllRooms, createRoom } from "../db/localDb";

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    capacity: "",
    temperature: "",
  });

  useEffect(() => {
    loadRooms();
  }, []);

  async function loadRooms() {
    const all = await getAllRooms();
    setRooms(all);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await createRoom({
      name: formData.name,
      capacity: parseInt(formData.capacity),
      occupiedSlots: 0,
      temperature: formData.temperature ? parseFloat(formData.temperature) : undefined,
      tenantId: "default",
    });
    setShowForm(false);
    setFormData({ name: "", capacity: "", temperature: "" });
    loadRooms();
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">🏠 Rooms / Chambers</h1>
          <p className="page-subtitle">Manage cold storage rooms and capacity</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          + Add Room
        </button>
      </div>

      <div className="page-body">
        {rooms.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🏠</div>
            <div className="empty-state-title">No Rooms Added</div>
            <div className="empty-state-desc">
              Add your cold storage rooms/chambers to start tracking capacity.
            </div>
          </div>
        ) : (
          <div className="stat-grid">
            {rooms.map((room) => {
              const occupancy = room.capacity > 0 ? Math.round((room.occupiedSlots / room.capacity) * 100) : 0;
              const colorClass = occupancy > 80 ? "red" : occupancy > 50 ? "amber" : "green";
              return (
                <div className={`stat-card ${colorClass}`} key={room.id}>
                  <div className="stat-label">{room.name}</div>
                  <div className="stat-value">{occupancy}%</div>
                  <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>
                    {room.occupiedSlots} / {room.capacity} slots used
                  </div>
                  {room.temperature && (
                    <div style={{ fontSize: 12, color: "var(--accent-blue)", marginTop: 6 }}>
                      🌡️ {room.temperature}°C
                    </div>
                  )}
                  {/* Occupancy bar */}
                  <div
                    style={{
                      marginTop: 12,
                      height: 6,
                      borderRadius: 3,
                      background: "var(--bg-input)",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${occupancy}%`,
                        height: "100%",
                        borderRadius: 3,
                        background:
                          colorClass === "red"
                            ? "var(--accent-red)"
                            : colorClass === "amber"
                            ? "var(--accent-amber)"
                            : "var(--accent-green)",
                        transition: "width 0.5s ease",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">🏠 Add New Room / Chamber</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Room Name *</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="e.g., Chamber 1, Room A"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  autoFocus
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Total Capacity (slots) *</label>
                  <input
                    className="form-input"
                    type="number"
                    min="1"
                    placeholder="e.g., 200"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Temperature (°C)</label>
                  <input
                    className="form-input"
                    type="number"
                    step="0.5"
                    placeholder="e.g., -18"
                    value={formData.temperature}
                    onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  💾 Save Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
