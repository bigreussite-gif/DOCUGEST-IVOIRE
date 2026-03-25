const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");

const dataDir = process.env.INFORGE_DEV_DIR
  ? path.resolve(process.env.INFORGE_DEV_DIR)
  : path.resolve(__dirname, "../../local-inforge-dev");
const usersFile = path.join(dataDir, "users.json");
const documentsFile = path.join(dataDir, "documents.json");

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
    company_regime: user.company_regime ?? null
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

module.exports = {
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

