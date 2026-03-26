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
const { adminRouter } = require("./routes/admin");

const app = express();
/** Vercel / proxy : nécessaire pour rate-limit et IP */
app.set("trust proxy", 1);

const port = Number(process.env.PORT || 4000);
const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";
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

/**
 * En serverless, le chemin peut arriver avec ou sans préfixe /api selon la plateforme.
 * On monte les routeurs deux fois : avec et sans préfixe /api.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false
});

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authLimiter, authRouter);
app.use("/auth", authLimiter, authRouter);

app.use("/api/documents", documentsRouter);
app.use("/documents", documentsRouter);

app.use("/api/admin", adminRouter);
app.use("/admin", adminRouter);

module.exports = { app, usePg, port };
