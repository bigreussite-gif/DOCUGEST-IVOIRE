/**
 * Accès données Postgres (Insforge) pour les Route Handlers Next.js.
 * Logique alignée sur server/lib/pgStore.js (sans Express).
 */
import { getPool } from "@/lib/db";
import type { PublicUser, UserRow } from "@/models/User";

function iso(d: unknown): string | null {
  if (!d) return null;
  if (d instanceof Date) return d.toISOString();
  return new Date(d as string | number).toISOString();
}

export function pickUser(row: UserRow | null): PublicUser | null {
  if (!row) return null;
  return {
    id: row.id,
    full_name: row.full_name,
    phone: row.phone,
    whatsapp: row.whatsapp ?? null,
    email: row.email,
    company_name: row.company_name ?? null,
    company_logo_url: row.company_logo_url ?? null,
    company_address: row.company_address ?? null,
    company_ncc: row.company_ncc ?? null,
    company_rccm: row.company_rccm ?? null,
    company_dfe: row.company_dfe ?? null,
    company_regime: row.company_regime ?? null,
    role: row.role ?? "user",
    permission_level: row.permission_level ?? "write",
    gender: row.gender ?? null,
    user_typology: row.user_typology ?? null
  };
}

export async function getUserByEmail(email: string): Promise<UserRow | null> {
  const pool = getPool();
  const { rows } = await pool.query(`SELECT * FROM public.users WHERE lower(email) = lower($1) LIMIT 1`, [email]);
  return (rows[0] as UserRow) ?? null;
}

function digitsOnly(v: string): string {
  return v.replace(/\D/g, "");
}

/** Recherche login par email, téléphone ou WhatsApp. */
export async function getUserByLoginIdentifier(identifier: string): Promise<UserRow | null> {
  const pool = getPool();
  const clean = identifier.trim();
  if (!clean) return null;
  const digits = digitsOnly(clean);
  const { rows } = await pool.query(
    `SELECT * FROM public.users
     WHERE lower(email) = lower($1)
        OR regexp_replace(coalesce(phone, ''), '[^0-9]', '', 'g') = $2
        OR regexp_replace(coalesce(whatsapp, ''), '[^0-9]', '', 'g') = $2
     LIMIT 1`,
    [clean, digits]
  );
  return (rows[0] as UserRow) ?? null;
}

export async function getUserById(id: string): Promise<UserRow | null> {
  const pool = getPool();
  const { rows } = await pool.query(`SELECT * FROM public.users WHERE id = $1 LIMIT 1`, [id]);
  return (rows[0] as UserRow) ?? null;
}

export async function getMe(userId: string): Promise<PublicUser | null> {
  const u = await getUserById(userId);
  return u ? pickUser(u) : null;
}

export async function touchLastLogin(userId: string): Promise<void> {
  const pool = getPool();
  await pool.query(`UPDATE public.users SET last_login = NOW() WHERE id = $1`, [userId]);
}

export async function ensureBootstrapAdmin(userId: string): Promise<void> {
  const email = process.env.ADMIN_BOOTSTRAP_EMAIL;
  try {
    const pool = getPool();
    const u = await getUserById(userId);
    if (!u) return;
    if (u.role === "super_admin") return;

    // Mode explicite: email bootstrap déclaré.
    if (email && String(u.email).toLowerCase() === email.toLowerCase()) {
      await pool.query(`UPDATE public.users SET role = 'super_admin' WHERE id = $1`, [userId]);
      return;
    }

    // Mode sécurité terrain: si aucun super_admin n'existe encore, on élève
    // le premier utilisateur connecté pour débloquer l'accès admin.
    const { rows } = await pool.query(`SELECT COUNT(*)::int AS c FROM public.users WHERE role = 'super_admin'`);
    const count = Number(rows[0]?.c ?? 0);
    if (count === 0) {
      await pool.query(`UPDATE public.users SET role = 'super_admin' WHERE id = $1`, [userId]);
    }
  } catch {
    /* migration non appliquée */
  }
}

