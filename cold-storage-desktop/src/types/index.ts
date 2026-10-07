// Cold Storage ERP — TypeScript Types
// Core domain types for the entire application

export interface Kisan {
  id: string;
  name: string;
  fatherName: string;
  village: string;
  phone?: string;
  accountNumber: string; // Khata number
  createdAt: string;
  updatedAt: string;
  tenantId: string;
  syncStatus: SyncStatus;
}

export interface Room {
  id: string;
  name: string; // e.g., "Chamber 1", "Chamber 2"
  capacity: number; // total slots
  occupiedSlots: number;
  temperature?: number;
  tenantId: string;
  syncStatus: SyncStatus;
}

export interface Slot {
  id: string;
  roomId: string;
  slotNumber: string; // The physical slot number painted on bags
  status: "empty" | "partial" | "full";
  tenantId: string;
  syncStatus: SyncStatus;
}

// Amad = Inward (farmer brings bags IN to cold storage)
export interface AmadSlip {
  id: string;
  slipNumber: string; // Auto-generated bill number
  kisanId: string;
  kisanName: string; // Denormalized for offline display
  roomId: string;
  roomName: string;
  slotNumber: string;
  totalBags: number;
  cropType: string; // e.g., "Potato", "Onion"
  weightPerBag?: number; // in kg
  totalWeight?: number;
  ratePerBag?: number;
  entryDate: string;
  remarks?: string;
  status: SlipStatus;
  createdBy: string; // Munim user ID
  approvedBy?: string; // Owner user ID
  approvedAt?: string;
  tenantId: string;
  syncStatus: SyncStatus;
  createdAt: string;
  updatedAt: string;
}

// Nikasi = Outward (farmer takes bags OUT of cold storage)
export interface NikasiSlip {
  id: string;
  slipNumber: string;
  amadSlipId: string; // Reference to original inward slip
  kisanId: string;
  kisanName: string;
  roomId: string;
  roomName: string;
  slotNumber: string;
  bagsRemoved: number;
  remainingBags: number;
  exitDate: string;
  remarks?: string;
  status: SlipStatus;
  createdBy: string;
  approvedBy?: string;
  approvedAt?: string;
  tenantId: string;
  syncStatus: SyncStatus;
  createdAt: string;
  updatedAt: string;
}

export type SlipStatus = "draft" | "pending_approval" | "approved" | "rejected";
export type SyncStatus = "synced" | "pending" | "conflict";

export interface User {
  id: string;
  name: string;
  role: "owner" | "munim" | "worker";
  phone?: string;
  tenantId: string;
}

export interface DailySummary {
  date: string;
  totalAmad: number;
  totalNikasi: number;
  totalBagsIn: number;
  totalBagsOut: number;
  pendingApprovals: number;
}
