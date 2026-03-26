/** Rôles autorisés à accéder au back-office DocuGest */
export function isBackofficeRole(role?: string | null): boolean {
  return ["super_admin", "admin", "manager", "operator"].includes(role ?? "user");
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
