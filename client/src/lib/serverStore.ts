/**
 * Accès données Postgres (Insforge) pour les Route Handlers Next.js.
 * Logique alignée sur server/lib/pgStore.js (sans Express).
 */
import { getPool, runWithDbRetry } from "@/lib/db";
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

async function withPgRetry<T>(fn: () => Promise<T>): Promise<T> {
  return runWithDbRetry(fn, 4);
}

export async function getUserByEmail(email: string): Promise<UserRow | null> {
  const { rows } = await withPgRetry(async () => {
    const pool = getPool();
    return pool.query(`SELECT * FROM public.users WHERE lower(email) = lower($1) LIMIT 1`, [email]);
  });
  return (rows[0] as UserRow) ?? null;
}

function digitsOnly(v: string): string {
  return v.replace(/\D/g, "");
}

function buildLoginDigitCandidates(rawDigits: string): string[] {
  const out = new Set<string>();
  const d = rawDigits.trim();
  if (!d) return [];

  out.add(d);

  // Variante internationale souvent saisie en 00...
  if (d.startsWith("00") && d.length > 2) {
    out.add(d.slice(2));
  }

  // Cas Cote d'Ivoire: +225XXXXXXXXXX / 0XXXXXXXXX / XXXXXXXXX
  if (d.startsWith("225") && d.length > 3) {
    const local = d.slice(3);
    out.add(local);
    out.add(`0${local}`);
  }
  if (d.startsWith("0") && d.length > 1) {
    const localNoZero = d.slice(1);
    out.add(localNoZero);
    out.add(`225${localNoZero}`);
  }

  // Si l'utilisateur saisit un numéro local sans indicatif.
  if (d.length === 10) {
    out.add(`225${d}`);
    if (d.startsWith("0")) out.add(`225${d.slice(1)}`);
  }
  if (d.length === 9) {
    out.add(`225${d}`);
    out.add(`0${d}`);
  }

  return Array.from(out).filter(Boolean);
}

/** Recherche login par email, téléphone ou WhatsApp. */
export async function getUserByLoginIdentifier(identifier: string): Promise<UserRow | null> {
  const clean = identifier.trim();
  if (!clean) return null;
  const digits = digitsOnly(clean);
  try {
    // 1) Email prioritaire (chemin le plus fiable).
    const byEmail = await getUserByEmail(clean);
    if (byEmail) return byEmail;

    // 2) Fallback par numéro (téléphone/WhatsApp) avec variantes locales/internationales.
    const digitCandidates = buildLoginDigitCandidates(digits);
    for (const candidate of digitCandidates) {
      const { rows } = await withPgRetry(async () => {
        const pool = getPool();
        return pool.query(
          `SELECT * FROM public.users
           WHERE regexp_replace(coalesce(phone::text, ''), '[^0-9]', '', 'g') = $1
              OR regexp_replace(coalesce(whatsapp::text, ''), '[^0-9]', '', 'g') = $1
           LIMIT 1`,
          [candidate]
        );
      });
      if (rows[0]) return rows[0] as UserRow;
    }

    return null;
  } catch (e) {
    console.warn("[serverStore] fallback getUserByEmail sur getUserByLoginIdentifier", e);
    return getUserByEmail(clean);
  }
}

export async function getUserById(id: string): Promise<UserRow | null> {
  const { rows } = await withPgRetry(async () => {
    const pool = getPool();
    return pool.query(`SELECT * FROM public.users WHERE id = $1 LIMIT 1`, [id]);
  });
  return (rows[0] as UserRow) ?? null;
}

export async function getMe(userId: string): Promise<PublicUser | null> {
  const u = await getUserById(userId);
  return u ? pickUser(u) : null;
}

export async function touchLastLogin(userId: string): Promise<void> {
  await withPgRetry(async () => {
    const pool = getPool();
    await pool.query(`UPDATE public.users SET last_login = NOW() WHERE id = $1`, [userId]);
  });
}

