const jwt = require("jsonwebtoken");

function getTokenFromReq(req) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
    return authHeader.slice(7).trim();
  }
  return null;
}

function requireAuth(req, res, next) {
  try {
    const token = getTokenFromReq(req);
    if (!token) return res.status(401).json({ message: "Non authentifié" });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.auth = payload;
    return next();
  } catch {
    return res.status(401).json({ message: "Token invalide ou expiré" });
  }
}

module.exports = { requireAuth };

