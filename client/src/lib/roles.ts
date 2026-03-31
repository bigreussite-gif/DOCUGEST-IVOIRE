/**
 * Lien « Back-office » dans l’app utilisateur : réservé aux administrateurs de la plateforme.
 * (Les rôles manager/operator restent gérables côté API si besoin, mais ne voient pas l’entrée admin.)
 */
export function isBackofficeRole(role?: string | null): boolean {
  return role === "super_admin" || role === "admin";
}

export function roleLabelFr(role?: string | null): string {
  const m: Record<string, string> = {
    super_admin: "Administrateur général",
    admin: "Administrateur",
    manager: "Manager",
    operator: "Opérateur",
    user: "Utilisateur"
  };
  if (!role) return "Utilisateur";
  return m[role] ?? role;
}
