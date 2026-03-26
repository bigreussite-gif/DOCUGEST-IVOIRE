require("dotenv").config();

const usePg = Boolean(
  process.env.DATABASE_URL || process.env.INSFORGE_DATABASE_URL || process.env.POSTGRES_URL
);

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");

const { authRouter } = require("./routes/auth");
const { documentsRouter } = require("./routes/documents");

const app = express();

const port = Number(process.env.PORT || 4000);
const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";
/** Plusieurs origines (ex. localhost + Vercel) : CLIENT_ORIGIN=https://app.vercel.app,http://localhost:5173 */
const corsOrigins = clientOrigin
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: corsOrigins.length === 1 ? corsOrigins[0] : corsOrigins,
    credentials: true
  })
);
app.use(cookieParser());
app.use(express.json({ limit: "2mb" }));

// Rate limiting spécifique aux endpoints d'auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false
});

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authLimiter, authRouter);
app.use("/api/documents", documentsRouter);

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`DocuGest API listening on http://localhost:${port}`);
  // eslint-disable-next-line no-console
  console.log(`Stockage: ${usePg ? "PostgreSQL (InsForge)" : "JSON local (local-inforge-dev)"}`);
});

