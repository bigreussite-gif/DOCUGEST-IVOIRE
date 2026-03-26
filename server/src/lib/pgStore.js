const { Pool } = require("pg");

const conn =
  process.env.DATABASE_URL ||
  process.env.INSFORGE_DATABASE_URL ||
  process.env.POSTGRES_URL ||
  "";

function sslOption() {
  if (!conn) return undefined;
  if (process.env.PGSSL === "0") return false;
  if (/sslmode=require|ssl=true/i.test(conn) || process.env.PGSSL === "1") {
    return { rejectUnauthorized: false };
  }
  return undefined;
}

const pool = new Pool({
  connectionString: conn || undefined,
  ssl: sslOption(),
  max: 10
});

function pickUser(row) {
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

function iso(d) {
  if (!d) return null;
  if (d instanceof Date) return d.toISOString();
  return new Date(d).toISOString();
}

async function isEmailTaken(email) {
  const { rows } = await pool.query(
    `SELECT 1 FROM public.users WHERE lower(email) = lower($1) LIMIT 1`,
    [email]
  );
  return rows.length > 0;
}

async function getUserByEmail(email) {
  const { rows } = await pool.query(`SELECT * FROM public.users WHERE lower(email) = lower($1) LIMIT 1`, [
    email
  ]);
  return rows[0] ?? null;
}

async function getUserById(id) {
  const { rows } = await pool.query(`SELECT * FROM public.users WHERE id = $1 LIMIT 1`, [id]);
  return rows[0] ?? null;
}

async function createUser({ full_name, phone, whatsapp, email, password_hash }) {
  try {
    const { rows } = await pool.query(
      `INSERT INTO public.users (
        full_name, phone, whatsapp, email, password_hash
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING *`,
      [full_name, phone, whatsapp ?? null, email, password_hash]
    );
    return { ok: true, user: rows[0] };
  } catch (e) {
    if (e.code === "23505") return { ok: false, reason: "Email déjà utilisé" };
    throw e;
  }
}

async function updatePassword(userId, password_hash) {
  const { rowCount } = await pool.query(`UPDATE public.users SET password_hash = $2 WHERE id = $1`, [
    userId,
    password_hash
  ]);
  return rowCount > 0;
}

async function touchLastLogin(userId) {
  await pool.query(`UPDATE public.users SET last_login = NOW() WHERE id = $1`, [userId]);
}

async function getMe(userId) {
  const user = await getUserById(userId);
  return user ? pickUser(user) : null;
}

async function ensureBootstrapAdmin(userId) {
  const email = process.env.ADMIN_BOOTSTRAP_EMAIL;
  if (!email) return;
  try {
    const u = await getUserById(userId);
    if (!u || String(u.email).toLowerCase() !== email.toLowerCase()) return;
    if (u.role === "super_admin") return;
    await pool.query(`UPDATE public.users SET role = 'super_admin' WHERE id = $1`, [userId]);
  } catch {
    /* migration non appliquée */
  }
}

async function listUsersAdmin() {
  const { rows } = await pool.query(
    `SELECT id, full_name, email, phone, whatsapp, role, permission_level, gender, user_typology,
            company_name, created_at, last_login
     FROM public.users ORDER BY created_at DESC`
  );
  return rows.map((r) => ({
    ...r,
    created_at: iso(r.created_at),
    last_login: iso(r.last_login)
  }));
}

async function createUserAdmin({
  full_name,
  phone,
  whatsapp,
  email,
  password_hash,
  role,
  permission_level,
  gender,
  user_typology
}) {
  try {
    const { rows } = await pool.query(
      `INSERT INTO public.users (
        full_name, phone, whatsapp, email, password_hash, role, permission_level, gender, user_typology
      ) VALUES ($1, $2, $3, $4, $5, COALESCE($6::varchar, 'user'), COALESCE($7::varchar, 'write'), $8, $9)
      RETURNING id, full_name, email, phone, role, permission_level, gender, user_typology, created_at`,
      [
        full_name,
        phone,
        whatsapp ?? null,
        email,
        password_hash,
        role ?? "user",
        permission_level ?? "write",
        gender ?? null,
        user_typology ?? null
      ]
    );
    return { ok: true, user: rows[0] };
  } catch (e) {
    if (e.code === "23505") return { ok: false, reason: "Email déjà utilisé" };
    throw e;
  }
}

async function updateUserAdmin({
  id,
  full_name,
  phone,
  whatsapp,
  email,
  role,
  permission_level,
  gender,
  user_typology
}) {
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
    [id, full_name, phone, whatsapp, email, role, permission_level, gender, user_typology]
  );
  return rows[0] ?? null;
}

async function updateUserPasswordAdmin(userId, password_hash) {
  return updatePassword(userId, password_hash);
}

async function deleteUserAdmin(userId) {
  const { rowCount } = await pool.query(`DELETE FROM public.users WHERE id = $1`, [userId]);
  return rowCount > 0;
}

async function appendAuditLog({ actorId, action, targetType, targetId, metadata, ip }) {
  await pool.query(
    `INSERT INTO public.admin_audit_logs (actor_id, action, target_type, target_id, metadata, ip)
     VALUES ($1, $2, $3, $4, $5::jsonb, $6)`,
    [actorId, action, targetType ?? null, targetId ?? null, JSON.stringify(metadata ?? {}), ip ?? null]
  );
}

