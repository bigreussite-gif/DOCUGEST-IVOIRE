const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");

const dataDir = process.env.INFORGE_DEV_DIR
  ? path.resolve(process.env.INFORGE_DEV_DIR)
  : path.resolve(__dirname, "../../local-inforge-dev");
const usersFile = path.join(dataDir, "users.json");
const documentsFile = path.join(dataDir, "documents.json");
const auditFile = path.join(dataDir, "admin_audit.json");
const adEventsFile = path.join(dataDir, "ad_analytics_events.json");

async function ensureDir() {
  await fs.mkdir(dataDir, { recursive: true });
}

async function readJson(file, fallback) {
  try {
    const raw = await fs.readFile(file, "utf8");
    return JSON.parse(raw);
  } catch (e) {
    return fallback;
  }
}

async function writeJsonAtomic(file, value) {
  await ensureDir();
  const tmp = `${file}.${crypto.randomUUID()}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(value, null, 2), "utf8");
  await fs.rename(tmp, file);
}

async function loadUsers() {
  return readJson(usersFile, []);
}

async function loadDocuments() {
  return readJson(documentsFile, []);
}

async function saveUsers(users) {
  await writeJsonAtomic(usersFile, users);
}

async function saveDocuments(docs) {
  await writeJsonAtomic(documentsFile, docs);
}

function pickUser(user) {
  return {
    id: user.id,
    full_name: user.full_name,
    phone: user.phone,
    whatsapp: user.whatsapp ?? null,
    email: user.email,
    company_name: user.company_name ?? null,
    company_logo_url: user.company_logo_url ?? null,
    company_address: user.company_address ?? null,
    company_ncc: user.company_ncc ?? null,
    company_rccm: user.company_rccm ?? null,
    company_dfe: user.company_dfe ?? null,
    company_regime: user.company_regime ?? null,
    role: user.role ?? "user",
    permission_level: user.permission_level ?? "write",
    gender: user.gender ?? null,
    user_typology: user.user_typology ?? null
  };
}

async function isEmailTaken(email) {
  const users = await loadUsers();
  return users.some((u) => u.email.toLowerCase() === String(email).toLowerCase());
}

async function getUserByEmail(email) {
  const users = await loadUsers();
  return users.find((u) => u.email.toLowerCase() === String(email).toLowerCase()) ?? null;
}

async function getUserById(id) {
  const users = await loadUsers();
  return users.find((u) => u.id === id) ?? null;
}

async function upsertUser(user) {
  const users = await loadUsers();
  const idx = users.findIndex((u) => u.id === user.id);
  if (idx >= 0) users[idx] = user;
  else users.push(user);
  await saveUsers(users);
}

// =========================
// AUTH / USERS
// =========================

async function createUser({ full_name, phone, whatsapp, email, password_hash }) {
  const users = await loadUsers();
  const exists = users.some((u) => u.email.toLowerCase() === String(email).toLowerCase());
  if (exists) return { ok: false, reason: "Email déjà utilisé" };

  const user = {
    id: crypto.randomUUID(),
    full_name,
    phone,
    whatsapp: whatsapp ?? null,
    email,
    password_hash,
    company_name: null,
    company_logo_url: null,
    company_address: null,
    company_ncc: null,
    company_rccm: null,
    company_dfe: null,
    company_regime: "informal",
    role: "user",
    permission_level: "write",
    gender: null,
    user_typology: null,
    created_at: new Date().toISOString(),
    last_login: null
  };

  users.push(user);
  await saveUsers(users);
  return { ok: true, user };
}

async function verifyPasswordByEmail({ email, passwordHashCandidate }) {
  const user = await getUserByEmail(email);
  if (!user) return null;
  return user;
}

async function updatePassword(userId, password_hash) {
  const users = await loadUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx < 0) return false;
  users[idx].password_hash = password_hash;
  await saveUsers(users);
  return true;
}

async function touchLastLogin(userId) {
  const users = await loadUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx < 0) return;
  users[idx].last_login = new Date().toISOString();
  await saveUsers(users);
}

// =========================
// DOCUMENTS
// =========================

async function createDocument(doc) {
  const docs = await loadDocuments();
  const row = {
    id: crypto.randomUUID(),
    user_id: doc.user_id,
    type: doc.type,
    doc_number: doc.doc_number,
    client_name: doc.client_name,
    total_amount: doc.total_amount,
    currency: doc.currency ?? "FCFA",
    status: doc.status ?? "draft",
    doc_data: doc.doc_data,
    pdf_url: doc.pdf_url ?? null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  docs.push(row);
  await saveDocuments(docs);
  return row;
}

async function updateDocument({ userId, id, type, doc_number, client_name, total_amount, currency, status, doc_data }) {
  const docs = await loadDocuments();
  const idx = docs.findIndex((d) => d.user_id === userId && d.id === id);
  if (idx < 0) return null;
  docs[idx] = {
    ...docs[idx],
    type,
    doc_number,
    client_name,
    total_amount,
    currency: currency ?? "FCFA",
    status: status ?? "draft",
    doc_data,
    updated_at: new Date().toISOString()
  };
  await saveDocuments(docs);
  return docs[idx];
}

async function listDocuments({ userId, type, page, limit }) {
  const docs = await loadDocuments();
  let filtered = docs.filter((d) => d.user_id === userId);
  if (type) filtered = filtered.filter((d) => d.type === type);
  filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const from = (page - 1) * limit;
  const items = filtered.slice(from, from + limit);
  return { items, total: filtered.length };
}

async function getDocumentById({ userId, id }) {
  const docs = await loadDocuments();
  return docs.find((d) => d.user_id === userId && d.id === id) ?? null;
}

async function deleteDocumentById({ userId, id }) {
  const docs = await loadDocuments();
  const next = docs.filter((d) => !(d.user_id === userId && d.id === id));
  if (next.length === docs.length) return false;
  await saveDocuments(next);
  return true;
}

async function getMe(userId) {
  const user = await getUserById(userId);
  return user ? pickUser(user) : null;
}

async function ensureBootstrapAdmin(userId) {
  const email = process.env.ADMIN_BOOTSTRAP_EMAIL;
  if (!email) return;
  const users = await loadUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx < 0) return;
  const u = users[idx];
  if (String(u.email).toLowerCase() !== email.toLowerCase()) return;
  if (u.role === "super_admin") return;
  users[idx].role = "super_admin";
  await saveUsers(users);
}

async function listUsersAdmin() {
  const users = await loadUsers();
  return users
    .map((u) => ({
      id: u.id,
      full_name: u.full_name,
      email: u.email,
      phone: u.phone,
      whatsapp: u.whatsapp ?? null,
      role: u.role ?? "user",
      permission_level: u.permission_level ?? "write",
      gender: u.gender ?? null,
      user_typology: u.user_typology ?? null,
      company_name: u.company_name ?? null,
      created_at: u.created_at,
      last_login: u.last_login ?? null
    }))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
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
  const users = await loadUsers();
  const exists = users.some((u) => u.email.toLowerCase() === String(email).toLowerCase());
  if (exists) return { ok: false, reason: "Email déjà utilisé" };
  const user = {
    id: crypto.randomUUID(),
    full_name,
    phone,
    whatsapp: whatsapp ?? null,
    email,
    password_hash,
    company_name: null,
    company_logo_url: null,
    company_address: null,
    company_ncc: null,
    company_rccm: null,
    company_dfe: null,
    company_regime: "informal",
    role: role ?? "user",
    permission_level: permission_level ?? "write",
    gender: gender ?? null,
    user_typology: user_typology ?? null,
    created_at: new Date().toISOString(),
    last_login: null
  };
  users.push(user);
  await saveUsers(users);
  return { ok: true, user: { id: user.id, full_name: user.full_name, email: user.email } };
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
  const users = await loadUsers();
  const idx = users.findIndex((u) => u.id === id);
  if (idx < 0) return null;
  users[idx] = {
    ...users[idx],
    full_name,
    phone,
    whatsapp,
    email,
    role,
    permission_level,
    gender,
    user_typology
  };
  await saveUsers(users);
  return pickUser(users[idx]);
}

async function updateUserPasswordAdmin(userId, password_hash) {
  return updatePassword(userId, password_hash);
}

async function deleteUserAdmin(userId) {
  const users = await loadUsers();
  const next = users.filter((u) => u.id !== userId);
  if (next.length === users.length) return false;
  await saveUsers(next);
  const docs = await loadDocuments();
  const docs2 = docs.filter((d) => d.user_id !== userId);
  await saveDocuments(docs2);
  return true;
}

async function appendAuditLog({ actorId, action, targetType, targetId, metadata, ip }) {
  const logs = await readJson(auditFile, []);
  logs.unshift({
    id: crypto.randomUUID(),
    actor_id: actorId,
    action,
    target_type: targetType,
    target_id: targetId,
    metadata: metadata ?? {},
    ip: ip ?? null,
    created_at: new Date().toISOString()
  });
  await writeJsonAtomic(auditFile, logs.slice(0, 2000));
}

async function listAuditLogs({ limit = 100 }) {
  const logs = await readJson(auditFile, []);
  const users = await loadUsers();
  const emailOf = (id) => users.find((u) => u.id === id)?.email ?? null;
  const nameOf = (id) => users.find((u) => u.id === id)?.full_name ?? null;
  return logs.slice(0, Math.min(500, limit)).map((l) => ({
    ...l,
    actor_email: emailOf(l.actor_id),
    actor_name: nameOf(l.actor_id)
  }));
}

async function insertAdEvent({ event_type, zone, user_id, session_id, metadata }) {
  const ev = await readJson(adEventsFile, []);
  ev.push({
    id: crypto.randomUUID(),
    event_type,
    zone,
    user_id: user_id ?? null,
    session_id: session_id ?? null,
    metadata: metadata ?? {},
    created_at: new Date().toISOString()
  });
  await writeJsonAtomic(adEventsFile, ev.slice(-10000));
}

async function adminAnalyticsSnapshot() {
  const docs = await loadDocuments();
  const users = await loadUsers();
  const ev = await readJson(adEventsFile, []);

  const documentsByType = {};
  for (const d of docs) {
    documentsByType[d.type] = (documentsByType[d.type] || 0) + 1;
  }

  const documentsByHour = {};
  const documentsByWeekday = {};
  for (const d of docs) {
    const t = new Date(d.created_at);
    const h = t.getHours();
    const dow = t.getDay();
    documentsByHour[h] = (documentsByHour[h] || 0) + 1;
    documentsByWeekday[dow] = (documentsByWeekday[dow] || 0) + 1;
  }

  const thirty = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const activeSet = new Set();
  for (const d of docs) {
    if (new Date(d.created_at).getTime() > thirty) activeSet.add(d.user_id);
  }

  const recentLogins = users
    .filter((u) => u.last_login)
    .sort((a, b) => new Date(b.last_login).getTime() - new Date(a.last_login).getTime())
    .slice(0, 20)
    .map((u) => ({
      id: u.id,
      full_name: u.full_name,
      email: u.email,
      last_login: u.last_login
    }));

  const demographics = { gender: {}, user_typology: {} };
  for (const u of users) {
    if (u.gender) demographics.gender[u.gender] = (demographics.gender[u.gender] || 0) + 1;
    if (u.user_typology) demographics.user_typology[u.user_typology] = (demographics.user_typology[u.user_typology] || 0) + 1;
  }

  let views = 0;
  let clicks = 0;
  const byZone = {};
  for (const e of ev) {
    if (e.event_type === "view") {
      views += 1;
      byZone[e.zone] = { ...(byZone[e.zone] || {}), views: (byZone[e.zone]?.views || 0) + 1 };
    }
    if (e.event_type === "click") {
      clicks += 1;
      byZone[e.zone] = { ...(byZone[e.zone] || {}), clicks: (byZone[e.zone]?.clicks || 0) + 1 };
    }
  }
  for (const z of Object.keys(byZone)) {
    const v = byZone[z].views || 0;
    const cl = byZone[z].clicks || 0;
    byZone[z].ctrPct = v > 0 ? Math.round((cl / v) * 10000) / 100 : 0;
  }

  return {
    documentsTotal: docs.length,
    documentsByType,
    documentsByHour,
    documentsByWeekday,
    userCount: users.length,
    monthlyActiveUsers: activeSet.size,
    recentLogins,
    demographics,
    adSummary: {
      views,
      clicks,
      ctrPct: views > 0 ? Math.round((clicks / views) * 10000) / 100 : 0,
      byZone
    }
  };
}

module.exports = {
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