export async function countSuperAdmins(): Promise<number> {
  const pool = getPool();
  const { rows } = await pool.query(`SELECT COUNT(*)::int AS c FROM public.users WHERE role = 'super_admin'`);
  return Number(rows[0]?.c ?? 0);
}

export async function promoteToSuperAdmin(userId: string): Promise<boolean> {
  const pool = getPool();
  const { rowCount } = await pool.query(`UPDATE public.users SET role = 'super_admin' WHERE id = $1`, [userId]);
  return (rowCount ?? 0) > 0;
}

export async function updatePassword(userId: string, password_hash: string): Promise<boolean> {
  const pool = getPool();
  const { rowCount } = await pool.query(`UPDATE public.users SET password_hash = $2 WHERE id = $1`, [
    userId,
    password_hash
  ]);
  return (rowCount ?? 0) > 0;
}

function mapDoc(row: Record<string, unknown> | null) {
  if (!row) return null;
  return {
    id: row.id,
    user_id: row.user_id,
    type: row.type,
    doc_number: row.doc_number,
    client_name: row.client_name,
    total_amount: row.total_amount != null ? Number(row.total_amount) : null,
    currency: row.currency,
    status: row.status,
    doc_data: row.doc_data,
    pdf_url: row.pdf_url,
    created_at: iso(row.created_at),
    updated_at: iso(row.updated_at)
  };
}

export async function createDocument(doc: {
  user_id: string;
  type: string;
  doc_number: string;
  client_name: string;
  total_amount: number;
  currency: string;
  status: string;
  doc_data: Record<string, unknown>;
  pdf_url?: string | null;
}) {
  const pool = getPool();
  const { rows } = await pool.query(
    `INSERT INTO public.documents (
      user_id, type, doc_number, client_name, total_amount, currency, status, doc_data, pdf_url
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9)
    RETURNING *`,
    [
      doc.user_id,
      doc.type,
      doc.doc_number,
      doc.client_name,
      doc.total_amount,
      doc.currency ?? "FCFA",
      doc.status ?? "draft",
      doc.doc_data as object,
      doc.pdf_url ?? null
    ]
  );
  return mapDoc(rows[0] as Record<string, unknown>);
}

export async function updateDocument({
  userId,
  id,
  type,
  doc_number,
  client_name,
  total_amount,
  currency,
  status,
  doc_data
}: {
  userId: string;
  id: string;
  type: string;
  doc_number: string;
  client_name: string;
  total_amount: number;
  currency: string;
  status: string;
  doc_data: Record<string, unknown>;
}) {
  const pool = getPool();
  const { rows } = await pool.query(
    `UPDATE public.documents SET
      type = $3,
      doc_number = $4,
      client_name = $5,
      total_amount = $6,
      currency = $7,
      status = $8,
      doc_data = $9::jsonb,
      updated_at = NOW()
    WHERE user_id = $1 AND id = $2
    RETURNING *`,
    [userId, id, type, doc_number, client_name, total_amount, currency ?? "FCFA", status ?? "draft", doc_data as object]
  );
  return mapDoc(rows[0] as Record<string, unknown> | null);
}

export async function listDocuments({
  userId,
  type,
  page,
  limit
}: {
  userId: string;
  type: string | null;
  page: number;
  limit: number;
}) {
  const pool = getPool();
  const offset = (page - 1) * limit;
  const typeFilter = type || null;
  const { rows: countRows } = await pool.query(
    `SELECT COUNT(*)::int AS c FROM public.documents
     WHERE user_id = $1 AND ($2::text IS NULL OR type = $2)`,
    [userId, typeFilter]
  );
  const total = countRows[0]?.c ?? 0;
  const { rows } = await pool.query(
    `SELECT * FROM public.documents
     WHERE user_id = $1 AND ($2::text IS NULL OR type = $2)
     ORDER BY created_at DESC
     LIMIT $3 OFFSET $4`,
    [userId, typeFilter, limit, offset]
  );
  return { items: rows.map((r) => mapDoc(r as Record<string, unknown>)), total };
}

