import { networkFetch, isNetworkFailure, type ApiError } from "./apiNetwork";
import {
  idbDeleteDoc,
  idbDeleteQueue,
  idbFindQueueByDocId,
  idbGetDoc,
  idbGetDocsForUser,
  idbMergeDocumentsFromServer,
  idbPutDoc,
  idbPutQueue,
  idbRemoveQueueForDocId,
  type CachedDoc
} from "./offline/db";
import { flushSyncQueue } from "./offline/sync";

export type { ApiError };

function getCachedUserId(): string | null {
  try {
    const raw = localStorage.getItem("docugest_user_cache");
    if (!raw) return null;
    const u = JSON.parse(raw) as { id?: string };
    return typeof u.id === "string" ? u.id : null;
  } catch {
    return null;
  }
}

function parseDocumentsPath(path: string): { kind: "list" | "one" | "none"; id?: string; query: URLSearchParams } {
  const qIdx = path.indexOf("?");
  const u = qIdx >= 0 ? path.slice(0, qIdx) : path;
  const query = qIdx >= 0 ? new URLSearchParams(path.slice(qIdx + 1)) : new URLSearchParams();
  if (u === "/api/documents") {
    return { kind: "list", query };
  }
  const m = u.match(/^\/api\/documents\/([^/]+)$/);
  if (m) return { kind: "one", id: decodeURIComponent(m[1]), query };
  return { kind: "none", query };
}

function docFromPostPayload(localId: string, userId: string, payload: Record<string, unknown>): CachedDoc {
  return {
    id: localId,
    user_id: userId,
    type: String(payload.type),
    doc_number: String(payload.doc_number),
    client_name: String(payload.client_name),
    total_amount: Number(payload.total_amount),
    currency: String(payload.currency ?? "FCFA"),
    status: String(payload.status ?? "draft"),
    doc_data: (payload.doc_data as Record<string, unknown>) ?? {},
    created_at: new Date().toISOString(),
    _offlinePending: true
  };
}

function docFromPutPayload(existing: CachedDoc, payload: Record<string, unknown>): CachedDoc {
  return {
    ...existing,
    type: String(payload.type),
    doc_number: String(payload.doc_number),
    client_name: String(payload.client_name),
    total_amount: Number(payload.total_amount),
    currency: String(payload.currency ?? "FCFA"),
    status: String(payload.status ?? "draft"),
    doc_data: (payload.doc_data as Record<string, unknown>) ?? {},
    _offlinePending: true
  };
}

async function offlineList(query: URLSearchParams, userId: string) {
  const items = await idbGetDocsForUser(userId);
  const page = Math.max(1, Number(query.get("page") || 1));
  const limit = Math.min(50, Math.max(1, Number(query.get("limit") || 20)));
  const type = query.get("type");
  const filtered = (type ? items.filter((i) => i.type === type) : [...items]).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  const total = filtered.length;
  const start = (page - 1) * limit;
  const slice = filtered.slice(start, start + limit);
  return { items: slice, page, limit, total };
}

async function offlineCreate(payload: Record<string, unknown>, userId: string): Promise<{ id: string }> {
  const localId = crypto.randomUUID();
  const doc = docFromPostPayload(localId, userId, payload);
  await idbPutDoc(doc);
  await idbPutQueue({
    id: crypto.randomUUID(),
    op: "create",
    docId: localId,
    payload,
    createdAt: new Date().toISOString()
  });
  void flushSyncQueue();
  return { id: localId };
}

async function offlinePut(docId: string, payload: Record<string, unknown>, existing: CachedDoc): Promise<CachedDoc> {
  const next = docFromPutPayload(existing, payload);
  await idbPutDoc(next);
  const q = await idbFindQueueByDocId(docId);
  const ts = new Date().toISOString();
  if (q?.op === "create") {
    await idbDeleteQueue(q.id);
    await idbPutQueue({ id: q.id, op: "create", docId, payload, createdAt: q.createdAt });
  } else if (q?.op === "update") {
    await idbDeleteQueue(q.id);
    await idbPutQueue({ id: q.id, op: "update", docId, payload, createdAt: q.createdAt });
  } else {
    await idbPutQueue({ id: crypto.randomUUID(), op: "update", docId, payload, createdAt: ts });
  }
  void flushSyncQueue();
  return next;
}

async function offlineDelete(docId: string, userId: string): Promise<void> {
  const existing = await idbGetDoc(docId);
  if (!existing || existing.user_id !== userId) {
    throw { message: "Document introuvable" } satisfies ApiError;
  }
  const q = await idbFindQueueByDocId(docId);
  if (q?.op === "create") {
    await idbDeleteQueue(q.id);
    await idbDeleteDoc(docId);
    return;
  }
  await idbDeleteDoc(docId);
  await idbPutQueue({
    id: crypto.randomUUID(),
    op: "delete",
    docId,
    createdAt: new Date().toISOString()
  });
  void flushSyncQueue();
}

