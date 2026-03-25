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
    company_regime: row.company_regime ?? null
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
  getMe,
  updatePassword,
  touchLastLogin,
  createDocument,
  listDocuments,
  getDocumentById,
  deleteDocumentById,
  verifyPasswordByEmail,
  isEmailTaken
};
