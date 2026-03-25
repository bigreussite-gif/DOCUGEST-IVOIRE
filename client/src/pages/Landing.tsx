import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";

export default function Landing() {
  return (
    <div className="min-h-screen bg-bg px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 ring-1 ring-primary/30" />
            <div>
              <div className="text-lg font-bold text-text">DocuGest Ivoire</div>
              <div className="text-sm text-slate-600">Gestion documentaire pour entrepreneurs</div>
            </div>
          </div>
          <div className="flex gap-3">
            <Link to="/login">
              <Button variant="secondary">Connexion</Button>
            </Link>
            <Link to="/register">
              <Button variant="primary">Créer un compte</Button>
            </Link>
          </div>
        </header>

        <main className="mt-12 grid gap-8 md:grid-cols-2 md:items-center">
          <div>
            <h1 className="text-4xl font-bold text-text">
              Créez vos factures et devis en quelques minutes.
            </h1>
            <p className="mt-4 text-slate-700">
              Sans compétence comptable. Un aperçu PDF instantané, puis enregistrement dans votre
              espace.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/register">
                <Button variant="primary">Commencer gratuitement</Button>
              </Link>
              <Link to="/login">
                <Button variant="ghost">J’ai déjà un compte</Button>
              </Link>
            </div>
          </div>
          <div className="rounded-2xl bg-surface p-6 shadow-soft ring-1 ring-border/70">
            <div className="grid gap-4">
              {[
                { title: "Éditeur split-screen", desc: "Formulaire à gauche, aperçu A4 à droite." },
                { title: "PDF propre", desc: "Aucun affichage publicitaire dans le document exporté." },
                { title: "Historique", desc: "Ouvrez, dupliquez, supprimez vos documents." }
              ].map((x) => (
                <div key={x.title} className="rounded-xl bg-bg p-4 ring-1 ring-border/60">
                  <div className="font-semibold text-text">{x.title}</div>
                  <div className="mt-1 text-sm text-slate-700">{x.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </main>

        <footer className="mt-14 text-center text-sm text-slate-600">
          Application gratuite financée par la publicité.
        </footer>
      </div>
    </div>
  );
}

