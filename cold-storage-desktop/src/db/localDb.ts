// Cold Storage ERP — Local Database (Offline-First)
// Uses IndexedDB via a simple wrapper for the Tauri desktop app.
// This acts as the local SQLite-like store. Data syncs to cloud when online.

import { v4 as uuidv4 } from "uuid";
import type { AmadSlip, NikasiSlip, Kisan, Room, SyncStatus } from "../types";

const DB_NAME = "cold_storage_erp";
const DB_VERSION = 1;

const STORES = {
  amad: "amad_slips",
  nikasi: "nikasi_slips",
  kisans: "kisans",
  rooms: "rooms",
  syncQueue: "sync_queue",
} as const;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORES.amad)) {
        const amadStore = db.createObjectStore(STORES.amad, { keyPath: "id" });
        amadStore.createIndex("kisanId", "kisanId", { unique: false });
        amadStore.createIndex("status", "status", { unique: false });
        amadStore.createIndex("syncStatus", "syncStatus", { unique: false });
        amadStore.createIndex("entryDate", "entryDate", { unique: false });
      }
      if (!db.objectStoreNames.contains(STORES.nikasi)) {
        const nikasiStore = db.createObjectStore(STORES.nikasi, { keyPath: "id" });
        nikasiStore.createIndex("kisanId", "kisanId", { unique: false });
        nikasiStore.createIndex("amadSlipId", "amadSlipId", { unique: false });
        nikasiStore.createIndex("syncStatus", "syncStatus", { unique: false });
      }
      if (!db.objectStoreNames.contains(STORES.kisans)) {
        const kisanStore = db.createObjectStore(STORES.kisans, { keyPath: "id" });
        kisanStore.createIndex("accountNumber", "accountNumber", { unique: true });
        kisanStore.createIndex("name", "name", { unique: false });
      }
      if (!db.objectStoreNames.contains(STORES.rooms)) {
        db.createObjectStore(STORES.rooms, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORES.syncQueue)) {
        const syncStore = db.createObjectStore(STORES.syncQueue, { keyPath: "id" });
        syncStore.createIndex("timestamp", "timestamp", { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Generic CRUD helpers
async function getAll<T>(storeName: string): Promise<T[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getById<T>(storeName: string, id: string): Promise<T | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function put<T>(storeName: string, data: T): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    store.put(data);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function deleteById(storeName: string, id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    store.delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// Add to sync queue (for offline->cloud push)
async function addToSyncQueue(action: "create" | "update" | "delete", storeName: string, recordId: string, data?: unknown) {
  await put(STORES.syncQueue, {
    id: uuidv4(),
    action,
    storeName,
    recordId,
    data,
    timestamp: new Date().toISOString(),
    synced: false,
  });
}

// ========== AMAD (Inward) Operations ==========
export async function getAllAmadSlips(): Promise<AmadSlip[]> {
  return getAll<AmadSlip>(STORES.amad);
}

export async function getAmadSlipById(id: string): Promise<AmadSlip | undefined> {
  return getById<AmadSlip>(STORES.amad, id);
}

export async function createAmadSlip(slip: Omit<AmadSlip, "id" | "slipNumber" | "syncStatus" | "createdAt" | "updatedAt">): Promise<AmadSlip> {
  const now = new Date().toISOString();
  const slipNumber = `IN-${Date.now().toString(36).toUpperCase()}`;
  const newSlip: AmadSlip = {
    ...slip,
    id: uuidv4(),
    slipNumber,
    syncStatus: "pending" as SyncStatus,
    createdAt: now,
    updatedAt: now,
  };
  await put(STORES.amad, newSlip);
  await addToSyncQueue("create", STORES.amad, newSlip.id, newSlip);
  return newSlip;
}

export async function updateAmadSlip(id: string, updates: Partial<AmadSlip>): Promise<void> {
  const existing = await getAmadSlipById(id);
  if (!existing) throw new Error("Amad slip not found");
  const updated = { ...existing, ...updates, updatedAt: new Date().toISOString(), syncStatus: "pending" as SyncStatus };
  await put(STORES.amad, updated);
  await addToSyncQueue("update", STORES.amad, id, updated);
}

// ========== NIKASI (Outward) Operations ==========
export async function getAllNikasiSlips(): Promise<NikasiSlip[]> {
  return getAll<NikasiSlip>(STORES.nikasi);
}

export async function createNikasiSlip(slip: Omit<NikasiSlip, "id" | "slipNumber" | "syncStatus" | "createdAt" | "updatedAt">): Promise<NikasiSlip> {
  const now = new Date().toISOString();
  const slipNumber = `OUT-${Date.now().toString(36).toUpperCase()}`;
  const newSlip: NikasiSlip = {
    ...slip,
    id: uuidv4(),
    slipNumber,
    syncStatus: "pending" as SyncStatus,
    createdAt: now,
    updatedAt: now,
  };
  await put(STORES.nikasi, newSlip);
  await addToSyncQueue("create", STORES.nikasi, newSlip.id, newSlip);
  return newSlip;
}

// ========== KISAN (Farmer) Operations ==========
export async function getAllKisans(): Promise<Kisan[]> {
  return getAll<Kisan>(STORES.kisans);
}

export async function createKisan(kisan: Omit<Kisan, "id" | "syncStatus" | "createdAt" | "updatedAt">): Promise<Kisan> {
  const now = new Date().toISOString();
  const newKisan: Kisan = {
    ...kisan,
    id: uuidv4(),
    syncStatus: "pending" as SyncStatus,
    createdAt: now,
    updatedAt: now,
  };
  await put(STORES.kisans, newKisan);
  await addToSyncQueue("create", STORES.kisans, newKisan.id, newKisan);
  return newKisan;
}

// ========== ROOM Operations ==========
export async function getAllRooms(): Promise<Room[]> {
  return getAll<Room>(STORES.rooms);
}

export async function createRoom(room: Omit<Room, "id" | "syncStatus">): Promise<Room> {
  const newRoom: Room = {
    ...room,
    id: uuidv4(),
    syncStatus: "pending" as SyncStatus,
  };
  await put(STORES.rooms, newRoom);
  await addToSyncQueue("create", STORES.rooms, newRoom.id, newRoom);
  return newRoom;
}

// ========== SYNC Operations ==========
export async function getPendingSyncItems(): Promise<unknown[]> {
  return getAll(STORES.syncQueue);
}

export async function markSynced(syncId: string): Promise<void> {
  await deleteById(STORES.syncQueue, syncId);
}

export async function getSyncQueueCount(): Promise<number> {
  const items = await getAll(STORES.syncQueue);
  return items.length;
}