export async function listDocumentsAdmin({
  page,
  limit,
  type,
  q
}: {
  page: number;
  limit: number;
  type: string | null;
  q: string | null;
}) {
  const pool = getPool();
  const offset = (page - 1) * limit;
  const typeFilter = type || null;
  const query = q?.trim() ? `%${q.trim().toLowerCase()}%` : null;

  const { rows: countRows } = await pool.query(
    `SELECT COUNT(*)::int AS c
     FROM public.documents d
     LEFT JOIN public.users u ON u.id = d.user_id
     WHERE ($1::text IS NULL OR d.type = $1)
       AND (
         $2::text IS NULL OR
         lower(d.doc_number) LIKE $2 OR
         lower(d.client_name) LIKE $2 OR
         lower(coalesce(u.email, '')) LIKE $2 OR
         lower(coalesce(u.full_name, '')) LIKE $2
       )`,
    [typeFilter, query]
  );
  const total = Number(countRows[0]?.c ?? 0);

  const { rows } = await pool.query(
    `SELECT
       d.id,
       d.user_id,
       d.type,
       d.doc_number,
       d.client_name,
       d.total_amount,
       d.currency,
       d.status,
       d.created_at,
       u.full_name AS owner_name,
       u.email AS owner_email
     FROM public.documents d
     LEFT JOIN public.users u ON u.id = d.user_id
     WHERE ($1::text IS NULL OR d.type = $1)
       AND (
         $2::text IS NULL OR
         lower(d.doc_number) LIKE $2 OR
         lower(d.client_name) LIKE $2 OR
         lower(coalesce(u.email, '')) LIKE $2 OR
         lower(coalesce(u.full_name, '')) LIKE $2
       )
     ORDER BY d.created_at DESC
     LIMIT $3 OFFSET $4`,
    [typeFilter, query, limit, offset]
  );

  return {
    items: rows.map((r: Record<string, unknown>) => ({
      id: String(r.id),
      user_id: String(r.user_id),
      type: String(r.type),
      doc_number: String(r.doc_number),
      client_name: String(r.client_name),
      total_amount: r.total_amount != null ? Number(r.total_amount) : 0,
      currency: String(r.currency ?? "FCFA"),
      status: String(r.status ?? "draft"),
      created_at: iso(r.created_at),
      owner_name: r.owner_name ? String(r.owner_name) : null,
      owner_email: r.owner_email ? String(r.owner_email) : null
    })),
    total
  };
}

export async function getDocumentById({ userId, id }: { userId: string; id: string }) {
  const pool = getPool();
  const { rows } = await pool.query(`SELECT * FROM public.documents WHERE user_id = $1 AND id = $2 LIMIT 1`, [
    userId,
    id
  ]);
  return mapDoc(rows[0] as Record<string, unknown> | null);
}

export async function deleteDocumentById({ userId, id }: { userId: string; id: string }): Promise<boolean> {
  const pool = getPool();
  const { rowCount } = await pool.query(`DELETE FROM public.documents WHERE user_id = $1 AND id = $2`, [userId, id]);
  return (rowCount ?? 0) > 0;
}

export async function listUsersAdmin() {
  const pool = getPool();
  const { rows } = await pool.query(
    `SELECT id, full_name, email, phone, whatsapp, role, permission_level, gender, user_typology,
            company_name, created_at, last_login
     FROM public.users ORDER BY created_at DESC`
  );
  return rows.map((r: Record<string, unknown>) => ({
    ...r,
    created_at: iso(r.created_at),
    last_login: iso(r.last_login)
  }));
}

export async function createUserAdmin(params: {
  full_name: string;
  phone: string;
  whatsapp: string | null;
  email: string;
  password_hash: string;
  role: string;
  permission_level: string;
  gender: string | null;
  user_typology: string | null;
}) {
  const pool = getPool();
  try {
    const { rows } = await pool.query(
      `INSERT INTO public.users (
        full_name, phone, whatsapp, email, password_hash, role, permission_level, gender, user_typology
      ) VALUES ($1, $2, $3, $4, $5, COALESCE($6::varchar, 'user'), COALESCE($7::varchar, 'write'), $8, $9)
      RETURNING id, full_name, email, phone, role, permission_level, gender, user_typology, created_at`,
      [
        params.full_name,
        params.phone,
        params.whatsapp ?? null,
        params.email,
        params.password_hash,
        params.role ?? "user",
        params.permission_level ?? "write",
        params.gender ?? null,
        params.user_typology ?? null
      ]
    );
    return { ok: true as const, user: rows[0] };
  } catch (e: unknown) {
    const err = e as { code?: string };
    if (err.code === "23505") return { ok: false as const, reason: "Email déjà utilisé" };
    throw e;
  }
}

