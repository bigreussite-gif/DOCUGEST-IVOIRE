import { useAuthStore } from "../store/authStore";
import { roleLabelFr } from "../lib/roles";
import { InlineAdStrip } from "../components/promo/InlineAdStrip";
import { SorobossFooter } from "../components/promo/SorobossFooter";

export default function Profile() {
  const auth = useAuthStore();
  const u = auth.user;

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-4">
        <InlineAdStrip variant="compact" />
      </div>

      <div className="rounded-2xl bg-bg p-6 shadow-soft ring-1 ring-border/70">
        <h1 className="text-xl font-bold text-text">Profil</h1>
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
          Les logos et couleurs de marque sur les factures, devis et bulletins se configurent dans chaque éditeur de
          document (section « Identité visuelle »).
        </p>
      </div>

      <div className="mt-8">
        <SorobossFooter />
      </div>
    </div>
  );
}
