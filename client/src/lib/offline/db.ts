const DB_NAME = "docugest-offline-v1";
const DB_VERSION = 1;
const STORE_DOCS = "documents";
const STORE_QUEUE = "queue";

export type CachedDoc = {
  id: string;
  user_id: string;
  type: string;
  doc_number: string;
  client_name: string;
  total_amount: number;
  currency: string;
  status: string;
  doc_data: Record<string, unknown>;
  created_at: string;
  _offlinePending?: boolean;
};

export type QueueOp = "create" | "update" | "delete";

export type QueueRecord = {
  id: string;
  op: QueueOp;
  docId: string;
  payload?: unknown;
  createdAt: string;
};

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_DOCS)) {
        db.createObjectStore(STORE_DOCS, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORE_QUEUE)) {
        db.createObjectStore(STORE_QUEUE, { keyPath: "id" });
      }
    };
  });
  return dbPromise;
}

export async function idbPutDoc(doc: CachedDoc): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_DOCS, "readwrite");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.objectStore(STORE_DOCS).put(doc);
  });
}

export async function idbGetDoc(id: string): Promise<CachedDoc | undefined> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_DOCS, "readonly");
    const req = tx.objectStore(STORE_DOCS).get(id);
    req.onsuccess = () => resolve(req.result as CachedDoc | undefined);
    req.onerror = () => reject(req.error);
  });
}

export async function idbGetDocsForUser(userId: string): Promise<CachedDoc[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_DOCS, "readonly");
    const req = tx.objectStore(STORE_DOCS).getAll();
    req.onsuccess = () => {
      const all = (req.result as CachedDoc[]) ?? [];
      resolve(all.filter((d) => d.user_id === userId));
    };
    req.onerror = () => reject(req.error);
  });
}

export async function idbDeleteDoc(id: string): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_DOCS, "readwrite");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.objectStore(STORE_DOCS).delete(id);
  });
}

export async function idbMergeDocumentsFromServer(items: CachedDoc[], userId: string): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_DOCS, "readwrite");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    const store = tx.objectStore(STORE_DOCS);
    for (const row of items) {
      if (row.user_id !== userId) continue;
      store.put({ ...row, _offlinePending: false });
    }
  });
}

export async function idbPutQueue(entry: QueueRecord): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_QUEUE, "readwrite");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.objectStore(STORE_QUEUE).put(entry);
  });
}

export async function idbDeleteQueue(queueId: string): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_QUEUE, "readwrite");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.objectStore(STORE_QUEUE).delete(queueId);
  });
}

export async function idbGetAllQueue(): Promise<QueueRecord[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_QUEUE, "readonly");
    const req = tx.objectStore(STORE_QUEUE).getAll();
    req.onsuccess = () => resolve((req.result as QueueRecord[]) ?? []);
    req.onerror = () => reject(req.error);
  });
}

/** File d’attente pour un document (création / mise à jour fusionnées). */
export async function idbFindQueueByDocId(docId: string): Promise<QueueRecord | undefined> {
  const all = await idbGetAllQueue();
  return all.find((q) => q.docId === docId);
}

export async function idbRemoveQueueForDocId(docId: string): Promise<void> {
  const all = await idbGetAllQueue();
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_QUEUE, "readwrite");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    const store = tx.objectStore(STORE_QUEUE);
    for (const q of all) {
      if (q.docId === docId) store.delete(q.id);
    }
  });
}