export async function updateUserAdmin(params: {
  id: string;
  full_name: string;
  phone: string;
  whatsapp: string | null;
  email: string;
  role: string;
  permission_level: string;
  gender: string | null;
  user_typology: string | null;
}) {
  const pool = getPool();
  const { rows } = await pool.query(
    `UPDATE public.users SET
      full_name = $2,
      phone = $3,
      whatsapp = $4,
      email = $5,
      role = $6,
      permission_level = $7,
      gender = $8,
      user_typology = $9
    WHERE id = $1
    RETURNING id, full_name, email, phone, whatsapp, role, permission_level, gender, user_typology, last_login, created_at`,
    [
      params.id,
      params.full_name,
      params.phone,
      params.whatsapp ?? null,
      params.email,
      params.role,
      params.permission_level,
      params.gender ?? null,
      params.user_typology ?? null
    ]
  );
  return rows[0] ?? null;
}

export async function updateUserPasswordAdmin(userId: string, password_hash: string) {
  return updatePassword(userId, password_hash);
}

export async function deleteUserAdmin(userId: string): Promise<boolean> {
  const pool = getPool();
  const { rowCount } = await pool.query(`DELETE FROM public.users WHERE id = $1`, [userId]);
  return (rowCount ?? 0) > 0;
}

export async function appendAuditLog({
  actorId,
  action,
  targetType,
  targetId,
  metadata,
  ip
}: {
  actorId: string;
  action: string;
  targetType: string | null;
  targetId: string | null;
  metadata: Record<string, unknown>;
  ip: string | null;
}) {
  const pool = getPool();
  await pool.query(
    `INSERT INTO public.admin_audit_logs (actor_id, action, target_type, target_id, metadata, ip)
     VALUES ($1, $2, $3, $4, $5::jsonb, $6)`,
    [actorId, action, targetType ?? null, targetId ?? null, JSON.stringify(metadata ?? {}), ip ?? null]
  );
}

export async function listAuditLogs({ limit = 100 }: { limit?: number }) {
  const pool = getPool();
  const lim = Math.min(500, Math.max(1, limit));
  const { rows } = await pool.query(
    `SELECT l.*, u.email AS actor_email, u.full_name AS actor_name
     FROM public.admin_audit_logs l
     LEFT JOIN public.users u ON u.id = l.actor_id
     ORDER BY l.created_at DESC
     LIMIT $1`,
    [lim]
  );
  return rows.map((r: Record<string, unknown>) => ({
    ...r,
    created_at: iso(r.created_at),
    metadata: r.metadata
  }));
}

export async function insertAdEvent({
  event_type,
  zone,
  user_id,
  session_id,
  metadata
}: {
  event_type: string;
  zone: string;
  user_id: string | null;
  session_id: string | null;
  metadata: Record<string, unknown>;
}) {
  const pool = getPool();
  await pool.query(
    `INSERT INTO public.ad_analytics_events (event_type, zone, user_id, session_id, metadata)
     VALUES ($1, $2, $3, $4, $5::jsonb)`,
    [event_type, zone, user_id ?? null, session_id ?? null, JSON.stringify(metadata ?? {})]
  );
}

