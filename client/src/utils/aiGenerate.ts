/**
 * IA interne DocuGestIvoire — génération de texte sans API externe.
 * Utilise les données du formulaire pour produire des drafts personnalisés.
 */

/* ─── Helpers ──────────────────────────────────────────────── */

function pick<T>(arr: T[], seed: number): T {
  return arr[Math.abs(seed) % arr.length];
}

function nameSeed(s: string): number {
  return s.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
}

function extractPosteFromObjet(objet: string): string {
  const m = objet.match(/(?:poste\s+(?:de\s+)?|en\s+tant\s+que\s+)(.+)/i);
  return m ? m[1].trim() : objet.replace(/^(candidature|offre|emploi)\s*(au|pour)?\s*/i, "").trim();
}

function calculateYearsExp(
  experiences: Array<{ dateDebut: string; dateFin: string; actuel: boolean }>
): number {
  let totalMonths = 0;
  const now = new Date();
  for (const exp of experiences ?? []) {
    if (!exp.dateDebut) continue;
    const start = new Date(exp.dateDebut + "-01");
    const end = exp.actuel ? now : exp.dateFin ? new Date(exp.dateFin + "-01") : now;
    totalMonths += Math.max(0, (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()));
  }
  return Math.floor(totalMonths / 12);
}

/* ─── Lettre de motivation ─────────────────────────────────── */

export interface LettreGenInput {
  nom: string;
  entrepriseNom: string;
  objet: string;
  typeCandidat: string;
  recruteurNom?: string;
  competences?: string[];
}

export interface LettreGenOutput {
  accroche: string;
  paragrapheVous: string;
  paragrapheMoi: string;
  paragrapheNous: string;
}

export function generateLettreParagraphs(data: LettreGenInput): LettreGenOutput {
  const seed = nameSeed(data.nom + data.entrepriseNom);
  const poste = extractPosteFromObjet(data.objet || "");
  const entreprise = data.entrepriseNom || "votre entreprise";
  const isSpontane = (data.typeCandidat || "").toLowerCase().includes("spontan");

  const accroches: string[] = [
    `C'est avec un vif intérêt que je me permets de vous soumettre ma candidature${poste ? ` au poste de ${poste}` : ""}. Convaincu(e) que ${entreprise} représente un cadre idéal pour exprimer mes compétences, je suis déterminé(e) à contribuer activement à votre succès.`,
    `Passionné(e) par ${poste ? `le domaine lié au poste de ${poste}` : "ce secteur d'activité"} et désireux(se) d'évoluer au sein d'une structure de référence comme ${entreprise}, je vous adresse${isSpontane ? " spontanément" : ""} ma candidature avec la conviction d'y apporter une réelle valeur ajoutée.`,
    `Ayant pris connaissance de ${isSpontane ? "vos activités et de votre positionnement" : "votre offre de recrutement"}, je suis persuadé(e) que ${entreprise} est la structure au sein de laquelle je pourrai pleinement exprimer mes compétences${poste ? ` en tant que ${poste}` : ""}. C'est pourquoi je me permets de vous adresser ma candidature.`,
    `La réputation de ${entreprise} en termes de qualité et d'engagement auprès de ses partenaires m'a profondément motivé(e) à vous soumettre${isSpontane ? " spontanément" : ""} ma candidature${poste ? ` pour le poste de ${poste}` : ""}. Je suis convaincu(e) que nos aspirations professionnelles sont en parfaite adéquation.`,
  ];

  const paragraphesVous: string[] = [
    `${entreprise} est reconnu(e) pour son sérieux et la qualité de ses services dans son secteur d'activité. Votre réputation d'employeur engagé et votre culture d'excellence m'ont particulièrement séduit(e). Je suis convaincu(e) que vos valeurs correspondent parfaitement à mes aspirations professionnelles et que vos équipes constituent un environnement stimulant pour m'épanouir pleinement.`,
    `La position de ${entreprise} sur le marché et son engagement constant envers ses clients témoignent d'une culture d'entreprise axée sur la performance et le professionnalisme. C'est cette dynamique qui m'a convaincu(e) de vous adresser ma candidature, persuadé(e) que je trouverai en votre sein le cadre propice à mon développement.`,
    `Votre entreprise, ${entreprise}, incarne les valeurs d'excellence, de rigueur et d'innovation qui guident ma propre vision du travail. Votre position de leader et votre capacité à vous adapter aux enjeux actuels du marché ivoirien font de vous un employeur de référence auprès duquel je souhaite sincèrement contribuer.`,
  ];

  const paragraphesMoi: string[] = [
    `Fort(e) de ma formation et de mon parcours professionnel, je possède les compétences techniques et relationnelles requises pour ce poste. Mon sens de l'organisation, ma rigueur et ma capacité d'adaptation m'ont permis de mener différentes missions avec succès. Je suis par ailleurs reconnu(e) pour mon esprit d'équipe et ma capacité à travailler efficacement tout en maintenant un haut niveau de qualité.`,
    `Au fil de mon parcours, j'ai développé une solide expertise me permettant de gérer avec efficacité des projets complexes et de collaborer avec des équipes pluridisciplinaires. Ma capacité à identifier rapidement les enjeux, à proposer des solutions créatives et à les mettre en œuvre constitue un atout majeur que je souhaite mettre au service de ${entreprise}.`,
    `Doté(e) d'une solide formation académique complétée par une expérience terrain, je maîtrise les outils et méthodes indispensables à l'exercice de ce poste. Mon sens des responsabilités, ma curiosité intellectuelle et ma volonté de produire un travail de qualité font de moi un(e) collaborateur(trice) fiable et investi(e) dans chacune de ses missions.`,
  ];

  const paragraphesNous: string[] = [
    `Persuadé(e) que mon profil correspond aux attentes du poste${poste ? ` de ${poste}` : ""} et que mon intégration au sein de ${entreprise} serait mutuellement enrichissante, je reste disponible pour un entretien à votre convenance. Je me tiens à votre entière disposition pour vous apporter tout renseignement complémentaire que vous jugerez utile.`,
    `Convaincu(e) que mon expérience et mes compétences constituent des atouts précieux pour ${entreprise}, je suis prêt(e) à mettre tout mon potentiel au service de votre équipe. Dans l'espoir que ma candidature retiendra votre attention, je reste disponible à tout moment pour un entretien afin de vous exposer plus en détail mes motivations.`,
    `Je suis certain(e) que ma capacité à m'investir pleinement et à délivrer des résultats concrets saura répondre aux exigences de ${entreprise}. C'est avec enthousiasme et détermination que j'espère rejoindre votre structure et contribuer, dès mon intégration, à vos objectifs de développement.`,
  ];

  return {
    accroche: pick(accroches, seed),
    paragrapheVous: pick(paragraphesVous, seed + 1),
    paragrapheMoi: pick(paragraphesMoi, seed + 2),
    paragrapheNous: pick(paragraphesNous, seed + 3),
  };
}

