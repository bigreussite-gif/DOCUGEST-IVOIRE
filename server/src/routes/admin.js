const express = require("express");
const bcrypt = require("bcryptjs");
const { z } = require("zod");

const { requireAuth } = require("../middleware/auth");
const { requireBackoffice, requireUserManager, roleRank } = require("../middleware/adminAuth");
const store = require("../lib/store");
const { buildInsights } = require("../lib/aiInsights");

const router = express.Router();

router.use(requireAuth);
router.use(requireBackoffice);

function clientIp(req) {
  const x = req.headers["x-forwarded-for"];
  if (typeof x === "string" && x.length > 0) return x.split(",")[0].trim();
  return req.socket?.remoteAddress ?? null;
}

// GET /api/admin/session — identité + rôle pour l’en-tête back-office
router.get("/session", async (req, res) => {
  const me = await store.getMe(req.auth.sub);
  if (!me) return res.status(404).json({ message: "Introuvable" });
  return res.json({
    user: me,
    roleLabel: roleLabelFr(me.role),
    canManageUsers: ["super_admin", "admin"].includes(me.role)
  });
});

function roleLabelFr(role) {
  const m = {
    super_admin: "Administrateur général",
    admin: "Administrateur",
    manager: "Manager",
    operator: "Opérateur",
    user: "Utilisateur"
  };
  return m[role] ?? role;
}

// --- Utilisateurs ---

router.get("/users", requireUserManager, async (req, res) => {
  try {
    const items = await store.listUsersAdmin();
    return res.json({ items });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Erreur liste utilisateurs" });
  }
});

const createUserSchema = z.object({
  full_name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(6),
  password: z.string().min(8),
  role: z.enum(["super_admin", "admin", "manager", "operator", "user"]),
  permission_level: z.enum(["read", "write", "admin"]).default("write"),
  gender: z.enum(["male", "female", "other", "unknown"]).optional().nullable(),
  user_typology: z.string().max(64).optional().nullable()
});

router.post("/users", requireUserManager, async (req, res) => {
  const parsed = createUserSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Données invalides", details: parsed.error.flatten() });

  const body = parsed.data;
  if (body.role === "super_admin" && req.auth.role !== "super_admin") {
    return res.status(403).json({ message: "Seul le super administrateur peut créer un super administrateur." });
  }

  const password_hash = await bcrypt.hash(body.password, 12);
  const created = await store.createUserAdmin({
    full_name: body.full_name,
    phone: body.phone,
    whatsapp: null,
    email: body.email,
    password_hash,
    role: body.role,
    permission_level: body.permission_level,
    gender: body.gender ?? null,
    user_typology: body.user_typology ?? null
  });

  if (!created.ok) return res.status(409).json({ message: created.reason });

  await store.appendAuditLog({
    actorId: req.auth.sub,
    action: "user.create",
    targetType: "user",
    targetId: created.user.id,
    metadata: { email: body.email, role: body.role },
    ip: clientIp(req)
  });

  return res.status(201).json({ id: created.user.id });
});

const updateUserSchema = z.object({
  full_name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(6),
  whatsapp: z.string().nullable().optional(),
  role: z.enum(["super_admin", "admin", "manager", "operator", "user"]),
  permission_level: z.enum(["read", "write", "admin"]),
  gender: z.enum(["male", "female", "other", "unknown"]).nullable().optional(),
  user_typology: z.string().max(64).nullable().optional()
});

router.patch("/users/:id", requireUserManager, async (req, res) => {
  const id = req.params.id;
  const parsed = updateUserSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Données invalides", details: parsed.error.flatten() });

  const body = parsed.data;
  if (body.role === "super_admin" && req.auth.role !== "super_admin") {
    return res.status(403).json({ message: "Interdit" });
  }

  const target = await store.getUserById(id);
  if (!target) return res.status(404).json({ message: "Utilisateur introuvable" });
  if (target.role === "super_admin" && req.auth.role !== "super_admin") {
    return res.status(403).json({ message: "Interdit" });
  }

  const updated = await store.updateUserAdmin({
    id,
    full_name: body.full_name,
    phone: body.phone,
    whatsapp: body.whatsapp ?? null,
    email: body.email,
    role: body.role,
    permission_level: body.permission_level,
    gender: body.gender ?? null,
    user_typology: body.user_typology ?? null
  });

  await store.appendAuditLog({
    actorId: req.auth.sub,
    action: "user.update",
    targetType: "user",
    targetId: id,
    metadata: { email: body.email, role: body.role },
    ip: clientIp(req)
  });

  return res.json({ user: updated });
});

const passwordSchema = z.object({ password: z.string().min(8) });

router.patch("/users/:id/password", requireUserManager, async (req, res) => {
  const id = req.params.id;
  const parsed = passwordSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Mot de passe invalide" });

  const target = await store.getUserById(id);
  if (!target) return res.status(404).json({ message: "Introuvable" });
  if (target.role === "super_admin" && req.auth.role !== "super_admin") {
    return res.status(403).json({ message: "Interdit" });
  }

  const password_hash = await bcrypt.hash(parsed.data.password, 12);
  await store.updateUserPasswordAdmin(id, password_hash);

  await store.appendAuditLog({
    actorId: req.auth.sub,
    action: "user.password_reset",
    targetType: "user",
    targetId: id,
    metadata: {},
    ip: clientIp(req)
  });

  return res.status(204).send();
});

router.delete("/users/:id", requireUserManager, async (req, res) => {
  const id = req.params.id;
  if (id === req.auth.sub) return res.status(400).json({ message: "Impossible de supprimer votre propre compte ici." });

  const target = await store.getUserById(id);
  if (!target) return res.status(404).json({ message: "Introuvable" });
  if (target.role === "super_admin" && req.auth.role !== "super_admin") {
    return res.status(403).json({ message: "Seul le super administrateur peut supprimer un super administrateur." });
  }

  const ok = await store.deleteUserAdmin(id);
  if (!ok) return res.status(500).json({ message: "Suppression impossible" });

  await store.appendAuditLog({
    actorId: req.auth.sub,
    action: "user.delete",
    targetType: "user",
    targetId: id,
    metadata: { email: target.email },
    ip: clientIp(req)
  });

  return res.status(204).send();
});

// --- Analytics & IA ---

router.get("/analytics/overview", async (req, res) => {
  try {
    const snapshot = await store.adminAnalyticsSnapshot();
    return res.json(snapshot);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Erreur analytics" });
  }
});

router.get("/analytics/insights", async (req, res) => {
  try {
    const snapshot = await store.adminAnalyticsSnapshot();
    const insights = buildInsights(snapshot);
    return res.json(insights);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Erreur IA locale" });
  }
});

// --- Audit ---

router.get("/audit", async (req, res) => {
  try {
    const limit = Math.min(200, Math.max(1, Number(req.query.limit) || 100));
    const items = await store.listAuditLogs({ limit });
    return res.json({ items });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Erreur journal" });
  }
});

// --- Tracking publicitaire (peut être appelé depuis le client authentifié) ---

const adEventSchema = z.object({
  event_type: z.enum(["view", "click"]),
  zone: z.string().min(1).max(64),
  session_id: z.string().max(64).optional()
});

router.post("/analytics/ad-event", async (req, res) => {
  const parsed = adEventSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Payload invalide" });
  try {
    await store.insertAdEvent({
      event_type: parsed.data.event_type,
      zone: parsed.data.zone,
      user_id: req.auth.sub,
      session_id: parsed.data.session_id ?? null,
      metadata: {}
    });
    return res.status(204).send();
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Erreur tracking" });
  }
});

module.exports = { adminRouter: router };