async function listAuditLogs({ limit = 100 }) {
  const { rows } = await pool.query(
    `SELECT l.*, u.email AS actor_email, u.full_name AS actor_name
     FROM public.admin_audit_logs l
     LEFT JOIN public.users u ON u.id = l.actor_id
     ORDER BY l.created_at DESC
     LIMIT $1`,
    [Math.min(500, Math.max(1, limit))]
  );
  return rows.map((r) => ({
    ...r,
    created_at: iso(r.created_at),
    metadata: r.metadata
  }));
}

async function insertAdEvent({ event_type, zone, user_id, session_id, metadata }) {
  await pool.query(
    `INSERT INTO public.ad_analytics_events (event_type, zone, user_id, session_id, metadata)
     VALUES ($1, $2, $3, $4, $5::jsonb)`,
    [event_type, zone, user_id ?? null, session_id ?? null, JSON.stringify(metadata ?? {})]
  );
}

async function adminAnalyticsSnapshot() {
  const { rows: typeRows } = await pool.query(
    `SELECT type, COUNT(*)::int AS c FROM public.documents GROUP BY type`
  );
  const documentsByType = {};
  for (const r of typeRows) documentsByType[r.type] = r.c;

  const { rows: hourRows } = await pool.query(
    `SELECT EXTRACT(HOUR FROM created_at)::int AS h, COUNT(*)::int AS c
     FROM public.documents GROUP BY 1 ORDER BY 1`
  );
  const documentsByHour = {};
  for (const r of hourRows) documentsByHour[r.h] = r.c;

  const { rows: dowRows } = await pool.query(
    `SELECT EXTRACT(DOW FROM created_at)::int AS d, COUNT(*)::int AS c
     FROM public.documents GROUP BY 1 ORDER BY 1`
  );
  const documentsByWeekday = {};
  for (const r of dowRows) documentsByWeekday[r.d] = r.c;

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
  const recentLogins = recent.map((r) => ({
    id: r.id,
    full_name: r.full_name,
    email: r.email,
    last_login: iso(r.last_login)
  }));

  const { rows: demoRows } = await pool.query(
    `SELECT gender, COUNT(*)::int AS c FROM public.users GROUP BY gender`
  );
  const demographics = { gender: {}, user_typology: {} };
  for (const r of demoRows) {
    if (r.gender) demographics.gender[r.gender] = r.c;
  }
  const { rows: typRows } = await pool.query(
    `SELECT user_typology, COUNT(*)::int AS c FROM public.users WHERE user_typology IS NOT NULL GROUP BY user_typology`
  );
  for (const r of typRows) {
    if (r.user_typology) demographics.user_typology[r.user_typology] = r.c;
  }

  let adSummary = { views: 0, clicks: 0, ctrPct: 0, byZone: {} };
  try {
    const { rows: adViews } = await pool.query(
      `SELECT zone, COUNT(*)::int AS c FROM public.ad_analytics_events WHERE event_type = 'view' GROUP BY zone`
    );
    const { rows: adClicks } = await pool.query(
      `SELECT zone, COUNT(*)::int AS c FROM public.ad_analytics_events WHERE event_type = 'click' GROUP BY zone`
    );
    let views = 0;
    let clicks = 0;
    const byZone = {};
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

function mapDoc(row) {
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

async function createDocument(doc) {
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
      doc.doc_data,
      doc.pdf_url ?? null
    ]
  );
  return mapDoc(rows[0]);
}

async function updateDocument({ userId, id, type, doc_number, client_name, total_amount, currency, status, doc_data }) {
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
    [userId, id, type, doc_number, client_name, total_amount, currency ?? "FCFA", status ?? "draft", doc_data]
  );
  return mapDoc(rows[0] ?? null);
}

async function listDocuments({ userId, type, page, limit }) {
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
  return { items: rows.map(mapDoc), total };
}

async function getDocumentById({ userId, id }) {
  const { rows } = await pool.query(
    `SELECT * FROM public.documents WHERE user_id = $1 AND id = $2 LIMIT 1`,
    [userId, id]
  );
  return mapDoc(rows[0] ?? null);
}

async function deleteDocumentById({ userId, id }) {
  const { rowCount } = await pool.query(`DELETE FROM public.documents WHERE user_id = $1 AND id = $2`, [
    userId,
    id
  ]);
  return rowCount > 0;
}

async function verifyPasswordByEmail({ email, passwordHashCandidate }) {
  return getUserByEmail(email);
}

module.exports = {
  pool,
  createUser,
  getUserByEmail,
  getUserById,
  getMe,
  ensureBootstrapAdmin,
  updatePassword,
  touchLastLogin,
  createDocument,
  updateDocument,
  listDocuments,
  getDocumentById,
  deleteDocumentById,
  verifyPasswordByEmail,
  isEmailTaken,
  listUsersAdmin,
  createUserAdmin,
  updateUserAdmin,
  updateUserPasswordAdmin,
  deleteUserAdmin,
  appendAuditLog,
  listAuditLogs,
  insertAdEvent,
  adminAnalyticsSnapshot
};
