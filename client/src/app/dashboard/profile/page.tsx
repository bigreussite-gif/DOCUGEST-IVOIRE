"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

type Me = {
  id: string;
  full_name: string;
  email: string;
  whatsapp?: string | null;
  company_logo_url?: string | null;
  user_typology?: string | null;
};

function authHeaders(): HeadersInit {
  if (typeof window === "undefined") return { "Content-Type": "application/json" };
  const token = localStorage.getItem("docugest_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changing, setChanging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [country, setCountry] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/auth/me", { headers: authHeaders() });
        const data = (await res.json().catch(() => ({}))) as Me & { message?: string };
        if (!res.ok) throw new Error(data.message || "Chargement impossible");
        if (!alive) return;
        setFullName(data.full_name || "");
        setEmail(data.email || "");
        setWhatsapp(data.whatsapp || "");
        setCountry(data.user_typology || "");
        setPhotoUrl(data.company_logo_url || "");
      } catch (e) {
        if (!alive) return;
        setError(e instanceof Error ? e.message : "Erreur de chargement");
      } finally {
        if (alive) setLoading(false);
      }
    }
    void load();
    return () => {
      alive = false;
    };
  }, []);

  const profilePreview = useMemo(() => {
    const initials = fullName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() || "")
      .join("");
    return initials || "DG";
  }, [fullName]);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setOk(null);
    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({
          full_name: fullName.trim(),
          email: email.trim(),
          whatsapp: whatsapp.trim() || null,
          country: country.trim() || null,
          photo_url: photoUrl.trim() || null
        })
      });
      const data = (await res.json().catch(() => ({}))) as { message?: string };
      if (!res.ok) throw new Error(data.message || "Mise a jour impossible");
      setOk("Profil mis a jour avec succes.");
      localStorage.setItem(
        "docugest_user_cache",
        JSON.stringify({
          full_name: fullName.trim(),
          email: email.trim(),
          whatsapp: whatsapp.trim() || null,
          user_typology: country.trim() || null,
          company_logo_url: photoUrl.trim() || null
        })
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur de mise a jour");
    } finally {
      setSaving(false);
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setChanging(true);
    setError(null);
    setOk(null);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword })
      });
      const data = (await res.json().catch(() => ({}))) as { message?: string };
      if (!res.ok) throw new Error(data.message || "Changement impossible");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setOk("Mot de passe modifie avec succes.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur de securite");
    } finally {
      setChanging(false);
    }
  }

  return (
    <main className="min-h-screen bg-surface px-[15px] py-8">
      <section className="mx-auto max-w-6xl">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-text">Mon profil</h1>
          <Link href="/dashboard" className="text-sm font-medium text-primary hover:underline">
            Retour dashboard
          </Link>
        </div>

        {error ? <p className="mb-4 rounded-lg bg-error/10 px-3 py-2 text-sm text-error">{error}</p> : null}
        {ok ? <p className="mb-4 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-800">{ok}</p> : null}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <form onSubmit={saveProfile} className="rounded-2xl bg-bg p-5 shadow-soft ring-1 ring-border/70">
            <h2 className="text-sm font-semibold text-text">Infos personnelles</h2>
            <p className="mt-1 text-xs text-slate-600">Modifiez vos informations et votre photo de profil.</p>

            <div className="mt-4 flex items-center gap-3 rounded-xl border border-border bg-white/70 p-3">
              {photoUrl ? (
                <img src={photoUrl} alt="Photo profil" className="h-12 w-12 rounded-full object-cover ring-1 ring-border" />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {profilePreview}
                </div>
              )}
              <div className="text-xs text-slate-600">Astuce: collez l'URL d'une image pour afficher votre photo.</div>
            </div>

            <div className="mt-4 space-y-3">
              <input
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nom complet"
                className="w-full rounded-xl border border-border bg-bg px-3 py-2 text-sm text-text outline-none ring-primary/30 focus:ring-2"
              />
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full rounded-xl border border-border bg-bg px-3 py-2 text-sm text-text outline-none ring-primary/30 focus:ring-2"
              />
              <input
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="Numero WhatsApp"
                className="w-full rounded-xl border border-border bg-bg px-3 py-2 text-sm text-text outline-none ring-primary/30 focus:ring-2"
              />
              <input
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="Pays"
                className="w-full rounded-xl border border-border bg-bg px-3 py-2 text-sm text-text outline-none ring-primary/30 focus:ring-2"
              />
              <input
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="Photo URL (https://...)"
                className="w-full rounded-xl border border-border bg-bg px-3 py-2 text-sm text-text outline-none ring-primary/30 focus:ring-2"
              />
            </div>

            <Button type="submit" disabled={saving || loading} className="mt-4 w-full">
              {saving ? "Enregistrement..." : "Enregistrer le profil"}
            </Button>
          </form>

          <div className="space-y-4">
            <form onSubmit={changePassword} className="rounded-2xl bg-bg p-5 shadow-soft ring-1 ring-border/70">
              <h2 className="text-sm font-semibold text-text">Securite</h2>
              <p className="mt-1 text-xs text-slate-600">Changez votre mot de passe en toute securite.</p>
              <div className="mt-4 space-y-3">
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Mot de passe actuel"
                  className="w-full rounded-xl border border-border bg-bg px-3 py-2 text-sm text-text outline-none ring-primary/30 focus:ring-2"
                />
                <input
                  type="password"
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nouveau mot de passe"
                  className="w-full rounded-xl border border-border bg-bg px-3 py-2 text-sm text-text outline-none ring-primary/30 focus:ring-2"
                />
                <input
                  type="password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirmer le nouveau mot de passe"
                  className="w-full rounded-xl border border-border bg-bg px-3 py-2 text-sm text-text outline-none ring-primary/30 focus:ring-2"
                />
              </div>
              <Button type="submit" disabled={changing || loading} className="mt-4 w-full">
                {changing ? "Mise a jour..." : "Changer le mot de passe"}
              </Button>
            </form>

            <aside className="rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">Espace partenaire</p>
              <h3 className="mt-2 text-sm font-semibold text-text">Boostez votre image pro</h3>
              <p className="mt-1 text-xs text-slate-600">
                Astuce business: ajoutez votre photo/logo et gardez des informations a jour pour inspirer confiance a vos
                clients.
              </p>
              <div className="mt-3 rounded-lg bg-white/80 px-3 py-2 text-xs text-slate-700 ring-1 ring-border/60">
                Publicite utile: Bientot ici, des offres partenaires (impression, compta, paiement).
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
