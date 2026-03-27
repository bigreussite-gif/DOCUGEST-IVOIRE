import { useMemo, useState } from "react";
import { useAuthStore } from "../store/authStore";
import { apiFetch } from "../lib/api";
import { roleLabelFr } from "../lib/roles";
import { InlineAdStrip } from "../components/promo/InlineAdStrip";
import { SorobossFooter } from "../components/promo/SorobossFooter";
import { TrustModelBanner } from "../components/trust/TrustModelBanner";
import { Button } from "../components/ui/Button";
import { FRANCOPHONE_AFRICA_COUNTRIES } from "../lib/francophonePolicy";

export default function Profile() {
  const auth = useAuthStore();
  const u = auth.user;
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveOk, setSaveOk] = useState<string | null>(null);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [pwdOk, setPwdOk] = useState<string | null>(null);

  const [fullName, setFullName] = useState(u?.full_name ?? "");
  const [email, setEmail] = useState(u?.email ?? "");
  const [whatsapp, setWhatsapp] = useState(u?.whatsapp ?? "");
  const [country, setCountry] = useState(u?.user_typology ?? "Cote d'Ivoire");
  const [photoUrl, setPhotoUrl] = useState(u?.company_logo_url ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const countryOptions = useMemo(
    () => FRANCOPHONE_AFRICA_COUNTRIES.map((c) => c.label),
    []
  );

  function openEdit() {
    setFullName(u?.full_name ?? "");
    setEmail(u?.email ?? "");
    setWhatsapp(u?.whatsapp ?? "");
    setCountry(u?.user_typology ?? "Cote d'Ivoire");
    setPhotoUrl(u?.company_logo_url ?? "");
    setSaveError(null);
    setSaveOk(null);
    setEditOpen(true);
  }

  async function submitProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaveError(null);
    setSaveOk(null);
    setSaving(true);
    try {
      await apiFetch("/api/auth/me", {
        method: "PATCH",
        json: {
          full_name: fullName.trim(),
          email: email.trim(),
          whatsapp: whatsapp.trim() || null,
          country: country.trim() || null,
          photo_url: photoUrl.trim() || null
        }
      });
      await auth.loadMe();
      setSaveOk("Profil mis a jour.");
      setEditOpen(false);
    } catch (e) {
      const message =
        e && typeof e === "object" && "message" in e ? String((e as { message?: string }).message) : "Mise a jour impossible.";
      setSaveError(message);
    } finally {
      setSaving(false);
    }
  }

  async function submitPassword(e: React.FormEvent) {
    e.preventDefault();
    setPwdError(null);
    setPwdOk(null);
    setPwdLoading(true);
    try {
      await apiFetch("/api/auth/change-password", {
        method: "POST",
        json: { currentPassword, newPassword, confirmPassword }
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPwdOk("Mot de passe modifie avec succes.");
    } catch (e) {
      const message =
        e && typeof e === "object" && "message" in e ? String((e as { message?: string }).message) : "Echec du changement de mot de passe.";
      setPwdError(message);
    } finally {
      setPwdLoading(false);
    }
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-4 space-y-3">
        <TrustModelBanner variant="compact" />
        <InlineAdStrip
          variant="compact"
          heading="Soutien au service gratuit"
          subheading="Les annonces ci-dessous financent l’hébergement et les mises à jour."
        />
      </div>

      <div className="rounded-2xl bg-bg p-6 shadow-soft ring-1 ring-border/70">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-xl font-bold text-text">Profil</h1>
          <Button variant="primary" className="h-10" onClick={openEdit}>
            Modifier mes donnees
          </Button>
        </div>
        <p className="mt-2 text-base leading-relaxed text-slate-600">
          Informations liées à votre compte et à l’identité affichée sur vos documents.
        </p>

        <dl className="mt-8 grid gap-6 sm:grid-cols-2">
          <div className="rounded-xl bg-surface p-5 ring-1 ring-border/60">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Rôle dans le système</dt>
            <dd className="mt-2 text-lg font-medium text-text">{roleLabelFr(u?.role)}</dd>
            {u?.permission_level ? (
              <dd className="mt-1 text-sm text-slate-600">Niveau d’accès : {u.permission_level}</dd>
            ) : null}
          </div>
          <div className="rounded-xl bg-surface p-5 ring-1 ring-border/60">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Nom complet</dt>
            <dd className="mt-2 text-lg font-medium text-text">{u?.full_name ?? "—"}</dd>
          </div>
          <div className="rounded-xl bg-surface p-5 ring-1 ring-border/60">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email</dt>
            <dd className="mt-2 text-lg font-medium text-text break-all">{u?.email ?? "—"}</dd>
          </div>
          <div className="rounded-xl bg-surface p-5 ring-1 ring-border/60">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Téléphone</dt>
            <dd className="mt-2 text-lg font-medium text-text">{u?.phone ?? "—"}</dd>
          </div>
          <div className="rounded-xl bg-surface p-5 ring-1 ring-border/60">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Entreprise</dt>
            <dd className="mt-2 text-lg font-medium text-text">{u?.company_name ?? "—"}</dd>
          </div>
          <div className="rounded-xl bg-surface p-5 ring-1 ring-border/60 sm:col-span-2">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Adresse</dt>
            <dd className="mt-2 whitespace-pre-line text-lg leading-relaxed text-text">{u?.company_address || "—"}</dd>
          </div>
        </dl>

        <p className="mt-8 rounded-xl bg-primary/5 px-4 py-3 text-sm leading-relaxed text-slate-700 ring-1 ring-primary/15">
          Les logos et couleurs de marque sur les factures, devis et bulletins se règlent dans chaque éditeur (section
          « Identité visuelle ») : vous pouvez importer un logo — les teintes dominantes sont proposées automatiquement
          — ou définir vous-même la couleur principale du document (nuancier ou code hexadécimal).
        </p>

        <div className="mt-8 rounded-2xl bg-surface p-5 ring-1 ring-border/70">
          <h2 className="text-base font-semibold text-text">Changer mon mot de passe</h2>
          <form onSubmit={submitPassword} className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm text-slate-700">Mot de passe actuel</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-border bg-white px-3 py-2 text-text outline-none ring-primary/30 focus:ring-2"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-700">Nouveau mot de passe</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={8}
                required
                className="w-full rounded-xl border border-border bg-white px-3 py-2 text-text outline-none ring-primary/30 focus:ring-2"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-700">Confirmer le nouveau</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={8}
                required
                className="w-full rounded-xl border border-border bg-white px-3 py-2 text-text outline-none ring-primary/30 focus:ring-2"
              />
            </div>
            {pwdError ? <p className="sm:col-span-2 text-sm text-error">{pwdError}</p> : null}
            {pwdOk ? <p className="sm:col-span-2 text-sm text-emerald-700">{pwdOk}</p> : null}
            <div className="sm:col-span-2">
              <Button type="submit" variant="secondary" disabled={pwdLoading} className="h-10">
                {pwdLoading ? "Modification..." : "Modifier le mot de passe"}
              </Button>
            </div>
          </form>
        </div>
        {saveError ? <p className="mt-4 text-sm text-error">{saveError}</p> : null}
        {saveOk ? <p className="mt-4 text-sm text-emerald-700">{saveOk}</p> : null}
      </div>

      <div className="mt-8">
        <SorobossFooter />
      </div>

      {editOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-5 shadow-xl ring-1 ring-border">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-text">Modifier mes informations</h3>
              <button
                type="button"
                onClick={() => setEditOpen(false)}
                className="rounded-md px-2 py-1 text-sm text-slate-600 hover:bg-slate-100"
              >
                Fermer
              </button>
            </div>
            <form onSubmit={submitProfile} className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm text-slate-700">Nom complet</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full rounded-xl border border-border px-3 py-2 text-text outline-none ring-primary/30 focus:ring-2"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-700">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-xl border border-border px-3 py-2 text-text outline-none ring-primary/30 focus:ring-2"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-700">WhatsApp</label>
                <input
                  type="tel"
                  value={whatsapp ?? ""}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full rounded-xl border border-border px-3 py-2 text-text outline-none ring-primary/30 focus:ring-2"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-700">Pays</label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full rounded-xl border border-border px-3 py-2 text-text outline-none ring-primary/30 focus:ring-2"
                >
                  {countryOptions.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm text-slate-700">Logo (URL)</label>
                <input
                  type="url"
                  value={photoUrl ?? ""}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-xl border border-border px-3 py-2 text-text outline-none ring-primary/30 focus:ring-2"
                />
              </div>
              {saveError ? <p className="sm:col-span-2 text-sm text-error">{saveError}</p> : null}
              <div className="sm:col-span-2 flex items-center gap-3 pt-2">
                <Button type="submit" variant="primary" disabled={saving} className="h-10">
                  {saving ? "Enregistrement..." : "Enregistrer"}
                </Button>
                <Button type="button" variant="ghost" className="h-10" onClick={() => setEditOpen(false)}>
                  Annuler
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