export async function adminAnalyticsSnapshot(): Promise<Record<string, unknown>> {
  const pool = getPool();
  const { rows: typeRows } = await pool.query(`SELECT type, COUNT(*)::int AS c FROM public.documents GROUP BY type`);
  const documentsByType: Record<string, number> = {};
  for (const r of typeRows as { type: string; c: number }[]) {
    documentsByType[r.type] = r.c;
  }

  const { rows: hourRows } = await pool.query(
    `SELECT EXTRACT(HOUR FROM created_at)::int AS h, COUNT(*)::int AS c
     FROM public.documents GROUP BY 1 ORDER BY 1`
  );
  const documentsByHour: Record<number, number> = {};
  for (const r of hourRows as { h: number; c: number }[]) {
    documentsByHour[r.h] = r.c;
  }

  const { rows: dowRows } = await pool.query(
    `SELECT EXTRACT(DOW FROM created_at)::int AS d, COUNT(*)::int AS c
     FROM public.documents GROUP BY 1 ORDER BY 1`
  );
  const documentsByWeekday: Record<number, number> = {};
  for (const r of dowRows as { d: number; c: number }[]) {
    documentsByWeekday[r.d] = r.c;
  }

  const { rows: uc } = await pool.query(`SELECT COUNT(*)::int AS c FROM public.users`);
  const userCount = uc[0]?.c ?? 0;

  const { rows: mau } = await pool.query(
    `SELECT COUNT(DISTINCT user_id)::int AS c FROM public.documents
     WHERE created_at > NOW() - INTERVAL '30 days'`
  );
  const monthlyActiveUsers = mau[0]?.c ?? 0;

  const { rows: recent } = await pool.query(
    `SELECT id, full_name, email, last_login FROM public.users ORDER BY last_login DESC NULLS LAST LIMIT 20`
  );
  const recentLogins = (recent as { id: string; full_name: string; email: string; last_login: unknown }[]).map(
    (r) => ({
      id: r.id,
      full_name: r.full_name,
      email: r.email,
      last_login: iso(r.last_login)
    })
  );

  const { rows: demoRows } = await pool.query(`SELECT gender, COUNT(*)::int AS c FROM public.users GROUP BY gender`);
  const demographics: { gender: Record<string, number>; user_typology: Record<string, number> } = {
    gender: {},
    user_typology: {}
  };
  for (const r of demoRows as { gender: string; c: number }[]) {
    if (r.gender) demographics.gender[r.gender] = r.c;
  }
  const { rows: typRows } = await pool.query(
    `SELECT user_typology, COUNT(*)::int AS c FROM public.users WHERE user_typology IS NOT NULL GROUP BY user_typology`
  );
  for (const r of typRows as { user_typology: string; c: number }[]) {
    if (r.user_typology) demographics.user_typology[r.user_typology] = r.c;
  }

  let adSummary = { views: 0, clicks: 0, ctrPct: 0, byZone: {} as Record<string, unknown> };
  try {
    const { rows: adViews } = await pool.query(
      `SELECT zone, COUNT(*)::int AS c FROM public.ad_analytics_events WHERE event_type = 'view' GROUP BY zone`
    );
    const { rows: adClicks } = await pool.query(
      `SELECT zone, COUNT(*)::int AS c FROM public.ad_analytics_events WHERE event_type = 'click' GROUP BY zone`
    );
    let views = 0;
    let clicks = 0;
    const byZone: Record<string, { views?: number; clicks?: number; ctrPct?: number }> = {};
    for (const r of adViews as { zone: string; c: number }[]) {
      views += r.c;
      byZone[r.zone] = { ...(byZone[r.zone] || {}), views: r.c };
    }
    for (const r of adClicks as { zone: string; c: number }[]) {
      clicks += r.c;
      byZone[r.zone] = { ...(byZone[r.zone] || {}), clicks: r.c };
    }
    for (const z of Object.keys(byZone)) {
      const v = byZone[z].views || 0;
      const cl = byZone[z].clicks || 0;
      byZone[z].ctrPct = v > 0 ? Math.round((cl / v) * 10000) / 100 : 0;
    }
    adSummary = {
      views,
      clicks,
      ctrPct: views > 0 ? Math.round((clicks / views) * 10000) / 100 : 0,
      byZone
    };
  } catch {
    /* table absente */
  }

  const { rows: docTotal } = await pool.query(`SELECT COUNT(*)::int AS c FROM public.documents`);
  const documentsTotal = docTotal[0]?.c ?? 0;

  return {
    documentsTotal,
    documentsByType,
    documentsByHour,
    documentsByWeekday,
    userCount,
    monthlyActiveUsers,
    recentLogins,
    demographics,
    adSummary
  };
}
