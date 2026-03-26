/**
 * API Express sur Vercel (serverless) — plus besoin de BACKEND_URL + proxy séparé.
 * Variables Vercel : INSFORGE_DATABASE_URL (ou DATABASE_URL), JWT_SECRET, CLIENT_ORIGIN, etc.
 */
const serverless = require("serverless-http");
const { app } = require("../server/src/app");

module.exports = serverless(app);
