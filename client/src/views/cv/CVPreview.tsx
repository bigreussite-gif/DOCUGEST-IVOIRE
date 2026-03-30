export type CVExperience = {
  poste: string;
  entreprise: string;
  localisation: string;
  dateDebut: string;
  dateFin: string;
  actuel: boolean;
  missions: string;
};

export type CVFormation = {
  diplome: string;
  etablissement: string;
  localisation: string;
  annee: string;
  mention: string;
};

export type CVCompetence = {
  nom: string;
  niveau: string;
};

export type CVLangue = {
  langue: string;
  niveau: string;
};

export type CVData = {
  template: "classique" | "moderne" | "compact";
  nom: string;
  titre: string;
  dateNaissance: string;
  lieuResidence: string;
  telephone: string;
  email: string;
  linkedin: string;
  permis: string;
  situation: string;
  nationalite: string;
  profil: string;
  experiences: CVExperience[];
  formations: CVFormation[];
  competences: CVCompetence[];
  langues: CVLangue[];
  interets: string;
  referencesDisponibles: boolean;
  photoDataUrl: string;
};

const NIVEAU_COMP: Record<string, number> = {
  "Débutant": 25,
  "Intermédiaire": 50,
  "Avancé": 75,
  "Expert": 100,
};

const NIVEAU_LANG: Record<string, string> = {
  "Notions": "●○○○○",
  "Intermédiaire": "●●○○○",
  "Courant": "●●●○○",
  "Bilingue": "●●●●○",
  "Langue maternelle": "●●●●●",
};

function PeriodText({ debut, fin, actuel }: { debut: string; fin: string; actuel: boolean }) {
  const fmt = (s: string) => {
    if (!s) return "";
    const [y, m] = s.split("-");
    const months = ["Jan","Fév","Mar","Avr","Mai","Juin","Jul","Aoû","Sep","Oct","Nov","Déc"];
    return `${months[(parseInt(m) || 1) - 1]} ${y}`;
  };
  return <span>{fmt(debut)}{debut ? " – " : ""}{actuel ? "Présent" : fmt(fin)}</span>;
}

