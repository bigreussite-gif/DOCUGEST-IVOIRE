import { networkFetch } from "../apiNetwork";
import {
  idbDeleteDoc,
  idbDeleteQueue,
  idbGetAllQueue,
  idbPutDoc,
  type CachedDoc,
  type QueueRecord
} from "./db";

let syncing = false;

async function processCreate(entry: QueueRecord): Promise<void> {
  if (!entry.payload) return;
  const localId = entry.docId;
  const serverDoc = await networkFetch<CachedDoc>("/api/documents", {
    method: "POST",
    json: entry.payload
  });
  await idbDeleteQueue(entry.id);
  await idbDeleteDoc(localId);
  await idbPutDoc({ ...serverDoc, _offlinePending: false });
  if (localId !== serverDoc.id) {
    window.dispatchEvent(
      new CustomEvent("docugest:doc-id-synced", { detail: { oldId: localId, newId: serverDoc.id } })
    );
  }
}

async function processUpdate(entry: QueueRecord): Promise<void> {
  if (!entry.payload) return;
  const updated = await networkFetch<CachedDoc>(`/api/documents/${entry.docId}`, {
    method: "PUT",
    json: entry.payload
  });
  await idbDeleteQueue(entry.id);
  await idbPutDoc({ ...updated, _offlinePending: false });
}

async function processDelete(entry: QueueRecord): Promise<void> {
  await networkFetch(`/api/documents/${entry.docId}`, { method: "DELETE" });
  await idbDeleteQueue(entry.id);
}

/** Envoie les opérations en attente vers le serveur (appeler au retour du réseau). */
export async function flushSyncQueue(): Promise<void> {
  if (syncing || !navigator.onLine) return;
  if (!localStorage.getItem("docugest_token")) return;

  syncing = true;
  try {
    let queue = await idbGetAllQueue();
    const creates = queue.filter((r) => r.op === "create");
    const updates = queue.filter((r) => r.op === "update");
    const deletes = queue.filter((r) => r.op === "delete");

    for (const e of creates) {
      await processCreate(e);
    }
    queue = await idbGetAllQueue();
    const updates2 = queue.filter((r) => r.op === "update");
    for (const e of updates2.length ? updates2 : updates) {
      await processUpdate(e);
    }
    queue = await idbGetAllQueue();
    const deletes2 = queue.filter((r) => r.op === "delete");
    for (const e of deletes2.length ? deletes2 : deletes) {
      await processDelete(e);
    }
  } catch {
    /* réessaiera au prochain online / intervalle */
  } finally {
    syncing = false;
    window.dispatchEvent(new Event("docugest:sync-complete"));
  }
}

export function getSyncing(): boolean {
  return syncing;
}
