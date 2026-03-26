const ROLE_RANK = {
  super_admin: 4,
  admin: 3,
  manager: 2,
  operator: 1,
  user: 0
};

function roleRank(role) {
  return ROLE_RANK[role] ?? 0;
}

/** Accès back-office (lecture analytics, audit, IA) */
function requireBackoffice(req, res, next) {
  const r = req.auth?.role || "user";
  if (roleRank(r) < 1) {
    return res.status(403).json({ message: "Accès réservé à l’équipe DocuGest." });
  }
  return next();
}

/** Création / édition / suppression d’utilisateurs : admin + super_admin uniquement */
function requireUserManager(req, res, next) {
  const r = req.auth?.role || "user";
  if (!["super_admin", "admin"].includes(r)) {
    return res.status(403).json({ message: "Droits insuffisants pour gérer les utilisateurs." });
  }
  return next();
}

/** Actions sensibles (suppression compte, promotion super_admin) */
function requireSuperAdmin(req, res, next) {
  const r = req.auth?.role || "user";
  if (r !== "super_admin") {
    return res.status(403).json({ message: "Action réservée au super administrateur." });
  }
  return next();
}

module.exports = { roleRank, requireBackoffice, requireUserManager, requireSuperAdmin };
