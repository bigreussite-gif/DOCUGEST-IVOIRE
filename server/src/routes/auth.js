const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { z } = require("zod");

const { requireAuth } = require("../middleware/auth");
const { sendMail } = require("../lib/mailer");
const store = require("../lib/inforgeDevStore");

const router = express.Router();

const phonePattern = /^(?:\+?225|225)?0\d{8}$|^\+?[1-9]\d{7,14}$/;

const userSelect = `
  id,
  full_name,
  phone,
  whatsapp,
  email,
  company_name,
  company_logo_url,
  company_address,
  company_ncc,
  company_rccm,
  company_dfe,
  company_regime
`;

function createToken({ userId, rememberMe }) {
  const exp = rememberMe ? "30d" : "1d";
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET, { expiresIn: exp });
}

function createResetToken({ userId }) {
  return jwt.sign({ sub: userId, purpose: "reset" }, process.env.JWT_SECRET, { expiresIn: "1h" });
}

// POST /api/auth/register
router.post("/register", async (req, res) => {
  const schema = z.object({
    full_name: z.string().min(2),
    phone: z.string().refine((v) => phonePattern.test(v.replace(/\s+/g, ""))),
    whatsapp: z.string().nullable().optional(),
    email: z.string().email(),
    password: z.string().min(8)
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Champs invalides", details: parsed.error.flatten() });
  }

  const { full_name, phone, whatsapp, email, password } = parsed.data;

  const existing = await store.isEmailTaken(email);
  if (existing) return res.status(409).json({ message: "Email déjà utilisé" });

  const password_hash = await bcrypt.hash(password, 12);

  const created = await store.createUser({ full_name, phone, whatsapp, email, password_hash });
  if (!created.ok) return res.status(409).json({ message: created.reason });
  const user = created.user;

  try {
    await sendMail({
      to: user.email,
      subject: "Bienvenue sur DocuGest Ivoire",
      text: `Bonjour ${user.full_name},\n\nVotre compte DocuGest Ivoire est prêt.\n\nBon travail avec vos documents !`
    });
  } catch {
    // On ne bloque pas l'accès si l'email échoue.
  }

  const token = createToken({ userId: user.id, rememberMe: true });
  const me = await store.getMe(user.id);
  return res.json({ token, user: me });
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
    rememberMe: z.boolean()
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Champs invalides", details: parsed.error.flatten() });
  }

  const { email, password, rememberMe } = parsed.data;

  const userRow = await store.getUserByEmail(email);
  if (!userRow) return res.status(401).json({ message: "Email ou mot de passe incorrect" });

  const ok = await bcrypt.compare(password, userRow.password_hash);
  if (!ok) return res.status(401).json({ message: "Email ou mot de passe incorrect" });

  const token = createToken({ userId: userRow.id, rememberMe });
  await store.touchLastLogin(userRow.id);
  const me = await store.getMe(userRow.id);
  return res.json({ token, user: me });
});

// GET /api/auth/me
router.get("/me", requireAuth, async (req, res) => {
  const userId = req.auth.sub;
  const me = await store.getMe(userId);
  if (!me) return res.status(404).json({ message: "Utilisateur introuvable" });
  return res.json(me);
});

// POST /api/auth/password-reset-request
router.post("/password-reset-request", async (req, res) => {
  const schema = z.object({ email: z.string().email() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Email invalide" });

  const { email } = parsed.data;
  const sel = await store.getUserByEmail(email);

  // Ne pas révéler si l'email existe
  if (sel) {
    const resetToken = createResetToken({ userId: sel.id });
    const link = `${process.env.APP_URL || "http://localhost:5173"}/reset-password?token=${encodeURIComponent(resetToken)}`;

    try {
      await sendMail({
        to: sel.email,
        subject: "Réinitialisation du mot de passe",
        text: `Bonjour,\n\nCliquez sur le lien pour réinitialiser votre mot de passe :\n${link}\n\nSi vous n'êtes pas à l'origine de cette demande, ignorez ce message.\n`
      });
    } catch {
      // no-op
    }
  }

  return res.status(204).send();
});

// POST /api/auth/password-reset
router.post("/password-reset", async (req, res) => {
  const schema = z.object({
    token: z.string().min(1),
    newPassword: z.string().min(8)
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Champs invalides" });

  const { token, newPassword } = parsed.data;

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(400).json({ message: "Token de réinitialisation invalide ou expiré" });
  }

  if (!payload || payload.purpose !== "reset") return res.status(400).json({ message: "Token invalide" });

  const userId = payload.sub;
  const password_hash = await bcrypt.hash(newPassword, 12);

  const ok = await store.updatePassword(userId, password_hash);
  if (!ok) return res.status(500).json({ message: "Erreur" });

  return res.status(204).send();
});

module.exports = { authRouter: router };

