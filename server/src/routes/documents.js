const express = require("express");
const { z } = require("zod");

const { requireAuth } = require("../middleware/auth");
const store = require("../lib/store");

const router = express.Router();
router.use(requireAuth);

// POST /api/documents
router.post("/", async (req, res) => {
  const schema = z.object({
    type: z.enum(["invoice", "proforma", "devis", "payslip"]),
    doc_number: z.string().min(1),
    client_name: z.string().min(1),
    total_amount: z.number().finite(),
    currency: z.string().min(1).default("FCFA"),
    status: z.enum(["draft", "sent", "paid", "cancelled"]).optional().default("draft"),
    doc_data: z.record(z.any())
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Champs invalides", details: parsed.error.flatten() });

  const userId = req.auth.sub;
  try {
    const created = await store.createDocument({
      user_id: userId,
      type: parsed.data.type,
      doc_number: parsed.data.doc_number,
      client_name: parsed.data.client_name,
      total_amount: parsed.data.total_amount,
      currency: parsed.data.currency,
      status: parsed.data.status,
      doc_data: parsed.data.doc_data
    });
    return res.json(created);
  } catch (e) {
    return res.status(500).json({ message: "Erreur sauvegarde", details: e?.message });
  }
});

// GET /api/documents
router.get("/", async (req, res) => {
  const userId = req.auth.sub;
  const page = Math.max(1, Number(req.query.page || 1));
  const limit = Math.min(50, Math.max(1, Number(req.query.limit || 20)));

  const type = req.query.type ? String(req.query.type) : null;
  const list = await store.listDocuments({ userId, type, page, limit });
  return res.json({ items: list.items ?? [], page, limit, total: list.total });
});

// PUT /api/documents/:id
router.put("/:id", async (req, res) => {
  const schema = z.object({
    type: z.enum(["invoice", "proforma", "devis", "payslip"]),
    doc_number: z.string().min(1),
    client_name: z.string().min(1),
    total_amount: z.number().finite(),
    currency: z.string().min(1).default("FCFA"),
    status: z.enum(["draft", "sent", "paid", "cancelled"]).optional().default("draft"),
    doc_data: z.record(z.any())
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Champs invalides", details: parsed.error.flatten() });

  const userId = req.auth.sub;
  try {
    const updated = await store.updateDocument({
      userId,
      id: req.params.id,
      type: parsed.data.type,
      doc_number: parsed.data.doc_number,
      client_name: parsed.data.client_name,
      total_amount: parsed.data.total_amount,
      currency: parsed.data.currency,
      status: parsed.data.status,
      doc_data: parsed.data.doc_data
    });
    if (!updated) return res.status(404).json({ message: "Document introuvable" });
    return res.json(updated);
  } catch (e) {
    return res.status(500).json({ message: "Erreur mise à jour", details: e?.message });
  }
});

// GET /api/documents/:id
router.get("/:id", async (req, res) => {
  const userId = req.auth.sub;
  const doc = await store.getDocumentById({ userId, id: req.params.id });
  if (!doc) return res.status(404).json({ message: "Document introuvable" });
  return res.json(doc);
});

// DELETE /api/documents/:id
router.delete("/:id", async (req, res) => {
  const userId = req.auth.sub;
  const ok = await store.deleteDocumentById({ userId, id: req.params.id });
  if (!ok) return res.status(404).json({ message: "Document introuvable" });
  return res.status(204).send();
});

module.exports = { documentsRouter: router };