export default function CVPreview({ data, accentColor, logoDataUrl }: { data: CVData; accentColor?: string | null; logoDataUrl?: string | null }) {
  const ACCENT = accentColor || "#1a6b4a";
  const NAVY = "#1e3a5f";
  const accent = data.template === "moderne" ? NAVY : ACCENT;

  if (data.template === "moderne") {
    return (
      <div style={{ fontFamily: "Arial, sans-serif", fontSize: 11, color: "#111", display: "flex", minHeight: 1000, background: "#fff", maxWidth: 794 }}>
        {/* Colonne gauche */}
        <div style={{ width: 240, background: NAVY, color: "#fff", padding: "28px 20px", flexShrink: 0 }}>
          {data.photoDataUrl && (
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <img src={data.photoDataUrl} alt="Photo" style={{ width: 90, height: 90, borderRadius: "50%", objectFit: "cover", border: "3px solid rgba(255,255,255,0.3)" }} />
            </div>
          )}
          {logoDataUrl && (
            <div style={{ textAlign: "center", marginBottom: 12 }}>
              <img src={logoDataUrl} alt="Logo" style={{ height: 36, maxWidth: 100, objectFit: "contain", margin: "0 auto", opacity: 0.9 }} />
            </div>
          )}
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <div style={{ fontSize: 15, fontWeight: 800 }}>{data.nom || "Votre Nom"}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", marginTop: 4 }}>{data.titre}</div>
          </div>

          {/* Contact */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>Contact</div>
            {[
              { label: "📍", val: data.lieuResidence },
              { label: "📞", val: data.telephone },
              { label: "✉", val: data.email },
              { label: "🔗", val: data.linkedin },
            ].filter(({ val }) => val).map(({ label, val }) => (
              <div key={label} style={{ display: "flex", gap: 6, marginBottom: 4, fontSize: 10, alignItems: "flex-start" }}>
                <span style={{ width: 14 }}>{label}</span>
                <span style={{ wordBreak: "break-word", opacity: 0.85 }}>{val}</span>
              </div>
            ))}
          </div>

          {/* Compétences */}
          {data.competences?.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>Compétences</div>
              {data.competences.map((c, i) => (
                <div key={i} style={{ marginBottom: 6 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginBottom: 2 }}>
                    <span>{c.nom}</span>
                    <span style={{ opacity: 0.6, fontSize: 9 }}>{c.niveau}</span>
                  </div>
                  <div style={{ height: 4, background: "rgba(255,255,255,0.2)", borderRadius: 2 }}>
                    <div style={{ height: 4, background: "#4ade80", borderRadius: 2, width: `${NIVEAU_COMP[c.niveau] || 50}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Langues */}
          {data.langues?.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>Langues</div>
              {data.langues.map((l, i) => (
                <div key={i} style={{ marginBottom: 5 }}>
                  <div style={{ fontSize: 10, fontWeight: 600 }}>{l.langue}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.55)" }}>{NIVEAU_LANG[l.niveau] || l.niveau}</div>
                </div>
              ))}
            </div>
          )}

          {/* Infos perso */}
          <div>
            <div style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>Infos</div>
            {[
              data.nationalite && `Nationalité : ${data.nationalite}`,
              data.situation && `Situation : ${data.situation}`,
              data.permis && data.permis !== "Aucun" && `Permis ${data.permis}`,
            ].filter(Boolean).map((t, i) => <div key={i} style={{ fontSize: 10, opacity: 0.8, marginBottom: 3 }}>{t}</div>)}
          </div>
        </div>

        {/* Colonne droite */}
        <div style={{ flex: 1, padding: "28px 24px" }}>
          {data.profil && (
            <section style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: NAVY, textTransform: "uppercase", letterSpacing: 1, borderBottom: `2px solid ${NAVY}`, paddingBottom: 4, marginBottom: 8 }}>Profil</div>
              <p style={{ color: "#374151", lineHeight: 1.7 }}>{data.profil}</p>
            </section>
          )}

          {data.experiences?.filter((e) => e.poste).length > 0 && (
            <section style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: NAVY, textTransform: "uppercase", letterSpacing: 1, borderBottom: `2px solid ${NAVY}`, paddingBottom: 4, marginBottom: 10 }}>Expériences</div>
              {data.experiences.filter((e) => e.poste).map((exp, i) => (
                <div key={i} style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div style={{ fontWeight: 700 }}>{exp.poste}</div>
                    <div style={{ fontSize: 10, color: "#6b7280" }}><PeriodText debut={exp.dateDebut} fin={exp.dateFin} actuel={exp.actuel} /></div>
                  </div>
                  <div style={{ color: NAVY, fontSize: 10, fontWeight: 600 }}>{exp.entreprise}{exp.localisation ? ` — ${exp.localisation}` : ""}</div>
                  {exp.missions && (
                    <ul style={{ marginTop: 4, paddingLeft: 14, fontSize: 10, color: "#374151" }}>
                      {exp.missions.split("\n").filter(Boolean).map((m, j) => <li key={j} style={{ marginBottom: 2 }}>{m.replace(/^[•\-]?\s*/, "")}</li>)}
                    </ul>
                  )}
                </div>
              ))}
            </section>
          )}

          {data.formations?.filter((f) => f.diplome).length > 0 && (
            <section style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: NAVY, textTransform: "uppercase", letterSpacing: 1, borderBottom: `2px solid ${NAVY}`, paddingBottom: 4, marginBottom: 10 }}>Formations</div>
              {data.formations.filter((f) => f.diplome).map((f, i) => (
                <div key={i} style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div style={{ fontWeight: 700 }}>{f.diplome}</div>
                    <div style={{ fontSize: 10, color: "#6b7280" }}>{f.annee}</div>
                  </div>
                  <div style={{ color: NAVY, fontSize: 10 }}>{f.etablissement}{f.localisation ? ` — ${f.localisation}` : ""}</div>
                  {f.mention && f.mention !== "Aucune" && <div style={{ fontSize: 10, color: "#6b7280" }}>Mention : {f.mention}</div>}
                </div>
              ))}
            </section>
          )}

          {data.interets && (
            <section>
              <div style={{ fontSize: 11, fontWeight: 800, color: NAVY, textTransform: "uppercase", letterSpacing: 1, borderBottom: `2px solid ${NAVY}`, paddingBottom: 4, marginBottom: 8 }}>Centres d'intérêt</div>
              <p style={{ fontSize: 10, color: "#374151" }}>{data.interets}</p>
            </section>
          )}
        </div>
        <div style={{ position: "absolute", bottom: 8, left: 0, right: 0, textAlign: "center", fontSize: 8, color: "#9ca3af" }}>
          CV généré sur DocuGest Ivoire — docugest-ivoire.vercel.app
        </div>
      </div>
    );
  }

  // Template Classique (une colonne) ou Compact
  return (
    <div style={{ fontFamily: "Arial, sans-serif", fontSize: 11, color: "#111", background: "#fff", padding: "28px 36px", maxWidth: 794, lineHeight: 1.5 }}>
      {/* Header */}
      <div style={{ display: "flex", gap: 20, marginBottom: 20, alignItems: "flex-start" }}>
        {logoDataUrl && !data.photoDataUrl && (
          <img src={logoDataUrl} alt="Logo" style={{ height: 50, maxWidth: 90, objectFit: "contain", flexShrink: 0 }} />
        )}
        {data.photoDataUrl && (
          <img src={data.photoDataUrl} alt="Photo" style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover", border: `2px solid ${accent}`, flexShrink: 0 }} />
        )}
        <div>
          <div style={{ fontSize: 20, fontWeight: 900, color: accent }}>{data.nom || "Votre Nom"}</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginTop: 2 }}>{data.titre}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 16px", marginTop: 8, fontSize: 10, color: "#6b7280" }}>
            {data.lieuResidence && <span>📍 {data.lieuResidence}</span>}
            {data.telephone && <span>📞 {data.telephone}</span>}
            {data.email && <span>✉ {data.email}</span>}
            {data.linkedin && <span>🔗 {data.linkedin}</span>}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 16px", marginTop: 4, fontSize: 10, color: "#6b7280" }}>
            {data.nationalite && <span>🌍 {data.nationalite}</span>}
            {data.situation && <span>💍 {data.situation}</span>}
            {data.permis && data.permis !== "Aucun" && <span>🚗 Permis {data.permis}</span>}
          </div>
        </div>
      </div>

      {/* Profil */}
      {data.profil && (
        <Section title="Profil" accent={accent}>
          <p style={{ color: "#374151", lineHeight: 1.7, marginTop: 6 }}>{data.profil}</p>
        </Section>
      )}

      {/* Expériences */}
      {data.experiences?.filter((e) => e.poste).length > 0 && (
        <Section title="Expériences professionnelles" accent={accent}>
          {data.experiences.filter((e) => e.poste).map((exp, i) => (
            <div key={i} style={{ marginTop: i === 0 ? 8 : 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ fontWeight: 700 }}>{exp.poste}</div>
                <div style={{ fontSize: 10, color: "#6b7280" }}><PeriodText debut={exp.dateDebut} fin={exp.dateFin} actuel={exp.actuel} /></div>
              </div>
              <div style={{ color: accent, fontSize: 10, fontWeight: 600 }}>{exp.entreprise}{exp.localisation ? ` — ${exp.localisation}` : ""}</div>
              {exp.missions && (
                <ul style={{ marginTop: 4, paddingLeft: 14, fontSize: 10, color: "#374151" }}>
                  {exp.missions.split("\n").filter(Boolean).map((m, j) => <li key={j} style={{ marginBottom: 1 }}>{m.replace(/^[•\-]?\s*/, "")}</li>)}
                </ul>
              )}
            </div>
          ))}
        </Section>
      )}

      {/* Formations */}
      {data.formations?.filter((f) => f.diplome).length > 0 && (
        <Section title="Formations" accent={accent}>
          {data.formations.filter((f) => f.diplome).map((f, i) => (
            <div key={i} style={{ marginTop: i === 0 ? 8 : 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ fontWeight: 700 }}>{f.diplome}</div>
                <div style={{ fontSize: 10, color: "#6b7280" }}>{f.annee}</div>
              </div>
              <div style={{ color: accent, fontSize: 10 }}>{f.etablissement}{f.localisation ? ` — ${f.localisation}` : ""}</div>
              {f.mention && f.mention !== "Aucune" && <div style={{ fontSize: 10, color: "#6b7280" }}>Mention : {f.mention}</div>}
            </div>
          ))}
        </Section>
      )}

      {/* Compétences + Langues côte à côte */}
      <div style={{ display: "flex", gap: 24, marginTop: 16 }}>
        {data.competences?.filter((c) => c.nom).length > 0 && (
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: accent, textTransform: "uppercase", letterSpacing: 1, borderBottom: `2px solid ${accent}`, paddingBottom: 3, marginBottom: 8 }}>Compétences</div>
            {data.competences.filter((c) => c.nom).map((c, i) => (
              <div key={i} style={{ marginBottom: 6 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10 }}>
                  <span>{c.nom}</span>
                  <span style={{ color: "#6b7280", fontSize: 9 }}>{c.niveau}</span>
                </div>
                <div style={{ height: 4, background: "#e5e7eb", borderRadius: 2 }}>
                  <div style={{ height: 4, background: accent, borderRadius: 2, width: `${NIVEAU_COMP[c.niveau] || 50}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {data.langues?.filter((l) => l.langue).length > 0 && (
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: accent, textTransform: "uppercase", letterSpacing: 1, borderBottom: `2px solid ${accent}`, paddingBottom: 3, marginBottom: 8 }}>Langues</div>
            {data.langues.filter((l) => l.langue).map((l, i) => (
              <div key={i} style={{ marginBottom: 5, display: "flex", justifyContent: "space-between", fontSize: 10 }}>
                <span style={{ fontWeight: 600 }}>{l.langue}</span>
                <span style={{ color: accent, letterSpacing: 2 }}>{NIVEAU_LANG[l.niveau] || l.niveau}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {data.interets && (
        <Section title="Centres d'intérêt" accent={accent}>
          <p style={{ fontSize: 10, color: "#374151", marginTop: 6 }}>{data.interets}</p>
        </Section>
      )}

      {data.referencesDisponibles && (
        <p style={{ marginTop: 16, fontSize: 10, fontStyle: "italic", color: "#6b7280" }}>
          ✓ Références disponibles sur demande.
        </p>
      )}

      <div style={{ marginTop: 24, borderTop: "1px solid #e5e7eb", paddingTop: 8, textAlign: "center", fontSize: 8, color: "#9ca3af" }}>
        CV généré sur DocuGest Ivoire — docugest-ivoire.vercel.app
      </div>
    </div>
  );
}

function Section({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) {
  return (
    <section style={{ marginTop: 16 }}>
      <div style={{ fontSize: 11, fontWeight: 800, color: accent, textTransform: "uppercase", letterSpacing: 1, borderBottom: `2px solid ${accent}`, paddingBottom: 3 }}>{title}</div>
      {children}
    </section>
  );
}