/* ─── CV — Profil ─────────────────────────────────────────── */

export interface CVProfileGenInput {
  nom: string;
  titre: string;
  lieuResidence?: string;
  nationalite?: string;
  experiences: Array<{ poste: string; entreprise: string; dateDebut: string; dateFin: string; actuel: boolean }>;
  formations: Array<{ diplome: string; etablissement: string; annee: string }>;
  competences: Array<{ nom: string; niveau: string }>;
}

export function generateCVProfile(data: CVProfileGenInput): string {
  const seed = nameSeed(data.nom + (data.titre || ""));
  const yearsExp = calculateYearsExp(data.experiences ?? []);
  const topSkills = (data.competences ?? []).slice(0, 3).map((c) => c.nom).filter(Boolean);
  const latestFormation = (data.formations ?? []).find((f) => f.diplome);
  const currentJob = (data.experiences ?? []).find((e) => e.actuel);
  const lieu = data.lieuResidence || "Côte d'Ivoire";

  let profile = "";

  // Accroche
  if (data.titre) {
    profile += `Professionnel(le) spécialisé(e) en ${data.titre}`;
  } else {
    profile += "Professionnel(le) polyvalent(e)";
  }

  if (yearsExp > 0) {
    profile += `, fort(e) de ${yearsExp} année${yearsExp > 1 ? "s" : ""} d'expérience`;
  }
  profile += `, basé(e) à ${lieu}. `;

  // Poste actuel
  if (currentJob?.entreprise) {
    profile += `Actuellement ${currentJob.poste ? `en poste en tant que ${currentJob.poste} ` : ""}chez ${currentJob.entreprise}. `;
  }

  // Compétences clés
  if (topSkills.length > 0) {
    profile += `Maîtrise de ${topSkills.join(", ")}. `;
  }

  // Formation
  if (latestFormation?.diplome) {
    profile += `Titulaire d'un ${latestFormation.diplome}`;
    if (latestFormation.etablissement) profile += ` (${latestFormation.etablissement})`;
    profile += ". ";
  }

  // Closing
  const closings = [
    `Rigoureux(se) et orienté(e) résultats, je cherche à mettre mes compétences au service d'une structure ambitieuse en Côte d'Ivoire.`,
    `Dynamique, organisé(e) et passionné(e), je suis prêt(e) à relever de nouveaux défis et à contribuer activement à la croissance de mon prochain employeur.`,
    `Doté(e) d'un excellent sens relationnel et d'une forte capacité d'adaptation, je m'engage pleinement dans chaque mission pour produire des résultats concrets et durables.`,
  ];

  profile += pick(closings, seed);
  return profile;
}

