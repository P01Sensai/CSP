// Cold Storage ERP — Sync Engine
// Pushes pending local changes to the cloud backend when online.

import { getPendingSyncItems, markSynced } from "./localDb";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

interface SyncQueueItem {
  id: string;
  action: "create" | "update" | "delete";
  storeName: string;
  recordId: string;
  data?: unknown;
  timestamp: string;
  synced: boolean;
}

let isSyncing = false;

export async function syncToCloud(): Promise<{ synced: number; failed: number }> {
  if (isSyncing) return { synced: 0, failed: 0 };
  isSyncing = true;

  let synced = 0;
  let failed = 0;

  try {
    const pendingItems = (await getPendingSyncItems()) as SyncQueueItem[];

    if (pendingItems.length === 0) {
      return { synced: 0, failed: 0 };
    }

    // Sort by timestamp to maintain order
    pendingItems.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    for (const item of pendingItems) {
      try {
        const endpoint = `${API_BASE}/${item.storeName}`;
        let response: Response;

        switch (item.action) {
          case "create":
            response = await fetch(endpoint, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(item.data),
            });
            break;
          case "update":
            response = await fetch(`${endpoint}/${item.recordId}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(item.data),
            });
            break;
          case "delete":
            response = await fetch(`${endpoint}/${item.recordId}`, {
              method: "DELETE",
            });
            break;
          default:
            continue;
        }

        if (response.ok) {
          await markSynced(item.id);
          synced++;
        } else {
          failed++;
        }
      } catch {
        // Network error — skip this item, will retry next sync
        failed++;
      }
    }
  } finally {
    isSyncing = false;
  }

  return { synced, failed };
}

// Auto-sync: runs every 30 seconds when online
let syncInterval: ReturnType<typeof setInterval> | null = null;

export function startAutoSync(onSyncResult?: (result: { synced: number; failed: number }) => void) {
  if (syncInterval) return;

  syncInterval = setInterval(async () => {
    if (navigator.onLine) {
      const result = await syncToCloud();
      if (result.synced > 0 || result.failed > 0) {
        onSyncResult?.(result);
      }
    }
  }, 30_000); // every 30 seconds

  // Also sync immediately on coming back online
  window.addEventListener("online", async () => {
    const result = await syncToCloud();
    onSyncResult?.(result);
  });
}

export function stopAutoSync() {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
  }
}