export async function ensureBootstrapAdmin(userId: string): Promise<void> {
  const bootstrapEmail = process.env.ADMIN_BOOTSTRAP_EMAIL?.toLowerCase() ?? null;
  try {
    const pool = getPool();
    const u = await getUserById(userId);
    if (!u) return;
    if (u.role === "super_admin") return;

    const userEmail = String(u.email ?? "").toLowerCase();

    // Mode explicite: si l'email bootstrap est configuré et correspond → toujours promouvoir
    // (outrepasse la limite "un seul super_admin" : c'est le compte propriétaire).
    if (bootstrapEmail && userEmail === bootstrapEmail) {
      await pool.query(`UPDATE public.users SET role = 'super_admin' WHERE id = $1`, [userId]);
      console.log("[serverStore] ensureBootstrapAdmin: promouvoir via ADMIN_BOOTSTRAP_EMAIL", userId);
      return;
    }

    // Mode sécurité terrain: si aucun super_admin n'existe, on élève
    // le premier utilisateur connecté pour débloquer l'accès admin.
    const { rows } = await pool.query(`SELECT COUNT(*)::int AS c FROM public.users WHERE role = 'super_admin'`);
    const count = Number(rows[0]?.c ?? 0);
    if (count === 0) {
      await pool.query(`UPDATE public.users SET role = 'super_admin' WHERE id = $1`, [userId]);
      console.log("[serverStore] ensureBootstrapAdmin: premier super_admin auto-promu", userId);
    }
  } catch {
    /* colonne role non migrée ou connexion DB — ignoré */
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

type AdSlotConfig = {
  slot: string;
  page: string;
  category: string;
  title: string;
  body: string;
  ctaLabel: string;
  ctaUrl: string;
  /** Image WebP (data URL) compressée côté client */
  imageDataUrl: string;
  /** Remplissage du cadre : cover = sans bandes vides, contain = image entière */
  imageFit: "cover" | "contain";
  /** Proportions du cadre affiché sur le site */
  imageFrame: "banner" | "photo" | "square";
  /** Code HTML brut injecté (AdSense, bannière partenaire…) */
  htmlEmbed: string;
  active: boolean;
  updated_at: string | null;
};

export async function upsertAdSlotConfig({
  actorId,
  slot,
  page,
  category,
  title,
  body,
  ctaLabel,
  ctaUrl,
  imageDataUrl,
  imageFit,
  imageFrame,
  htmlEmbed,
  active
}: {
  actorId: string;
  slot: string;
  page: string;
  category: string;
  title: string;
  body: string;
  ctaLabel: string;
  ctaUrl: string;
  imageDataUrl?: string;
  imageFit?: "cover" | "contain";
  imageFrame?: "banner" | "photo" | "square";
  htmlEmbed?: string;
  active: boolean;
}) {
  await appendAuditLog({
    actorId,
    action: "ads.config.upsert",
    targetType: "ad_slot",
    targetId: slot,
    metadata: {
      slot,
      page,
      category,
      title,
      body,
      ctaLabel,
      ctaUrl,
      imageDataUrl: imageDataUrl ?? "",
      imageFit: imageFit ?? "cover",
      imageFrame: imageFrame ?? "photo",
      htmlEmbed: htmlEmbed ?? "",
      active
    },
    ip: null
  });
}

export async function listAdSlotsConfig(): Promise<AdSlotConfig[]> {
  const pool = getPool();
  const { rows } = await pool.query(
    `SELECT target_id, metadata, created_at
     FROM public.admin_audit_logs
     WHERE action = 'ads.config.upsert'
     ORDER BY created_at DESC
     LIMIT 500`
  );

  const seen = new Set<string>();
  const out: AdSlotConfig[] = [];
  for (const row of rows as { target_id: string | null; metadata: unknown; created_at: unknown }[]) {
    const slot = String(row.target_id ?? "");
    if (!slot || seen.has(slot)) continue;
    const m = (row.metadata ?? {}) as Record<string, unknown>;
    out.push({
      slot,
      page: String(m.page ?? "global"),
      category: String(m.category ?? "general"),
      title: String(m.title ?? ""),
      body: String(m.body ?? ""),
      ctaLabel: String(m.ctaLabel ?? ""),
      ctaUrl: String(m.ctaUrl ?? ""),
      imageDataUrl: String(m.imageDataUrl ?? ""),
      imageFit: m.imageFit === "contain" ? "contain" : "cover",
      imageFrame:
        m.imageFrame === "banner" || m.imageFrame === "square" ? (m.imageFrame as "banner" | "square") : "photo",
      htmlEmbed: String(m.htmlEmbed ?? ""),
      active: Boolean(m.active ?? true),
      updated_at: iso(row.created_at)
    });
    seen.add(slot);
  }
  return out.sort((a, b) => a.slot.localeCompare(b.slot));
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

/** Plage inclusive/exclusive en UTC pour filtrer les analytics admin (documents, pubs, etc.). */
export type AdminAnalyticsRange = { fromInclusive: Date; toExclusive: Date };

function fillTrendGaps(
  rows: { d: string; c: number }[],
  fromInclusive: Date,
  toExclusive: Date
): { day: string; count: number }[] {
  const byDay = new Map(rows.map((r) => [r.d, r.c]));
  const out: { day: string; count: number }[] = [];
  const cur = new Date(fromInclusive.getTime());
  cur.setUTCHours(0, 0, 0, 0);
  const end = new Date(toExclusive.getTime());
  end.setUTCHours(0, 0, 0, 0);
  while (cur < end) {
    const key = cur.toISOString().slice(0, 10);
    out.push({ day: key, count: byDay.get(key) ?? 0 });
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return out;
}

export async function adminAnalyticsSnapshot(range?: AdminAnalyticsRange | null): Promise<Record<string, unknown>> {
  const pool = getPool();
  const useRange =
    range != null && range.fromInclusive.getTime() < range.toExclusive.getTime();
  const p = useRange ? [range!.fromInclusive, range!.toExclusive] : [];

  const docWhere = useRange
    ? "WHERE created_at >= $1::timestamptz AND created_at < $2::timestamptz"
    : "";

  const { rows: typeRows } = useRange
    ? await pool.query(
        `SELECT type, COUNT(*)::int AS c FROM public.documents ${docWhere} GROUP BY type`,
        p
      )
    : await pool.query(`SELECT type, COUNT(*)::int AS c FROM public.documents GROUP BY type`);
  const documentsByType: Record<string, number> = {};
  for (const r of typeRows as { type: string; c: number }[]) {
    documentsByType[r.type] = r.c;
  }

  const { rows: hourRows } = useRange
    ? await pool.query(
        `SELECT EXTRACT(HOUR FROM created_at)::int AS h, COUNT(*)::int AS c
         FROM public.documents ${docWhere} GROUP BY 1 ORDER BY 1`,
        p
      )
    : await pool.query(
        `SELECT EXTRACT(HOUR FROM created_at)::int AS h, COUNT(*)::int AS c
         FROM public.documents GROUP BY 1 ORDER BY 1`
      );
  const documentsByHour: Record<number, number> = {};
  for (const r of hourRows as { h: number; c: number }[]) {
    documentsByHour[r.h] = r.c;
  }

  const { rows: dowRows } = useRange
    ? await pool.query(
        `SELECT EXTRACT(DOW FROM created_at)::int AS d, COUNT(*)::int AS c
         FROM public.documents ${docWhere} GROUP BY 1 ORDER BY 1`,
        p
      )
    : await pool.query(
        `SELECT EXTRACT(DOW FROM created_at)::int AS d, COUNT(*)::int AS c
         FROM public.documents GROUP BY 1 ORDER BY 1`
      );
  const documentsByWeekday: Record<number, number> = {};
  for (const r of dowRows as { d: number; c: number }[]) {
    documentsByWeekday[r.d] = r.c;
  }

  const { rows: uc } = useRange
    ? await pool.query(
        `SELECT COUNT(*)::int AS c FROM public.users
         WHERE created_at >= $1::timestamptz AND created_at < $2::timestamptz`,
        p
      )
    : await pool.query(`SELECT COUNT(*)::int AS c FROM public.users`);
  const userCount = uc[0]?.c ?? 0;

  let documentsTrendLast14Days: { day: string; count: number }[] = [];
  if (useRange) {
    const { rows: trendRows } = await pool.query(
      `SELECT to_char((created_at AT TIME ZONE 'UTC')::date, 'YYYY-MM-DD') AS d, COUNT(*)::int AS c
       FROM public.documents
       WHERE created_at >= $1::timestamptz AND created_at < $2::timestamptz
       GROUP BY 1 ORDER BY 1`,
      p
    );
    documentsTrendLast14Days = fillTrendGaps(
      trendRows as { d: string; c: number }[],
      range!.fromInclusive,
      range!.toExclusive
    );
  } else {
    const { rows: trendRows } = await pool.query(
      `SELECT to_char(date_trunc('day', created_at), 'YYYY-MM-DD') AS d, COUNT(*)::int AS c
       FROM public.documents
       WHERE created_at >= NOW() - INTERVAL '14 days'
       GROUP BY 1 ORDER BY 1`
    );
    documentsTrendLast14Days = (trendRows as { d: string; c: number }[]).map((r) => ({ day: r.d, count: r.c }));
  }

  const { rows: mau } = useRange
    ? await pool.query(
        `SELECT COUNT(DISTINCT user_id)::int AS c FROM public.documents
         WHERE created_at >= $1::timestamptz AND created_at < $2::timestamptz`,
        p
      )
    : await pool.query(
        `SELECT COUNT(DISTINCT user_id)::int AS c FROM public.documents
         WHERE created_at > NOW() - INTERVAL '30 days'`
      );
  const monthlyActiveUsers = mau[0]?.c ?? 0;

  const { rows: recent } = useRange
    ? await pool.query(
        `SELECT id, full_name, email, last_login FROM public.users
         WHERE last_login >= $1::timestamptz AND last_login < $2::timestamptz
         ORDER BY last_login DESC NULLS LAST LIMIT 20`,
        p
      )
    : await pool.query(`SELECT id, full_name, email, last_login FROM public.users ORDER BY last_login DESC NULLS LAST LIMIT 20`);
  const recentLogins = (recent as { id: string; full_name: string; email: string; last_login: unknown }[]).map(
    (r) => ({
      id: r.id,
      full_name: r.full_name,
      email: r.email,
      last_login: iso(r.last_login)
    })
  );

  const demographics: { gender: Record<string, number>; user_typology: Record<string, number> } = {
    gender: {},
    user_typology: {}
  };
  if (useRange) {
    const { rows: demoRows } = await pool.query(
      `SELECT gender, COUNT(*)::int AS c FROM public.users
       WHERE created_at >= $1::timestamptz AND created_at < $2::timestamptz
       GROUP BY gender`,
      p
    );
    for (const r of demoRows as { gender: string; c: number }[]) {
      if (r.gender) demographics.gender[r.gender] = r.c;
    }
    const { rows: typRows } = await pool.query(
      `SELECT user_typology, COUNT(*)::int AS c FROM public.users
       WHERE user_typology IS NOT NULL
         AND created_at >= $1::timestamptz AND created_at < $2::timestamptz
       GROUP BY user_typology`,
      p
    );
    for (const r of typRows as { user_typology: string; c: number }[]) {
      if (r.user_typology) demographics.user_typology[r.user_typology] = r.c;
    }
  } else {
    const { rows: demoRows } = await pool.query(`SELECT gender, COUNT(*)::int AS c FROM public.users GROUP BY gender`);
    for (const r of demoRows as { gender: string; c: number }[]) {
      if (r.gender) demographics.gender[r.gender] = r.c;
    }
    const { rows: typRows } = await pool.query(
      `SELECT user_typology, COUNT(*)::int AS c FROM public.users WHERE user_typology IS NOT NULL GROUP BY user_typology`
    );
    for (const r of typRows as { user_typology: string; c: number }[]) {
      if (r.user_typology) demographics.user_typology[r.user_typology] = r.c;
    }
  }

  const { rows: countryRows } = useRange
    ? await pool.query(
        `SELECT coalesce(nullif(trim(user_typology), ''), 'Non renseigné') AS country, COUNT(*)::int AS c
         FROM public.users
         WHERE last_login IS NOT NULL
           AND last_login >= $1::timestamptz AND last_login < $2::timestamptz
         GROUP BY 1 ORDER BY c DESC LIMIT 10`,
        p
      )
    : await pool.query(
        `SELECT coalesce(nullif(trim(user_typology), ''), 'Non renseigné') AS country, COUNT(*)::int AS c
         FROM public.users
         WHERE last_login IS NOT NULL
         GROUP BY 1 ORDER BY c DESC LIMIT 10`
      );
  const topCountriesByLogin = (countryRows as { country: string; c: number }[]).map((r) => ({
    country: r.country,
    count: r.c
  }));

  let adSummary = { views: 0, clicks: 0, ctrPct: 0, byZone: {} as Record<string, unknown> };
  try {
    let adViews: { zone: string; c: number }[];
    let adClicks: { zone: string; c: number }[];
    if (useRange) {
      try {
        adViews = (
          await pool.query(
            `SELECT zone, COUNT(*)::int AS c FROM public.ad_analytics_events
             WHERE event_type = 'view' AND created_at >= $1::timestamptz AND created_at < $2::timestamptz
             GROUP BY zone`,
            p
          )
        ).rows as { zone: string; c: number }[];
        adClicks = (
          await pool.query(
            `SELECT zone, COUNT(*)::int AS c FROM public.ad_analytics_events
             WHERE event_type = 'click' AND created_at >= $1::timestamptz AND created_at < $2::timestamptz
             GROUP BY zone`,
            p
          )
        ).rows as { zone: string; c: number }[];
      } catch {
        /* colonne created_at absente : repli sans filtre date */
        adViews = (
          await pool.query(
            `SELECT zone, COUNT(*)::int AS c FROM public.ad_analytics_events WHERE event_type = 'view' GROUP BY zone`
          )
        ).rows as { zone: string; c: number }[];
        adClicks = (
          await pool.query(
            `SELECT zone, COUNT(*)::int AS c FROM public.ad_analytics_events WHERE event_type = 'click' GROUP BY zone`
          )
        ).rows as { zone: string; c: number }[];
      }
    } else {
      adViews = (
        await pool.query(`SELECT zone, COUNT(*)::int AS c FROM public.ad_analytics_events WHERE event_type = 'view' GROUP BY zone`)
      ).rows as { zone: string; c: number }[];
      adClicks = (
        await pool.query(`SELECT zone, COUNT(*)::int AS c FROM public.ad_analytics_events WHERE event_type = 'click' GROUP BY zone`)
      ).rows as { zone: string; c: number }[];
    }
    let views = 0;
    let clicks = 0;
    const byZone: Record<string, { views?: number; clicks?: number; ctrPct?: number }> = {};
    for (const r of adViews) {
      views += r.c;
      byZone[r.zone] = { ...(byZone[r.zone] || {}), views: r.c };
    }
    for (const r of adClicks) {
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

  const { rows: docTotal } = useRange
    ? await pool.query(`SELECT COUNT(*)::int AS c FROM public.documents ${docWhere}`, p)
    : await pool.query(`SELECT COUNT(*)::int AS c FROM public.documents`);
  const documentsTotal = docTotal[0]?.c ?? 0;

  return {
    documentsTotal,
    documentsByType,
    documentsByHour,
    documentsByWeekday,
    documentsTrendLast14Days,
    userCount,
    monthlyActiveUsers,
    recentLogins,
    demographics,
    adSummary,
    topCountriesByLogin
  };
}

// ─────────────────────────────────────────────
// BLOG
// ─────────────────────────────────────────────

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  cover_image_url: string;
  category: string;
  author_name: string;
  published: boolean;
  published_at: string | null;
  meta_title: string;
  meta_description: string;
  reading_time_min: number;
  created_at: string;
  updated_at: string;
};

async function ensureBlogTable(): Promise<void> {
  const pool = getPool();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS public.blog_posts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      excerpt TEXT DEFAULT '',
      content TEXT DEFAULT '',
      cover_image_url TEXT DEFAULT '',
      category TEXT DEFAULT 'general',
      author_name TEXT DEFAULT 'DocuGest Ivoire',
      published BOOLEAN DEFAULT false,
      published_at TIMESTAMPTZ,
      meta_title TEXT DEFAULT '',
      meta_description TEXT DEFAULT '',
      reading_time_min INTEGER DEFAULT 3,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    )
  `);
}

function blogRowToPost(row: Record<string, unknown>): BlogPost {
  return {
    id: String(row.id ?? ""),
    slug: String(row.slug ?? ""),
    title: String(row.title ?? ""),
    excerpt: String(row.excerpt ?? ""),
    content: String(row.content ?? ""),
    cover_image_url: String(row.cover_image_url ?? ""),
    category: String(row.category ?? "general"),
    author_name: String(row.author_name ?? "DocuGest Ivoire"),
    published: Boolean(row.published),
    published_at: iso(row.published_at),
    meta_title: String(row.meta_title ?? ""),
    meta_description: String(row.meta_description ?? ""),
    reading_time_min: Number(row.reading_time_min ?? 3),
    created_at: iso(row.created_at) ?? new Date().toISOString(),
    updated_at: iso(row.updated_at) ?? new Date().toISOString(),
  };
}

export async function listBlogPosts(opts?: { publishedOnly?: boolean }): Promise<BlogPost[]> {
  await runWithDbRetry(() => ensureBlogTable(), 3);
  const pool = getPool();
  const where = opts?.publishedOnly ? "WHERE published = true" : "";
  const { rows } = await pool.query(
    `SELECT * FROM public.blog_posts ${where} ORDER BY COALESCE(published_at, created_at) DESC`
  );
  return (rows as Record<string, unknown>[]).map(blogRowToPost);
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  await runWithDbRetry(() => ensureBlogTable(), 3);
  const pool = getPool();
  const { rows } = await pool.query("SELECT * FROM public.blog_posts WHERE slug = $1 LIMIT 1", [slug]);
  return rows.length > 0 ? blogRowToPost(rows[0] as Record<string, unknown>) : null;
}

export async function upsertBlogPost(
  post: Partial<BlogPost> & { slug: string; title: string }
): Promise<BlogPost> {
  await runWithDbRetry(() => ensureBlogTable(), 3);
  const pool = getPool();
  const {
    id, slug, title,
    excerpt = "", content = "", cover_image_url = "",
    category = "general", author_name = "DocuGest Ivoire",
    published = false, published_at,
    meta_title = "", meta_description = "", reading_time_min = 3,
  } = post;

  const publishedAt = published && !published_at ? new Date().toISOString() : (published_at ?? null);

  if (id) {
    const { rows } = await pool.query(
      `UPDATE public.blog_posts SET
        slug=$2, title=$3, excerpt=$4, content=$5, cover_image_url=$6,
        category=$7, author_name=$8, published=$9, published_at=$10,
        meta_title=$11, meta_description=$12, reading_time_min=$13, updated_at=now()
       WHERE id=$1 RETURNING *`,
      [id, slug, title, excerpt, content, cover_image_url, category, author_name,
       published, publishedAt, meta_title, meta_description, reading_time_min]
    );
    return blogRowToPost(rows[0] as Record<string, unknown>);
  }

  const { rows } = await pool.query(
    `INSERT INTO public.blog_posts
       (slug,title,excerpt,content,cover_image_url,category,author_name,published,published_at,meta_title,meta_description,reading_time_min)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
     ON CONFLICT (slug) DO UPDATE SET
       title=EXCLUDED.title, excerpt=EXCLUDED.excerpt, content=EXCLUDED.content,
       cover_image_url=EXCLUDED.cover_image_url, category=EXCLUDED.category,
       author_name=EXCLUDED.author_name, published=EXCLUDED.published,
       published_at=EXCLUDED.published_at, meta_title=EXCLUDED.meta_title,
       meta_description=EXCLUDED.meta_description, reading_time_min=EXCLUDED.reading_time_min,
       updated_at=now()
     RETURNING *`,
    [slug, title, excerpt, content, cover_image_url, category, author_name,
     published, publishedAt, meta_title, meta_description, reading_time_min]
  );
  return blogRowToPost(rows[0] as Record<string, unknown>);
}

export async function deleteBlogPost(id: string): Promise<void> {
  await runWithDbRetry(() => ensureBlogTable(), 3);
  const pool = getPool();
  await pool.query("DELETE FROM public.blog_posts WHERE id=$1", [id]);
}
