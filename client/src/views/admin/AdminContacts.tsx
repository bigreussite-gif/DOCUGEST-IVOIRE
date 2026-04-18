import { useEffect, useState } from "react";
import { adminFetch } from "../../lib/adminApi";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";

type Contact = {
  id: string;
  full_name: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  type: "client" | "supplier" | "hybrid";
  balance: number;
  created_at: string;
};

export function AdminContacts() {
  const [items, setItems] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await adminFetch<{ items: Contact[] }>("/contacts");
      setItems(data.items);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Partenaires & Base Contacts</h1>
          <p className="text-sm text-slate-500">Gestion unifiée des clients et fournisseurs de DocuGest Ivoire</p>
        </div>
        <Button variant="primary" className="rounded-2xl shadow-emerald-200" onClick={() => setShowModal(true)}>
          + Nouveau Contact
        </Button>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Contacts</div>
          <div className="mt-1 text-2xl font-black text-slate-900">{items.length}</div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Clients Actifs</div>
          <div className="mt-1 text-2xl font-black text-emerald-600">{items.filter(i => i.type !== "supplier").length}</div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fournisseurs</div>
          <div className="mt-1 text-2xl font-black text-blue-600">{items.filter(i => i.type !== "client").length}</div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3 font-bold text-slate-700">Identité</th>
                <th className="px-4 py-3 font-bold text-slate-700">Type</th>
                <th className="px-4 py-3 font-bold text-slate-700">Contact</th>
                <th className="px-4 py-3 font-bold text-slate-700 text-right">Solde</th>
                <th className="px-4 py-3 font-bold text-slate-700 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-slate-400">Chargement...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-slate-400">Aucun contact enregistre</td></tr>
              ) : (
                items.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-4">
                      <div className="font-bold text-slate-900">{item.full_name}</div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">ID: {item.id.slice(0, 8)}</div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        item.type === "client" ? "bg-emerald-100 text-emerald-700" :
                        item.type === "supplier" ? "bg-blue-100 text-blue-700" :
                        "bg-amber-100 text-amber-700"
                      }`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-700">{item.phone}</span>
                        <span className="text-[11px] text-slate-500">{item.email || "Pas d'email"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className={`font-black ${item.balance < 0 ? "text-rose-600" : "text-emerald-600"}`}>
                        {item.balance.toLocaleString()} F
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                        <button className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-50 transition-colors">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <ContactModal onClose={() => setShowModal(false)} onSuccess={() => { setShowModal(false); load(); }} />
      )}
    </div>
  );
}

function ContactModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [type, setType] = useState<Contact["type"]>("client");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await adminFetch("/contacts", {
        method: "POST",
        body: JSON.stringify({ full_name: name, phone, whatsapp: phone, email, type })
      });
      onSuccess();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <header className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-800 tracking-tight">Nouveau Partenaire</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </header>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Input label="Nom complet" value={name} onChange={e => setName(e.target.value)} required />
          <Input label="Telephone / WhatsApp" value={phone} onChange={e => setPhone(e.target.value)} required />
          <Input label="Email (Optionnel)" type="email" value={email} onChange={e => setEmail(e.target.value)} />
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Type de compte</label>
            <select 
              value={type} 
              onChange={e => setType(e.target.value as any)}
              className="w-full min-h-[48px] px-4 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
            >
              <option value="client">Client (Hateur)</option>
              <option value="supplier">Fournisseur</option>
              <option value="hybrid">Hybride (Les deux)</option>
            </select>
          </div>
          {error && <p className="text-xs font-bold text-rose-600 bg-rose-50 p-2 rounded-lg">{error}</p>}
          <div className="pt-4 flex gap-3">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1 rounded-2xl">Annuler</Button>
            <Button type="submit" variant="primary" disabled={loading} className="flex-1 rounded-2xl shadow-emerald-200">
              {loading ? "Creation..." : "Enregistrer"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
