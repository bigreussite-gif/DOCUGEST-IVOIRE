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

/** Luminosité perçue (YIQ) → true si couleur claire (besoin de texte foncé) */
function isLight(hex: string): boolean {
  const h = hex.replace("#", "");
  if (h.length < 6) return false;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 155;
}

/** Mélange la couleur avec du blanc pour obtenir une teinte pastel */
function lighten(hex: string, amount = 0.88): string {
  const h = hex.replace("#", "");
  if (h.length < 6) return "#f0fdf4";
  const r = Math.round(parseInt(h.slice(0, 2), 16) * (1 - amount) + 255 * amount);
  const g = Math.round(parseInt(h.slice(2, 4), 16) * (1 - amount) + 255 * amount);
  const b = Math.round(parseInt(h.slice(4, 6), 16) * (1 - amount) + 255 * amount);
  return `rgb(${r},${g},${b})`;
}

/** Hex fiable pour styles inline (évite états incohérents navigateur / color input) */
function normalizeHex(input: string | null | undefined, fallback = "#1a6b4a"): string {
  if (!input || !String(input).trim()) return fallback;
  let h = String(input).trim();
  if (h.startsWith("#")) h = h.slice(1);
  if (h.length === 3) {
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return fallback;
  return `#${h.toLowerCase()}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// POINT D'ENTRÉE PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────
export default function CVPreview({ data, accentColor, logoDataUrl }: {
  data: CVData;
  accentColor?: string | null;
  logoDataUrl?: string | null;
}) {
  const accent = normalizeHex(accentColor ?? undefined, "#1a6b4a");

  if (data.template === "moderne") return <CVModerne data={data} accent={accent} logoDataUrl={logoDataUrl} />;
  if (data.template === "compact") return <CVCompact data={data} accent={accent} logoDataUrl={logoDataUrl} />;
  return <CVClassique data={data} accent={accent} logoDataUrl={logoDataUrl} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE 1 — CLASSIQUE
// Fond blanc, une colonne, photo ronde + header, sections avec bordure gauche colorée
// ─────────────────────────────────────────────────────────────────────────────
function CVClassique({ data, accent, logoDataUrl }: { data: CVData; accent: string; logoDataUrl?: string | null }) {
  const pastel = lighten(accent, 0.90);
  return (
    <div style={{ display: "flex", maxWidth: 794, background: "#fff", lineHeight: 1.6, boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.04)" }}>
      {/* Bandeau vertical gauche — identité « classique » (différent du compact latéral droit) */}
      <div style={{ width: 7, flexShrink: 0, backgroundColor: accent, background: accent }} aria-hidden />
      <div style={{ flex: 1, minWidth: 0, fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 11, color: "#1e293b" }}>
      {/* Bannière d'en-tête */}
      <div style={{ background: pastel, borderBottom: `4px solid ${accent}`, padding: "24px 36px 20px", display: "flex", alignItems: "center", gap: 20 }}>
        {data.photoDataUrl && (
          <img src={data.photoDataUrl} alt="Photo" style={{ width: 100, height: 100, borderRadius: "50%", objectFit: "cover", border: `3px solid ${accent}`, flexShrink: 0 }} />
        )}
        {logoDataUrl && !data.photoDataUrl && (
          <img src={logoDataUrl} alt="Logo" style={{ height: 64, maxWidth: 140, objectFit: "contain", flexShrink: 0 }} />
        )}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: accent, letterSpacing: "-0.5px" }}>{data.nom || "Votre Nom"}</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginTop: 2 }}>{data.titre}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "3px 18px", marginTop: 8, fontSize: 9.5, color: "#64748b" }}>
            {data.lieuResidence && <span>📍 {data.lieuResidence}</span>}
            {data.telephone && <span>📞 {data.telephone}</span>}
            {data.email && <span>✉ {data.email}</span>}
            {data.linkedin && <span>🔗 {data.linkedin}</span>}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "3px 18px", marginTop: 3, fontSize: 9.5, color: "#64748b" }}>
            {data.nationalite && <span>🌍 {data.nationalite}</span>}
            {data.situation && <span>💍 {data.situation}</span>}
            {data.permis && data.permis !== "Aucun" && <span>🚗 Permis {data.permis}</span>}
          </div>
        </div>
      </div>

      <div style={{ padding: "20px 36px 28px" }}>
        {/* Profil */}
        {data.profil && (
          <ClassiqueSection title="Profil" accent={accent}>
            <p style={{ color: "#374151", lineHeight: 1.75, marginTop: 6, fontStyle: "italic" }}>{data.profil}</p>
          </ClassiqueSection>
        )}

        {/* Expériences */}
        {data.experiences?.filter(e => e.poste).length > 0 && (
          <ClassiqueSection title="Expériences professionnelles" accent={accent}>
            {data.experiences.filter(e => e.poste).map((exp, i) => (
              <div key={i} style={{ marginTop: i === 0 ? 8 : 14, paddingLeft: 12, borderLeft: `2px solid ${lighten(accent, 0.6)}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ fontWeight: 700, fontSize: 11 }}>{exp.poste}</div>
                  <div style={{ fontSize: 9.5, color: "#64748b", whiteSpace: "nowrap", marginLeft: 8 }}><PeriodText debut={exp.dateDebut} fin={exp.dateFin} actuel={exp.actuel} /></div>
                </div>
                <div style={{ color: accent, fontSize: 10, fontWeight: 600, marginTop: 1 }}>{exp.entreprise}{exp.localisation ? ` — ${exp.localisation}` : ""}</div>
                {exp.missions && (
                  <ul style={{ marginTop: 4, paddingLeft: 14, fontSize: 10, color: "#374151" }}>
                    {exp.missions.split("\n").filter(Boolean).map((m, j) => (
                      <li key={j} style={{ marginBottom: 1 }}>{m.replace(/^[•\-]?\s*/, "")}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </ClassiqueSection>
        )}

        {/* Formations */}
        {data.formations?.filter(f => f.diplome).length > 0 && (
          <ClassiqueSection title="Formations" accent={accent}>
            {data.formations.filter(f => f.diplome).map((f, i) => (
              <div key={i} style={{ marginTop: i === 0 ? 8 : 10, paddingLeft: 12, borderLeft: `2px solid ${lighten(accent, 0.6)}` }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div style={{ fontWeight: 700 }}>{f.diplome}</div>
                  <div style={{ fontSize: 9.5, color: "#64748b" }}>{f.annee}</div>
                </div>
                <div style={{ color: accent, fontSize: 10 }}>{f.etablissement}{f.localisation ? ` — ${f.localisation}` : ""}</div>
                {f.mention && f.mention !== "Aucune" && <div style={{ fontSize: 9.5, color: "#64748b" }}>Mention : {f.mention}</div>}
              </div>
            ))}
          </ClassiqueSection>
        )}

        {/* Compétences + Langues */}
        <div style={{ display: "flex", gap: 28, marginTop: 16 }}>
          {data.competences?.filter(c => c.nom).length > 0 && (
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, fontWeight: 900, color: accent, textTransform: "uppercase", letterSpacing: 1, borderBottom: `2px solid ${accent}`, paddingBottom: 3, marginBottom: 8 }}>Compétences</div>
              {data.competences.filter(c => c.nom).map((c, i) => (
                <div key={i} style={{ marginBottom: 7 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginBottom: 2 }}>
                    <span style={{ fontWeight: 600 }}>{c.nom}</span>
                    <span style={{ color: "#64748b", fontSize: 9 }}>{c.niveau}</span>
                  </div>
                  <div style={{ height: 5, background: lighten(accent, 0.7), borderRadius: 3 }}>
                    <div style={{ height: 5, background: accent, borderRadius: 3, width: `${NIVEAU_COMP[c.niveau] || 50}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
          {data.langues?.filter(l => l.langue).length > 0 && (
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, fontWeight: 900, color: accent, textTransform: "uppercase", letterSpacing: 1, borderBottom: `2px solid ${accent}`, paddingBottom: 3, marginBottom: 8 }}>Langues</div>
              {data.langues.filter(l => l.langue).map((l, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginBottom: 5, alignItems: "center" }}>
                  <span style={{ fontWeight: 600 }}>{l.langue}</span>
                  <span style={{ color: accent, letterSpacing: 2, fontSize: 9 }}>{NIVEAU_LANG[l.niveau] || l.niveau}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {data.interets && (
          <ClassiqueSection title="Centres d'intérêt" accent={accent}>
            <p style={{ fontSize: 10, color: "#374151", marginTop: 6 }}>{data.interets}</p>
          </ClassiqueSection>
        )}

        {data.referencesDisponibles && (
          <p style={{ marginTop: 16, fontSize: 9.5, fontStyle: "italic", color: "#64748b" }}>✓ Références disponibles sur demande.</p>
        )}
      </div>

      <div style={{ borderTop: `1px solid ${lighten(accent, 0.7)}`, padding: "6px 36px", textAlign: "center", fontSize: 8, color: "#94a3b8" }}>
        CV généré sur DocuGestIvoire — docugest-ivoire.vercel.app
      </div>
      </div>
    </div>
  );
}

function ClassiqueSection({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) {
  return (
    <section style={{ marginTop: 18 }}>
      <div style={{ fontSize: 10, fontWeight: 900, color: accent, textTransform: "uppercase", letterSpacing: 1.5, borderBottom: `2px solid ${accent}`, paddingBottom: 3 }}>{title}</div>
      {children}
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE 2 — MODERNE
// 2 colonnes : sidebar colorée (gauche) + contenu blanc (droite)
// ─────────────────────────────────────────────────────────────────────────────
function CVModerne({ data, accent, logoDataUrl }: { data: CVData; accent: string; logoDataUrl?: string | null }) {
  const onDark = isLight(accent) ? "#1e293b" : "#ffffff";
  const onDarkSub = isLight(accent) ? "rgba(0,0,0,0.55)" : "rgba(255,255,255,0.65)";
  const onDarkMuted = isLight(accent) ? "rgba(0,0,0,0.38)" : "rgba(255,255,255,0.42)";
  /** Sur fond sombre : barres en blanc cassé (plus de vert lime qui fausse la lecture de la couleur) */
  const barFill = isLight(accent) ? "#1e293b" : "rgba(255,255,255,0.9)";
  const barTrack = isLight(accent) ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.22)";

  return (
    <div style={{ fontFamily: "Arial, Helvetica, sans-serif", fontSize: 11, color: "#111", display: "flex", minHeight: 1000, background: "#fff", maxWidth: 794 }}>
      {/* ── Sidebar gauche — backgroundColor + background pour forcer la teinte choisie ── */}
      <div
        style={{
          width: 230,
          backgroundColor: accent,
          background: accent,
          color: onDark,
          padding: "32px 18px 24px",
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          gap: 0,
        }}
      >
        {data.photoDataUrl && (
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
            <img src={data.photoDataUrl} alt="Photo" style={{ display: "block", width: 110, height: 110, borderRadius: "50%", objectFit: "cover", objectPosition: "center", border: `3px solid ${isLight(accent) ? "rgba(0,0,0,0.18)" : "rgba(255,255,255,0.30)"}` }} />
          </div>
        )}
        {logoDataUrl && (
          <div style={{ textAlign: "center", marginBottom: 12 }}>
            <img src={logoDataUrl} alt="Logo" style={{ height: 46, maxWidth: 130, objectFit: "contain", margin: "0 auto", opacity: 0.9 }} />
          </div>
        )}
        <div style={{ textAlign: "center", marginBottom: 22, borderBottom: `1px solid ${onDarkMuted}`, paddingBottom: 18 }}>
          <div style={{ fontSize: 14, fontWeight: 900, color: onDark, letterSpacing: "-0.3px" }}>{data.nom || "Votre Nom"}</div>
          <div style={{ fontSize: 10, color: onDarkSub, marginTop: 4 }}>{data.titre}</div>
        </div>

        {/* Contact */}
        <ModerneBlock label="Contact" mutedColor={onDarkMuted}>
          {[
            { icon: "📍", val: data.lieuResidence },
            { icon: "📞", val: data.telephone },
            { icon: "✉", val: data.email },
            { icon: "🔗", val: data.linkedin },
          ].filter(x => x.val).map(({ icon, val }) => (
            <div key={icon} style={{ display: "flex", gap: 6, marginBottom: 4, fontSize: 9.5, color: onDark, alignItems: "flex-start" }}>
              <span style={{ width: 13, flexShrink: 0 }}>{icon}</span>
              <span style={{ wordBreak: "break-word", opacity: 0.88 }}>{val}</span>
            </div>
          ))}
        </ModerneBlock>

        {/* Compétences */}
        {data.competences?.filter(c => c.nom).length > 0 && (
          <ModerneBlock label="Compétences" mutedColor={onDarkMuted}>
            {data.competences.filter(c => c.nom).map((c, i) => (
              <div key={i} style={{ marginBottom: 6 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9.5, color: onDark, marginBottom: 2 }}>
                  <span>{c.nom}</span>
                  <span style={{ opacity: 0.55, fontSize: 8.5 }}>{c.niveau}</span>
                </div>
                <div style={{ height: 4, background: barTrack, borderRadius: 2 }}>
                  <div style={{ height: 4, background: barFill, borderRadius: 2, width: `${NIVEAU_COMP[c.niveau] || 50}%` }} />
                </div>
              </div>
            ))}
          </ModerneBlock>
        )}

        {/* Langues */}
        {data.langues?.filter(l => l.langue).length > 0 && (
          <ModerneBlock label="Langues" mutedColor={onDarkMuted}>
            {data.langues.filter(l => l.langue).map((l, i) => (
              <div key={i} style={{ marginBottom: 5 }}>
                <div style={{ fontSize: 9.5, fontWeight: 600, color: onDark }}>{l.langue}</div>
                <div style={{ fontSize: 9, color: onDarkSub }}>{NIVEAU_LANG[l.niveau] || l.niveau}</div>
              </div>
            ))}
          </ModerneBlock>
        )}

        {/* Infos */}
        {(data.nationalite || data.situation || (data.permis && data.permis !== "Aucun")) && (
          <ModerneBlock label="Infos" mutedColor={onDarkMuted}>
            {[
              data.nationalite && `Nationalité : ${data.nationalite}`,
              data.situation && `Situation : ${data.situation}`,
              data.permis && data.permis !== "Aucun" && `Permis ${data.permis}`,
            ].filter(Boolean).map((t, i) => (
              <div key={i} style={{ fontSize: 9.5, color: onDark, opacity: 0.85, marginBottom: 3 }}>{t}</div>
            ))}
          </ModerneBlock>
        )}
      </div>

      {/* ── Colonne droite ── */}
      <div style={{ flex: 1, padding: "32px 24px 24px" }}>
        {data.profil && (
          <ModerneRightSection title="Profil" accent={accent}>
            <p style={{ color: "#374151", lineHeight: 1.75 }}>{data.profil}</p>
          </ModerneRightSection>
        )}
        {data.experiences?.filter(e => e.poste).length > 0 && (
          <ModerneRightSection title="Expériences" accent={accent}>
            {data.experiences.filter(e => e.poste).map((exp, i) => (
              <div key={i} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div style={{ fontWeight: 700, fontSize: 10.5 }}>{exp.poste}</div>
                  <div style={{ fontSize: 9.5, color: "#64748b", whiteSpace: "nowrap", marginLeft: 8 }}><PeriodText debut={exp.dateDebut} fin={exp.dateFin} actuel={exp.actuel} /></div>
                </div>
                <div style={{ color: accent, fontSize: 9.5, fontWeight: 600 }}>{exp.entreprise}{exp.localisation ? ` — ${exp.localisation}` : ""}</div>
                {exp.missions && (
                  <ul style={{ marginTop: 3, paddingLeft: 13, fontSize: 9.5, color: "#374151" }}>
                    {exp.missions.split("\n").filter(Boolean).map((m, j) => (
                      <li key={j} style={{ marginBottom: 1 }}>{m.replace(/^[•\-]?\s*/, "")}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </ModerneRightSection>
        )}
        {data.formations?.filter(f => f.diplome).length > 0 && (
          <ModerneRightSection title="Formations" accent={accent}>
            {data.formations.filter(f => f.diplome).map((f, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div style={{ fontWeight: 700, fontSize: 10.5 }}>{f.diplome}</div>
                  <div style={{ fontSize: 9.5, color: "#64748b" }}>{f.annee}</div>
                </div>
                <div style={{ color: accent, fontSize: 9.5 }}>{f.etablissement}{f.localisation ? ` — ${f.localisation}` : ""}</div>
                {f.mention && f.mention !== "Aucune" && <div style={{ fontSize: 9.5, color: "#64748b" }}>Mention : {f.mention}</div>}
              </div>
            ))}
          </ModerneRightSection>
        )}
        {data.interets && (
          <ModerneRightSection title="Centres d'intérêt" accent={accent}>
            <p style={{ fontSize: 9.5, color: "#374151" }}>{data.interets}</p>
          </ModerneRightSection>
        )}
        {data.referencesDisponibles && (
          <p style={{ marginTop: 14, fontSize: 9.5, fontStyle: "italic", color: "#64748b" }}>✓ Références disponibles sur demande.</p>
        )}
      </div>
    </div>
  );
}

function ModerneBlock({ label, mutedColor, children }: { label: string; mutedColor: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 8.5, fontWeight: 900, textTransform: "uppercase", letterSpacing: 1.2, color: mutedColor, marginBottom: 8 }}>{label}</div>
      {children}
    </div>
  );
}

function ModerneRightSection({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 10, fontWeight: 900, color: accent, textTransform: "uppercase", letterSpacing: 1, borderBottom: `2px solid ${accent}`, paddingBottom: 3, marginBottom: 8 }}>{title}</div>
      {children}
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE 3 — COMPACT
// Position inversée vs « Moderne » : colonne principale à GAUCHE (blanc), bandeau à DROITE
// couleur accent (photo, contact, compétences). Une page, Helvetica, très distinct du classique.
// ─────────────────────────────────────────────────────────────────────────────
function CVCompact({ data, accent, logoDataUrl }: { data: CVData; accent: string; logoDataUrl?: string | null }) {
  const onAccent = isLight(accent) ? "#1e293b" : "#ffffff";
  const onAccentSub = isLight(accent) ? "rgba(0,0,0,0.58)" : "rgba(255,255,255,0.72)";
  const onMuted = isLight(accent) ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.45)";
  const barFill = isLight(accent) ? "#1e293b" : "rgba(255,255,255,0.88)";
  const barTrack = isLight(accent) ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.2)";

  return (
    <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 10.5, color: "#1e293b", background: "#fff", maxWidth: 794 }}>
      <div style={{ display: "flex", flexDirection: "row", minHeight: 960 }}>
      {/* ── Colonne gauche : contenu principal (pas de bandeau haut coloré) ── */}
      <div style={{ flex: 1, padding: "28px 22px 24px 28px", minWidth: 0 }}>
        <div style={{ borderBottom: `3px solid ${accent}`, paddingBottom: 10, marginBottom: 14 }}>
          <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-0.8px", color: "#0f172a" }}>{data.nom || "Votre Nom"}</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: accent, marginTop: 4 }}>{data.titre}</div>
        </div>

        {data.profil && (
          <section style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 8.5, fontWeight: 900, letterSpacing: 1.4, color: "#64748b", marginBottom: 6 }}>PROFIL</div>
            <p style={{ fontSize: 10, color: "#334155", lineHeight: 1.65, margin: 0 }}>{data.profil}</p>
          </section>
        )}

        {data.experiences?.filter(e => e.poste).length > 0 && (
          <CompactMainSection title="Expériences" accent={accent}>
            {data.experiences.filter(e => e.poste).map((exp, i) => (
              <div key={i} style={{ marginBottom: 11, paddingLeft: 10, borderLeft: `2px solid ${lighten(accent, 0.55)}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <span style={{ fontWeight: 800, fontSize: 10.5 }}>{exp.poste}</span>
                  <span style={{ fontSize: 8.5, color: "#64748b", whiteSpace: "nowrap" }}><PeriodText debut={exp.dateDebut} fin={exp.dateFin} actuel={exp.actuel} /></span>
                </div>
                <div style={{ fontSize: 9.5, color: accent, fontWeight: 600, marginTop: 2 }}>{exp.entreprise}{exp.localisation ? ` — ${exp.localisation}` : ""}</div>
                {exp.missions && (
                  <ul style={{ margin: "4px 0 0", paddingLeft: 12, fontSize: 9.5, color: "#475569" }}>
                    {exp.missions.split("\n").filter(Boolean).map((m, j) => (
                      <li key={j} style={{ marginBottom: 1 }}>{m.replace(/^[•\-]?\s*/, "")}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </CompactMainSection>
        )}

        {data.formations?.filter(f => f.diplome).length > 0 && (
          <CompactMainSection title="Formations" accent={accent}>
            {data.formations.filter(f => f.diplome).map((f, i) => (
              <div key={i} style={{ marginBottom: 8, display: "flex", justifyContent: "space-between", gap: 10 }}>
                <div>
                  <div style={{ fontWeight: 800 }}>{f.diplome}</div>
                  <div style={{ fontSize: 9.5, color: "#475569" }}>{f.etablissement}{f.localisation ? ` · ${f.localisation}` : ""}</div>
                  {f.mention && f.mention !== "Aucune" && <div style={{ fontSize: 8.5, color: "#94a3b8" }}>{f.mention}</div>}
                </div>
                <div style={{ fontSize: 8.5, color: "#64748b", whiteSpace: "nowrap" }}>{f.annee}</div>
              </div>
            ))}
          </CompactMainSection>
        )}

        {data.interets && (
          <CompactMainSection title="Centres d'intérêt" accent={accent}>
            <p style={{ fontSize: 9.5, color: "#475569", margin: 0, lineHeight: 1.55 }}>{data.interets}</p>
          </CompactMainSection>
        )}
        {data.referencesDisponibles && (
          <p style={{ marginTop: 12, fontSize: 9, fontStyle: "italic", color: "#64748b" }}>✓ Références sur demande.</p>
        )}
      </div>

      {/* ── Colonne droite : bandeau accent (miroir du modèle moderne) ── */}
      <div
        style={{
          width: 208,
          flexShrink: 0,
          backgroundColor: accent,
          background: accent,
          color: onAccent,
          padding: "24px 16px 20px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {data.photoDataUrl && (
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
            <img
              src={data.photoDataUrl}
              alt="Photo"
              style={{
                display: "block",
                width: 96,
                height: 96,
                borderRadius: "50%",
                objectFit: "cover",
                objectPosition: "center",
                border: `2px solid ${isLight(accent) ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.35)"}`,
              }}
            />
          </div>
        )}
        {logoDataUrl && !data.photoDataUrl && (
          <div style={{ textAlign: "center", marginBottom: 10 }}>
            <img src={logoDataUrl} alt="Logo" style={{ height: 48, maxWidth: 140, objectFit: "contain", opacity: 0.92 }} />
          </div>
        )}

        <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: 1.1, color: onMuted, marginBottom: 6 }}>CONTACT</div>
        {[
          { icon: "📍", val: data.lieuResidence },
          { icon: "📞", val: data.telephone },
          { icon: "✉", val: data.email },
          { icon: "🔗", val: data.linkedin },
        ]
          .filter((x) => x.val)
          .map(({ icon, val }) => (
            <div key={icon} style={{ display: "flex", gap: 5, marginBottom: 4, fontSize: 9, alignItems: "flex-start" }}>
              <span style={{ flexShrink: 0 }}>{icon}</span>
              <span style={{ wordBreak: "break-word", opacity: 0.92 }}>{val}</span>
            </div>
          ))}

        {(data.nationalite || data.situation || (data.permis && data.permis !== "Aucun")) && (
          <>
            <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: 1.1, color: onMuted, margin: "14px 0 6px" }}>INFOS</div>
            {data.nationalite && <div style={{ fontSize: 9, marginBottom: 3 }}>{data.nationalite}</div>}
            {data.situation && <div style={{ fontSize: 9, marginBottom: 3 }}>{data.situation}</div>}
            {data.permis && data.permis !== "Aucun" && <div style={{ fontSize: 9 }}>Permis {data.permis}</div>}
          </>
        )}

        {data.competences?.filter((c) => c.nom).length > 0 && (
          <>
            <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: 1.1, color: onMuted, margin: "14px 0 6px" }}>COMPÉTENCES</div>
            {data.competences.filter((c) => c.nom).map((c, i) => (
              <div key={i} style={{ marginBottom: 6 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, marginBottom: 2 }}>
                  <span style={{ fontWeight: 600 }}>{c.nom}</span>
                  <span style={{ opacity: 0.65, fontSize: 8 }}>{c.niveau}</span>
                </div>
                <div style={{ height: 3, background: barTrack, borderRadius: 2 }}>
                  <div style={{ height: 3, background: barFill, borderRadius: 2, width: `${NIVEAU_COMP[c.niveau] || 50}%` }} />
                </div>
              </div>
            ))}
          </>
        )}

        {data.langues?.filter((l) => l.langue).length > 0 && (
          <>
            <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: 1.1, color: onMuted, margin: "12px 0 6px" }}>LANGUES</div>
            {data.langues.filter((l) => l.langue).map((l, i) => (
              <div key={i} style={{ marginBottom: 5, fontSize: 9.5 }}>
                <div style={{ fontWeight: 700 }}>{l.langue}</div>
                <div style={{ fontSize: 8.5, color: onAccentSub }}>{NIVEAU_LANG[l.niveau] || l.niveau}</div>
              </div>
            ))}
          </>
        )}
      </div>
      </div>

      <div style={{ borderTop: "1px solid #e2e8f0", padding: "5px 20px", textAlign: "center", fontSize: 7.5, color: "#94a3b8" }}>
        CV généré sur DocuGestIvoire — docugest-ivoire.vercel.app
      </div>
    </div>
  );
}

function CompactMainSection({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 8.5, fontWeight: 900, letterSpacing: 1.5, color: accent, borderLeft: `4px solid ${accent}`, paddingLeft: 8, marginBottom: 8 }}>
        {title}
      </div>
      {children}
    </section>
  );
}