/* ─── Contrat de prestation — Obligations ─────────────────── */

export interface ContratObligationsGenInput {
  titrePrestation: string;
  descriptionPrestation?: string;
  lieuExecution?: string;
}

export function generateContratObligations(data: ContratObligationsGenInput): {
  obligationsPrestataire: string;
  obligationsClient: string;
} {
  const titre = data.titrePrestation || "la prestation convenue";

  const obligationsPrestataire =
    `Le Prestataire s'engage à :\n` +
    `- Exécuter "${titre}" avec professionnalisme, diligence et selon les règles de l'art\n` +
    `- Respecter scrupuleusement les délais et le calendrier convenus au présent contrat\n` +
    `- Informer le Client, sans délai, de toute difficulté susceptible d'affecter la qualité ou les délais d'exécution\n` +
    `- Affecter les ressources humaines et techniques adéquates à la réalisation de la prestation\n` +
    `- Remettre des livrables conformes aux spécifications techniques et fonctionnelles convenues\n` +
    `- Maintenir la stricte confidentialité des informations, données et documents du Client\n` +
    `- Assurer un suivi régulier de l'avancement et communiquer proactivement tout élément pertinent`;

  const obligationsClient =
    `Le Client s'engage à :\n` +
    `- Fournir au Prestataire, en temps utile, toutes les informations, documents et accès nécessaires\n` +
    `- Régler les paiements selon les modalités et aux échéances fixées au présent contrat\n` +
    `- Valider les livrables dans un délai de 7 jours ouvrés à compter de leur remise ; passé ce délai, ils seront réputés acceptés\n` +
    `- Désigner un interlocuteur unique, disponible et habilité à prendre les décisions nécessaires au suivi\n` +
    `- Informer le Prestataire de tout changement susceptible d'affecter les conditions d'exécution\n` +
    `- S'abstenir de solliciter directement les collaborateurs du Prestataire sans accord préalable écrit`;

  return { obligationsPrestataire, obligationsClient };
}

/* ─── Contrat de travail — Description de tâches ──────────── */

export function generateTachesPoste(poste: string, categorie: string): string {
  const posteL = poste.toLowerCase();

  if (posteL.includes("commercial") || posteL.includes("vente")) {
    return "- Prospecter et fidéliser la clientèle sur le territoire assigné\n- Atteindre les objectifs de vente mensuels et annuels\n- Établir des devis et négocier les contrats commerciaux\n- Assurer le suivi des commandes et la satisfaction client\n- Rédiger des rapports d'activité hebdomadaires";
  }
  if (posteL.includes("comptable") || posteL.includes("comptabilité") || posteL.includes("finance")) {
    return "- Tenir la comptabilité générale et analytique de l'entreprise\n- Préparer les états financiers mensuels et annuels\n- Gérer la trésorerie et les rapprochements bancaires\n- Établir les déclarations fiscales (TVA, IS, IR)\n- Assurer les relations avec les prestataires et administrations financières";
  }
  if (posteL.includes("informatique") || posteL.includes("développeur") || posteL.includes("it")) {
    return "- Concevoir, développer et maintenir les applications informatiques de l'entreprise\n- Assurer la maintenance et l'évolution des systèmes existants\n- Rédiger la documentation technique des développements réalisés\n- Participer aux réunions de cadrage et de suivi de projets\n- Assurer une veille technologique continue";
  }
  if (posteL.includes("secrétaire") || posteL.includes("assistante") || posteL.includes("administratif")) {
    return "- Assurer la gestion administrative quotidienne du service\n- Rédiger et classer les courriers, emails et comptes-rendus\n- Gérer les agendas et organiser les réunions\n- Accueillir les visiteurs et gérer les appels téléphoniques\n- Assurer la relation avec les fournisseurs et partenaires";
  }

  return `- Exécuter les tâches inhérentes au poste de ${poste} conformément aux directives de la hiérarchie\n- Respecter les procédures internes et les normes de qualité\n- Participer activement aux réunions d'équipe et aux actions de formation\n- Rendre compte régulièrement de l'avancement de ses activités\n- Contribuer à l'amélioration continue des processus du service`;
}
