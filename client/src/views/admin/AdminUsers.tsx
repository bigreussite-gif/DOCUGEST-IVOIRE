import { useEffect, useState } from "react";
import { adminFetch, AdminApiError } from "../../lib/adminApi";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";

type UserRow = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  role: string;
  permission_level: string;
  gender?: string | null;
  user_typology?: string | null;
  created_at?: string;
  last_login?: string | null;
};

const ROLES = [
  { v: "user", l: "Utilisateur" },
  { v: "operator", l: "Opérateur" },
  { v: "manager", l: "Manager" },
  { v: "admin", l: "Administrateur" },
  { v: "super_admin", l: "Administrateur général" }
] as const;

const PERMS = [
  { v: "read", l: "Lecture" },
  { v: "write", l: "Écriture" },
  { v: "admin", l: "Admin" }
] as const;

export function AdminUsers() {
  const [items, setItems] = useState<UserRow[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<UserRow | null>(null);
  const [busy, setBusy] = useState(false);

  const load = () =>
    adminFetch<{ items: UserRow[] }>("/users")
      .then((r) => setItems(r.items))
      .catch((e) => setErr(e instanceof Error ? e.message : "Erreur"));

  useEffect(() => {
    load();
  }, []);

  async function onDelete(id: string) {
    if (!confirm("Supprimer définitivement cet utilisateur et ses documents ?")) return;
    setBusy(true);
    try {
      await adminFetch(`/users/${id}`, { method: "DELETE" });
      await load();
    } catch (e) {
      alert(e instanceof AdminApiError ? e.message : "Erreur");
    } finally {
      setBusy(false);
    }
  }

  if (err) return <div className="rounded-xl bg-rose-50 p-4 text-rose-800">{err}</div>;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Utilisateurs & gouvernance des accès</h1>
          <p className="mt-1 text-slate-600">
            Profils, rôles et permissions. Le changement de mot de passe des comptes existants se fait par l’utilisateur
            (réinitialisation / profil), pas depuis cet écran.
          </p>
        </div>
        <Button type="button" onClick={() => setModal("create")}>
          + Nouvel utilisateur
        </Button>
      </div>
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm text-slate-700">
        Signal partenaire: une gouvernance claire des accès réduit le risque opérationnel et renforce la confiance investisseur.
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm">
          <div className="font-semibold text-text">Operateur</div>
          <div className="mt-1 text-slate-600">Saisie et édition des documents.</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm">
          <div className="font-semibold text-text">Manager</div>
          <div className="mt-1 text-slate-600">Pilotage équipe + suivi activité.</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm">
          <div className="font-semibold text-text">Admin / Super admin</div>
          <div className="mt-1 text-slate-600">Gouvernance des accès et des rôles (niveau plateforme).</div>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Rôle</th>
              <th className="px-4 py-3">Permission</th>
              <th className="px-4 py-3">Dernière connexion</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50/80">
                <td className="px-4 py-2 font-medium">{u.full_name}</td>
                <td className="px-4 py-2">{u.email}</td>
                <td className="px-4 py-2">{ROLES.find((r) => r.v === u.role)?.l ?? u.role}</td>
                <td className="px-4 py-2">{u.permission_level}</td>
                <td className="px-4 py-2 text-slate-600">
                  {u.last_login ? new Date(u.last_login).toLocaleString("fr-FR") : "—"}
                </td>
                <td className="space-x-2 px-4 py-2 text-right">
                  <button type="button" className="text-primary underline" onClick={() => { setEditing(u); setModal("edit"); }}>
                    Modifier
                  </button>
                  <button type="button" className="text-rose-600 underline" disabled={busy} onClick={() => onDelete(u.id)}>
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal === "create" ? (
        <UserFormModal
          title="Nouvel utilisateur"
          initial={null}
          onClose={() => setModal(null)}
          onSave={async (payload, password) => {
            setBusy(true);
            try {
              await adminFetch("/users", {
                method: "POST",
                json: { ...payload, password }
              });
              setModal(null);
              await load();
            } catch (e) {
              alert(e instanceof AdminApiError ? e.message : "Erreur");
            } finally {
              setBusy(false);
            }
          }}
        />
      ) : null}

      {modal === "edit" && editing ? (
        <UserFormModal
          title="Modifier l’utilisateur"
          initial={editing}
          onClose={() => { setModal(null); setEditing(null); }}
          onSave={async (payload) => {
            setBusy(true);
            try {
              await adminFetch(`/users/${editing.id}`, {
                method: "PATCH",
                json: payload
              });
              setModal(null);
              setEditing(null);
              await load();
            } catch (e) {
              alert(e instanceof AdminApiError ? e.message : "Erreur");
            } finally {
              setBusy(false);
            }
          }}
        />
      ) : null}

    </div>
  );
}

type Payload = {
  full_name: string;
  email: string;
  phone: string;
  whatsapp: string | null;
  role: string;
  permission_level: string;
  gender: string | null;
  user_typology: string | null;
};

function UserFormModal({
  title,
  initial,
  onClose,
  onSave
}: {
  title: string;
  initial: UserRow | null;
  onClose: () => void;
  onSave: (payload: Payload, password?: string) => Promise<void>;
}) {
  const [full_name, setFull] = useState(initial?.full_name ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [role, setRole] = useState(initial?.role ?? "user");
  const [permission_level, setPerm] = useState(initial?.permission_level ?? "write");
  const [gender, setGender] = useState(initial?.gender ?? "");
  const [user_typology, setTypology] = useState(initial?.user_typology ?? "");
  const [password, setPassword] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-bold text-text">{title}</h2>
        <div className="mt-4 grid gap-4">
          <Input label="Nom complet" value={full_name} onChange={(e) => setFull(e.target.value)} />
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input label="Téléphone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-text">Rôle</span>
            <select
              className="w-full rounded-xl border border-border px-4 py-3 text-base"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              {ROLES.map((r) => (
                <option key={r.v} value={r.v}>
                  {r.l}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-text">Niveau d’accès</span>
            <select
              className="w-full rounded-xl border border-border px-4 py-3 text-base"
              value={permission_level}
              onChange={(e) => setPerm(e.target.value)}
            >
              {PERMS.map((p) => (
                <option key={p.v} value={p.v}>
                  {p.l}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-text">Genre (optionnel)</span>
            <select
              className="w-full rounded-xl border border-border px-4 py-3 text-base"
              value={gender}
              onChange={(e) => setGender(e.target.value || "")}
            >
              <option value="">—</option>
              <option value="male">Homme</option>
              <option value="female">Femme</option>
              <option value="other">Autre</option>
              <option value="unknown">Non renseigné</option>
            </select>
          </label>
          <Input label="Typologie (ex. entrepreneur, PME)" value={user_typology} onChange={(e) => setTypology(e.target.value)} />
          {initial === null ? (
            <Input label="Mot de passe initial" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          ) : null}
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" type="button" onClick={onClose}>
            Annuler
          </Button>
          <Button
            type="button"
            onClick={() => {
              const payload: Payload = {
                full_name,
                email,
                phone,
                whatsapp: null,
                role,
                permission_level,
                gender: gender || null,
                user_typology: user_typology || null
              };
              if (initial === null) {
                if (password.length < 8) {
                  alert("Mot de passe ≥ 8 caractères");
                  return;
                }
                void onSave(payload, password);
              } else void onSave(payload);
            }}
          >
            Enregistrer
          </Button>
        </div>
      </div>
    </div>
  );
}