async function handleDocuments<T>(path: string, method: string, init?: RequestInit & { json?: unknown }): Promise<T> {
  const token = localStorage.getItem("docugest_token");
  const userId = getCachedUserId();
  const parsed = parseDocumentsPath(path);

  if (parsed.kind === "none") {
    return networkFetch<T>(path, init);
  }

  if (!token) {
    return networkFetch<T>(path, init);
  }

  if (method === "GET" && parsed.kind === "list") {
    if (navigator.onLine) {
      try {
        const res = await networkFetch<{ items: CachedDoc[]; page: number; limit: number; total: number }>(path, init);
        if (userId && res.items?.length) {
          await idbMergeDocumentsFromServer(res.items, userId);
        }
        return res as T;
      } catch (e) {
        if (!isNetworkFailure(e)) throw e;
      }
    }
    if (!userId) {
      throw { message: "Hors ligne : ouvrez l’app une fois en ligne pour synchroniser votre session." } satisfies ApiError;
    }
    return (await offlineList(parsed.query, userId)) as T;
  }

  if (method === "GET" && parsed.kind === "one" && parsed.id) {
    if (navigator.onLine) {
      try {
        const doc = await networkFetch<CachedDoc>(path, init);
        await idbPutDoc({ ...doc, _offlinePending: false });
        return doc as T;
      } catch (e) {
        if (!isNetworkFailure(e)) throw e;
      }
    }
    if (!userId) {
      throw { message: "Hors ligne : session requise." } satisfies ApiError;
    }
    const doc = await idbGetDoc(parsed.id);
    if (!doc || doc.user_id !== userId) {
      throw { message: "Document introuvable (hors ligne)." } satisfies ApiError;
    }
    return doc as T;
  }

  if (method === "POST" && parsed.kind === "list") {
    const body = init?.json as Record<string, unknown>;
    if (!body || typeof body !== "object") {
      return networkFetch<T>(path, init);
    }
    if (navigator.onLine) {
      try {
        const created = await networkFetch<CachedDoc>(path, init);
        await idbPutDoc({ ...created, _offlinePending: false });
        return created as T;
      } catch (e) {
        if (!isNetworkFailure(e)) throw e;
      }
    }
    if (!userId) {
      throw { message: "Hors ligne : impossible de créer sans session locale." } satisfies ApiError;
    }
    return (await offlineCreate(body, userId)) as T;
  }

  if (method === "PUT" && parsed.kind === "one" && parsed.id) {
    const body = init?.json as Record<string, unknown>;
    if (!body || typeof body !== "object") {
      return networkFetch<T>(path, init);
    }
    const existing = await idbGetDoc(parsed.id);
    if (navigator.onLine) {
      try {
        const updated = await networkFetch<CachedDoc>(path, init);
        await idbPutDoc({ ...updated, _offlinePending: false });
        return updated as T;
      } catch (e) {
        if (!isNetworkFailure(e)) throw e;
      }
    }
    if (!userId || !existing || existing.user_id !== userId) {
      throw { message: "Document introuvable (hors ligne) ou non synchronisé." } satisfies ApiError;
    }
    return (await offlinePut(parsed.id, body, existing)) as T;
  }

  if (method === "DELETE" && parsed.kind === "one" && parsed.id) {
    if (navigator.onLine) {
      try {
        await networkFetch(path, { method: "DELETE" });
        await idbDeleteDoc(parsed.id);
        await idbRemoveQueueForDocId(parsed.id);
        return undefined as T;
      } catch (e) {
        if (!isNetworkFailure(e)) throw e;
      }
    }
    if (!userId) {
      throw { message: "Hors ligne : session requise." } satisfies ApiError;
    }
    await offlineDelete(parsed.id, userId);
    return undefined as T;
  }

  return networkFetch<T>(path, init);
}

/**
 * API avec mode hors-ligne pour `/api/documents` : cache IndexedDB + file d’attente,
 * synchronisation automatique au retour du réseau.
 */
export async function apiFetch<T>(path: string, init?: RequestInit & { json?: unknown }) {
  if (path.startsWith("/api/auth")) {
    return networkFetch<T>(path, init);
  }

  if (path.startsWith("/api/documents")) {
    const method = (init?.method || "GET").toUpperCase();
    return handleDocuments<T>(path, method, init);
  }

  return networkFetch<T>(path, init);
}
