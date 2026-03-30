/**
 * 10 articles de démarrage SEO — DocuGest Ivoire
 * Rédigés en français, ciblant les entrepreneurs, étudiants et demandeurs d'emploi ivoiriens.
 */

export type SeedArticle = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  meta_title: string;
  meta_description: string;
  reading_time_min: number;
  published: boolean;
};

export const BLOG_SEED_ARTICLES: SeedArticle[] = [
  {
    slug: "creer-facture-professionnelle-cote-divoire",
    title: "Comment créer une facture professionnelle en Côte d'Ivoire",
    category: "Facturation",
    reading_time_min: 5,
    published: true,
    meta_title: "Créer une facture professionnelle en Côte d'Ivoire | DocuGest Ivoire",
    meta_description:
      "Guide complet pour créer une facture normalisée en FCFA conforme aux normes ivoiriennes. Mentions obligatoires, TVA, format PDF — tout ce qu'il faut savoir.",
    excerpt:
      "Vous venez de livrer une prestation ou de vendre un produit et vous devez facturer votre client. Voici tout ce qu'il faut savoir pour émettre une facture conforme en Côte d'Ivoire.",
    content: `<h2>Pourquoi la facture est-elle obligatoire en Côte d'Ivoire ?</h2>
<p>En Côte d'Ivoire, l'émission d'une facture est une <strong>obligation légale</strong> pour toute entreprise soumise à la TVA. Selon le Code général des Impôts, la facture est le justificatif comptable qui prouve une transaction commerciale entre un vendeur et un acheteur. Elle permet de déduire la TVA et constitue une preuve en cas de litige commercial.</p>

<h2>Les mentions obligatoires sur une facture normalisée</h2>
<p>Une facture conforme aux exigences de la Direction Générale des Impôts (DGI) doit obligatoirement contenir :</p>
<ul>
  <li><strong>Le numéro de facture</strong> — séquentiel et unique (ex. : FACT-2026-0001)</li>
  <li><strong>La date d'émission</strong> — au format JJ/MM/AAAA</li>
  <li><strong>Les coordonnées du vendeur</strong> — raison sociale, adresse, RCCM, NCC (Numéro Compte Contribuable), contacts</li>
  <li><strong>Les coordonnées de l'acheteur</strong> — nom/raison sociale, adresse</li>
  <li><strong>La description des biens ou services</strong> — désignation, quantité, unité</li>
  <li><strong>Les montants</strong> — prix unitaire HT, montant HT, taux de TVA (18 % en général), montant TTC</li>
  <li><strong>Le mode de paiement</strong> et les conditions (délai, pénalités)</li>
</ul>

<h2>Comprendre la TVA en Côte d'Ivoire</h2>
<p>Le taux de TVA standard est de <strong>18 %</strong> en Côte d'Ivoire. Certains secteurs bénéficient d'un taux réduit de 9 % (produits de première nécessité, agriculture). Les micro-entreprises sous le régime de l'impôt synthétique ne collectent pas la TVA.</p>
<blockquote>
  <strong>Astuce :</strong> Si vous êtes sous le régime de la Taxe Forfaitaire Unique (TFU) ou du régime Réel Simplifié avec un chiffre d'affaires annuel inférieur à 200 millions FCFA, renseignez-vous auprès de votre Centre des Impôts pour connaître vos obligations exactes.
</blockquote>

<h2>Les erreurs fréquentes à éviter</h2>
<ul>
  <li>Oublier le NCC (Numéro Compte Contribuable) — obligatoire pour les entreprises immatriculées</li>
  <li>Ne pas numéroter les factures de manière chronologique</li>
  <li>Facturer en devise étrangère sans mentionner l'équivalent en FCFA</li>
  <li>Oublier les pénalités de retard dans les conditions de règlement</li>
</ul>

<h2>Comment créer une facture gratuitement avec DocuGest Ivoire</h2>
<p>Sur <strong>DocuGest Ivoire</strong>, vous pouvez générer une facture normalisée en moins de 2 minutes, directement depuis votre navigateur :</p>
<ol>
  <li>Accédez au module <strong>Facture normalisée</strong> depuis le dashboard</li>
  <li>Renseignez les coordonnées de votre entreprise (sauvegardées automatiquement)</li>
  <li>Ajoutez les articles ou prestations dans le tableau dynamique</li>
  <li>Choisissez le taux de TVA applicable</li>
  <li>Téléchargez votre facture en <strong>PDF haute qualité</strong> prête à envoyer</li>
</ol>
<p>Toutes vos données sont sauvegardées localement pour que vous puissiez reprendre à tout moment.</p>

<h2>Conclusion</h2>
<p>Une facture bien rédigée protège votre entreprise, facilite votre comptabilité et renforce la confiance de vos clients. Avec DocuGest Ivoire, générez vos factures en FCFA, conformes aux normes ivoiriennes, gratuitement et sans inscription.</p>`,
  },

  {
    slug: "bulletin-de-paie-cote-divoire-guide-complet",
    title: "Bulletin de paie en Côte d'Ivoire : le guide complet",
    category: "Ressources humaines",
    reading_time_min: 6,
    published: true,
    meta_title: "Bulletin de paie en Côte d'Ivoire : tout savoir | DocuGest Ivoire",
    meta_description:
      "Guide complet sur le bulletin de paie ivoirien : cotisations CNPS, IS, ITS, calcul salaire net. Créez votre fiche de paie PDF gratuitement.",
    excerpt:
      "Le bulletin de paie est un document légal que tout employeur est tenu de remettre à ses salariés. Voici tout ce qu'il faut savoir sur les règles ivoiriennes.",
    content: `<h2>Le bulletin de paie, une obligation légale en Côte d'Ivoire</h2>
<p>Selon le <strong>Code du Travail ivoirien (Loi n°2015-532)</strong>, tout employeur est tenu de remettre à chaque salarié, lors du paiement de sa rémunération, un bulletin de paie (aussi appelé fiche de paie). Ce document atteste du montant versé, des cotisations prélevées et constitue une preuve légale en cas de litige.</p>

<h2>Les éléments obligatoires du bulletin de paie</h2>
<ul>
  <li><strong>Identification de l'employeur</strong> : raison sociale, adresse, numéro CNPS employeur</li>
  <li><strong>Identification du salarié</strong> : nom, prénom, numéro CNPS salarié, poste, catégorie professionnelle</li>
  <li><strong>Période de paie</strong> et date de paiement</li>
  <li><strong>Salaire de base</strong> et éléments variables (primes, indemnités)</li>
  <li><strong>Cotisations salariales</strong> déduites et <strong>cotisations patronales</strong></li>
  <li><strong>Salaire net à payer</strong></li>
</ul>

<h2>Les cotisations sociales en Côte d'Ivoire</h2>
<p>Le système de protection sociale ivoirien repose sur deux organismes principaux : la <strong>CNPS</strong> (Caisse Nationale de Prévoyance Sociale) et le régime fiscal.</p>

<h3>Cotisations CNPS</h3>
<ul>
  <li><strong>Retraite salarié</strong> : 3,2 % du salaire brut plafonné</li>
  <li><strong>Retraite employeur</strong> : 7,7 % du salaire brut plafonné</li>
  <li><strong>Prestations familiales (employeur)</strong> : 5,75 % du salaire brut</li>
  <li><strong>Accidents du travail (employeur)</strong> : 2 % à 5 % selon le secteur</li>
</ul>

<h3>Impôts sur les salaires</h3>
<ul>
  <li><strong>ITS (Impôt sur les Traitements et Salaires)</strong> : barème progressif de 1,5 % à 60 %</li>
  <li><strong>IS (Impôt sur le Salaire)</strong> : 1,2 % côté salarié, 2,8 % côté employeur</li>
</ul>

<h2>Calcul du salaire net : la méthode simple</h2>
<p>La formule de calcul simplifiée :</p>
<ol>
  <li><strong>Salaire brut</strong> = Salaire de base + Primes + Indemnités</li>
  <li><strong>Retenues salariales</strong> = CNPS retraite (3,2 %) + IS (1,2 %) + ITS (selon barème)</li>
  <li><strong>Salaire net à payer</strong> = Salaire brut − Retenues salariales</li>
</ol>
<blockquote>
  <strong>Exemple :</strong> Pour un salaire de base de 200 000 FCFA, les retenues salariales se situent généralement entre 8 % et 15 % selon le niveau de rémunération et la situation familiale.
</blockquote>

<h2>Créer un bulletin de paie avec DocuGest Ivoire</h2>
<p>Le module <strong>Bulletin de paie</strong> de DocuGest Ivoire calcule automatiquement les cotisations CNPS, l'ITS et l'IS selon les barèmes ivoiriens. Il génère un PDF professionnel avec toutes les mentions légales obligatoires.</p>
<p>Résultat : vous n'avez plus besoin d'un logiciel de paie coûteux pour des petites structures. En moins de 3 minutes, votre bulletin de paie est prêt à être remis à votre employé.</p>

<h2>Conclusion</h2>
<p>Le bulletin de paie est bien plus qu'une simple formalité — c'est un document qui protège à la fois l'employé et l'employeur. DocuGest Ivoire vous accompagne pour le créer facilement, gratuitement, en respectant les normes ivoiriennes.</p>`,
  },

  {
    slug: "cv-professionnel-cote-divoire",
    title: "CV professionnel en Côte d'Ivoire : le guide pour décrocher un emploi",
    category: "Emploi",
    reading_time_min: 6,
    published: true,
    meta_title: "CV Professionnel Côte d'Ivoire : modèle et conseils | DocuGest Ivoire",
    meta_description:
      "Comment créer un CV professionnel qui attire les recruteurs ivoiriens. Modèles gratuits, conseils pratiques pour l'emploi en Côte d'Ivoire.",
    excerpt:
      "En Côte d'Ivoire, le marché du travail est compétitif. Un CV bien structuré peut faire la différence. Voici comment rédiger un CV professionnel qui attire les recruteurs.",
    content: `<h2>Pourquoi un CV professionnel est essentiel en Côte d'Ivoire</h2>
<p>Avec plus de 400 000 jeunes entrant sur le marché du travail chaque année en Côte d'Ivoire, la concurrence est réelle. Un recruteur passe en moyenne <strong>moins de 30 secondes</strong> à lire un CV. La première impression est donc cruciale. Un CV bien structuré, lisible et sans fautes peut littéralement changer le cours de votre carrière.</p>

<h2>La structure idéale d'un CV pour le marché ivoirien</h2>
<p>Contrairement à certains pays anglophones où le CV peut se limiter à une page, en Côte d'Ivoire (suivant les standards français), un CV de 1 à 2 pages est accepté selon votre niveau d'expérience.</p>

<h3>1. L'en-tête : votre carte de visite</h3>
<ul>
  <li>Photo professionnelle (recommandée pour le marché ivoirien)</li>
  <li>Nom complet, titre professionnel recherché</li>
  <li>Téléphone format +225 XX XX XX XX XX</li>
  <li>Email professionnel, LinkedIn (si disponible)</li>
  <li>Lieu de résidence (ex. : Cocody, Abidjan)</li>
</ul>

<h3>2. Le profil / résumé professionnel</h3>
<p>C'est le <strong>paragraphe le plus important</strong> de votre CV. En 3 à 5 lignes, il doit répondre à la question : "Qui êtes-vous et que pouvez-vous apporter à cette entreprise ?"</p>
<blockquote>
  <strong>Exemple :</strong> "Comptable diplômé de l'Université de Cocody avec 4 ans d'expérience en PME ivoiriennes. Spécialisé dans la gestion des déclarations fiscales, la paie et la tenue des comptes. À la recherche d'un poste de comptable senior dans une structure en croissance."
</blockquote>

<h3>3. Les expériences professionnelles</h3>
<p>Listez vos expériences <strong>du plus récent au plus ancien</strong>. Pour chaque poste :</p>
<ul>
  <li>Intitulé du poste — Nom de l'entreprise (Localisation)</li>
  <li>Dates (mois/année)</li>
  <li>3 à 5 missions/réalisations concrètes avec des résultats chiffrés si possible</li>
</ul>

<h3>4. Les formations</h3>
<p>Mentionnez votre diplôme le plus élevé en premier. Les établissements ivoiriens bien connus (INPHB Yamoussoukro, UFHB Cocody, PIGIER, ESP, ISTC Polytechnique…) sont des atouts à mettre en avant.</p>

<h3>5. Les compétences</h3>
<p>Divisez en compétences techniques (logiciels, langages) et compétences transversales (communication, gestion de projet). Indiquez le niveau pour chaque compétence.</p>

<h3>6. Les langues</h3>
<p>Le français est indispensable. L'anglais est un réel atout dans les multinationales. Les langues locales (Dioula, Baoulé, Bété…) peuvent être mentionnées.</p>

<h2>Les erreurs à éviter</h2>
<ul>
  <li>Un CV de plus de 2 pages pour un profil junior</li>
  <li>Une photo de mauvaise qualité ou non professionnelle</li>
  <li>Lister ses responsabilités sans mentionner ses réalisations concrètes</li>
  <li>Utiliser une adresse email non professionnelle (ex. : "bestboy2000@...") </li>
  <li>Oublier de vérifier l'orthographe</li>
</ul>

<h2>Créer votre CV gratuitement avec DocuGest Ivoire</h2>
<p>Le module <strong>CV Professionnel</strong> de DocuGest Ivoire propose 3 templates modernes (Classique, Moderne, Compact) avec upload de photo, gestion des compétences avec barres de progression, et génération PDF en 1 clic. Vos données sont sauvegardées localement pour une reprise facile.</p>`,
  },

  {
    slug: "lettre-de-motivation-cote-divoire",
    title: "Lettre de motivation percutante : le guide pour les candidats ivoiriens",
    category: "Emploi",
    reading_time_min: 5,
    published: true,
    meta_title: "Lettre de motivation Côte d'Ivoire : modèle et conseils | DocuGest Ivoire",
    meta_description:
      "Comment rédiger une lettre de motivation efficace pour trouver un emploi en Côte d'Ivoire. Structure, exemples et modèle PDF gratuit.",
    excerpt:
      "La lettre de motivation reste un passage obligé pour décrocher un entretien en Côte d'Ivoire. Voici comment rédiger une lettre qui convainc vraiment les recruteurs.",
    content: `<h2>La lettre de motivation : un atout souvent sous-estimé</h2>
<p>Beaucoup de candidats traitent la lettre de motivation comme une formalité. C'est une erreur. Pour un recruteur ivoirien, une lettre bien rédigée montre votre <strong>motivation réelle, votre maîtrise du français écrit</strong> et votre capacité à vous projeter dans le poste. C'est souvent ce qui fait la différence entre deux candidats aux profils similaires.</p>

<h2>La structure en 4 paragraphes</h2>
<p>La méthode la plus efficace est le plan en 4 paragraphes, connu sous le nom de structure <strong>Vous — Moi — Nous</strong> (avec une accroche initiale).</p>

<h3>Paragraphe 1 : L'accroche</h3>
<p>Ne commencez <strong>jamais</strong> par "Je me permets de vous soumettre ma candidature". Commencez par quelque chose qui capte l'attention :</p>
<blockquote>
  "C'est avec un vif intérêt que j'ai découvert votre offre pour le poste de [Poste]. La réputation de [Entreprise] dans le secteur [Secteur] et son engagement pour [Valeur] m'ont immédiatement convaincu que nos ambitions sont alignées."
</blockquote>

<h3>Paragraphe 2 : Vous (l'entreprise)</h3>
<p>Montrez que vous connaissez l'entreprise. Mentionnez un projet récent, un produit, une valeur qui vous a marqué. Les recruteurs ivoiriens apprécient qu'on ait fait des recherches.</p>

<h3>Paragraphe 3 : Moi (vos compétences)</h3>
<p>Présentez 2 à 3 compétences clés en lien direct avec le poste. Illustrez par des exemples concrets :</p>
<blockquote>
  "Fort de 3 ans d'expérience en gestion commerciale chez [Ancienne Entreprise], j'ai contribué à augmenter le chiffre d'affaires de 25 % en développant un portefeuille de 40 clients B2B."
</blockquote>

<h3>Paragraphe 4 : Nous (la projection)</h3>
<p>Terminez en vous projetant dans le poste et en proposant un entretien :</p>
<blockquote>
  "Je suis convaincu que mon expertise en [Domaine] représente un apport réel pour [Entreprise]. Je serais heureux de vous exposer mes motivations lors d'un entretien à votre convenance."
</blockquote>

<h2>Les formules de politesse adaptées</h2>
<p>En Côte d'Ivoire, les formules de politesse formelles sont appréciées :</p>
<ul>
  <li>"Veuillez agréer, Madame/Monsieur, l'expression de mes salutations distinguées."</li>
  <li>"Dans l'attente de votre retour favorable, je vous prie de croire, Madame/Monsieur, à l'assurance de ma considération distinguée."</li>
</ul>

<h2>Les erreurs classiques à éviter</h2>
<ul>
  <li>Répéter mot pour mot son CV dans la lettre</li>
  <li>Une lettre générique non personnalisée pour l'entreprise ciblée</li>
  <li>Dépasser 1 page</li>
  <li>Mentionner ses prétentions salariales sans qu'on vous les demande</li>
  <li>Des fautes d'orthographe (rédhibitoires !)</li>
</ul>

<h2>Générez votre lettre avec DocuGest Ivoire</h2>
<p>Le module <strong>Lettre de motivation</strong> de DocuGest Ivoire vous guide pas à pas avec des bulles d'aide pour chaque paragraphe. L'IA interne peut même générer une première version en quelques secondes à partir de votre poste cible et de l'entreprise. Résultat : une lettre professionnelle en PDF en moins de 5 minutes.</p>`,
  },

  {
    slug: "contrat-travail-cdd-cdi-cote-divoire",
    title: "Contrat de travail CDD/CDI en Côte d'Ivoire : ce que vous devez savoir",
    category: "Ressources humaines",
    reading_time_min: 7,
    published: true,
    meta_title: "Contrat de travail CDD/CDI Côte d'Ivoire | DocuGest Ivoire",
    meta_description:
      "Guide complet sur le contrat de travail en Côte d'Ivoire : différences CDD/CDI, période d'essai, salaire minimum, clauses obligatoires selon le Code du travail.",
    excerpt:
      "Employeur ou salarié, comprendre les bases du contrat de travail en Côte d'Ivoire est essentiel. Voici ce que dit le Code du travail ivoirien sur les CDD et CDI.",
    content: `<h2>Le cadre légal du travail en Côte d'Ivoire</h2>
<p>Le droit du travail ivoirien est régi par la <strong>Loi n°2015-532 du 20 juillet 2015</strong> portant Code du Travail. Ce texte définit les droits et obligations des employeurs et des salariés, les types de contrats, les conditions de rupture et les indemnités.</p>

<h2>CDD vs CDI : quelle différence ?</h2>
<h3>Le Contrat à Durée Déterminée (CDD)</h3>
<p>Le CDD est un contrat <strong>limité dans le temps</strong>. En Côte d'Ivoire, il est réglementé de manière stricte :</p>
<ul>
  <li>Durée maximale : 2 ans (renouvellements inclus)</li>
  <li>Motifs légaux : remplacement d'un salarié absent, accroissement temporaire d'activité, travail saisonnier</li>
  <li>À l'échéance normale, pas d'indemnité de licenciement mais le salarié a droit à une indemnité de précarité dans certains cas</li>
</ul>

<h3>Le Contrat à Durée Indéterminée (CDI)</h3>
<p>Le CDI est la <strong>forme normale et générale</strong> de la relation de travail. Il n'a pas de terme fixé et offre plus de sécurité au salarié. Sa rupture est encadrée par le Code du Travail.</p>

<h2>La période d'essai</h2>
<p>Tout contrat peut commencer par une période d'essai, renouvelable une fois :</p>
<ul>
  <li><strong>Ouvriers et employés</strong> : 1 mois renouvelable</li>
  <li><strong>Agents de maîtrise</strong> : 2 mois renouvelables</li>
  <li><strong>Cadres</strong> : 3 mois renouvelables</li>
  <li><strong>Cadres supérieurs</strong> : 4 mois renouvelables</li>
</ul>

<h2>Le SMIG en Côte d'Ivoire</h2>
<p>Le Salaire Minimum Interprofessionnel Garanti (SMIG) en Côte d'Ivoire est fixé par décret. Il est actuellement de <strong>75 000 FCFA brut par mois</strong>. Tout employeur est tenu de le respecter, quelle que soit la taille de l'entreprise.</p>

<h2>Les mentions obligatoires dans un contrat de travail</h2>
<ul>
  <li>Identité des parties (employeur et salarié)</li>
  <li>Nature du contrat (CDD ou CDI)</li>
  <li>Poste occupé et classification professionnelle</li>
  <li>Lieu de travail</li>
  <li>Durée de la période d'essai</li>
  <li>Rémunération brute et ses composantes</li>
  <li>Horaires de travail</li>
  <li>Convention collective applicable</li>
</ul>

<h2>Les droits aux congés</h2>
<p>Selon le Code du Travail ivoirien, tout salarié a droit à <strong>26 jours ouvrables de congés payés</strong> par an (soit 2,17 jours par mois de travail). Ce droit est acquis après 12 mois de service continu.</p>

<h2>La rupture du contrat</h2>
<p>Pour un CDI, la rupture peut intervenir :</p>
<ul>
  <li>Par <strong>démission</strong> du salarié (avec préavis)</li>
  <li>Par <strong>licenciement</strong> par l'employeur (motif réel et sérieux obligatoire)</li>
  <li>Par <strong>rupture conventionnelle</strong> (accord mutuel)</li>
</ul>
<p>Le préavis légal varie de 1 mois (ouvriers) à 3 mois (cadres) pour un CDI.</p>

<h2>Générez votre contrat de travail avec DocuGest Ivoire</h2>
<p>Le module <strong>Contrat de travail</strong> de DocuGest Ivoire génère des contrats CDD/CDI conformes au Code du Travail ivoirien, avec toutes les mentions légales obligatoires, les clauses de confidentialité optionnelles et les blocs de signatures. Résultat : un contrat professionnel en PDF prêt à signer.</p>`,
  },

  {
    slug: "bon-de-commande-entreprise-cote-divoire",
    title: "Bon de commande : pourquoi c'est indispensable pour votre entreprise",
    category: "Facturation",
    reading_time_min: 4,
    published: true,
    meta_title: "Bon de commande professionnel en FCFA | DocuGest Ivoire",
    meta_description:
      "Tout savoir sur le bon de commande en Côte d'Ivoire : définition, mentions obligatoires, différence avec la facture. Créez votre BC en FCFA gratuitement.",
    excerpt:
      "Le bon de commande est souvent négligé par les PME ivoiriennes. Pourtant, c'est un document clé pour sécuriser vos transactions et éviter les litiges commerciaux.",
    content: `<h2>Qu'est-ce qu'un bon de commande ?</h2>
<p>Le bon de commande (BC) est un document commercial émis par l'<strong>acheteur</strong> pour confirmer officiellement une commande auprès d'un fournisseur. Il précise la nature des biens ou services commandés, les quantités, les prix et les conditions de livraison et de paiement.</p>
<p>Contrairement à la facture qui intervient après la livraison, le bon de commande intervient <strong>avant</strong>. Il formalise l'accord entre les deux parties et crée une obligation contractuelle.</p>

<h2>Pourquoi utiliser un bon de commande ?</h2>
<h3>1. Prévenir les litiges</h3>
<p>Sans BC, un désaccord sur les quantités, le prix ou les délais peut rapidement devenir un litige coûteux. Le BC signé par les deux parties constitue une preuve irréfutable de l'accord initial.</p>

<h3>2. Améliorer la gestion interne</h3>
<p>Le BC permet à votre service comptable de prévoir les dépenses, à votre magasin d'anticiper les réceptions, et à votre direction de contrôler les achats.</p>

<h3>3. Professionnaliser votre image</h3>
<p>Les grandes entreprises et les organismes publics en Côte d'Ivoire <strong>exigent systématiquement un bon de commande</strong> avant toute livraison. Utiliser des BC professionnels renforce votre crédibilité.</p>

<h2>Les mentions essentielles d'un bon de commande</h2>
<ul>
  <li>Numéro du BC (ex. : BC-2026-0001) — pour le suivi et l'archivage</li>
  <li>Date d'émission</li>
  <li>Coordonnées de l'acheteur (RCCM, NCC, adresse, contact)</li>
  <li>Coordonnées du fournisseur</li>
  <li>Tableau des articles : désignation, référence, quantité, unité, prix unitaire HT, montant HT</li>
  <li>Total HT, remise, TVA, Total TTC</li>
  <li>Conditions de livraison et délais</li>
  <li>Mode et conditions de paiement</li>
  <li>Signature du responsable des achats</li>
</ul>

<h2>Bon de commande vs Facture proforma : quelle différence ?</h2>
<p>Ces deux documents sont complémentaires :</p>
<ul>
  <li>La <strong>facture proforma</strong> est émise par le <strong>vendeur</strong> pour proposer ses prix — c'est une offre commerciale non définitive</li>
  <li>Le <strong>bon de commande</strong> est émis par l'<strong>acheteur</strong> pour accepter et confirmer la commande — c'est un engagement d'achat</li>
</ul>

<h2>Créez votre bon de commande avec DocuGest Ivoire</h2>
<p>Le module <strong>Bon de commande</strong> de DocuGest Ivoire génère automatiquement un numéro de BC (BC-2026-XXXX), calcule les montants HT, la TVA et le TTC, et produit un PDF professionnel en FCFA prêt à transmettre à votre fournisseur.</p>`,
  },

  {
    slug: "facture-proforma-cote-divoire",
    title: "Facture proforma : la clé pour décrocher vos marchés en Côte d'Ivoire",
    category: "Facturation",
    reading_time_min: 4,
    published: true,
    meta_title: "Facture proforma gratuite en FCFA - Côte d'Ivoire | DocuGest Ivoire",
    meta_description:
      "Comprendre la facture proforma : définition, utilité, différence avec la facture définitive. Créez votre proforma en FCFA en 2 minutes sur DocuGest Ivoire.",
    excerpt:
      "La facture proforma est l'outil numéro 1 pour décrocher des marchés et rassurer vos clients avant de finaliser une vente. Voici comment l'utiliser efficacement.",
    content: `<h2>Qu'est-ce qu'une facture proforma ?</h2>
<p>La facture proforma (du latin "pro forma" = "pour la forme") est un <strong>document commercial préliminaire</strong> qui ressemble à une facture définitive mais n'a pas de valeur comptable. C'est essentiellement une <strong>offre de prix détaillée</strong> que le vendeur adresse à un client potentiel avant que la transaction ne soit finalisée.</p>

<h2>À quoi sert la facture proforma ?</h2>
<h3>1. Proposer un devis formel</h3>
<p>La proforma permet à un vendeur de présenter ses prix de manière professionnelle et détaillée, sans que cela ne constitue encore une créance comptable.</p>

<h3>2. Faciliter les démarches administratives</h3>
<p>En Côte d'Ivoire, de nombreuses entreprises et organismes publics demandent des factures proformas dans le cadre des procédures d'appel d'offres ou pour obtenir des autorisations d'importation.</p>

<h3>3. Rassurer le client avant le paiement d'un acompte</h3>
<p>Avant de verser un acompte, un client veut souvent avoir une vision claire de ce qu'il va acheter. La proforma lui donne une vision détaillée de la transaction à venir.</p>

<h3>4. Servir de base à la facture définitive</h3>
<p>Une fois la commande confirmée et livrée, la facture proforma se transforme en facture définitive. Elle garantit la cohérence entre ce qui a été commandé et ce qui est facturé.</p>

<h2>Facture proforma vs Facture définitive : les différences</h2>
<ul>
  <li><strong>Proforma</strong> : pas de valeur comptable, pas de numéro chronologique obligatoire, ne génère pas d'écriture comptable, mention "PROFORMA" obligatoire</li>
  <li><strong>Facture définitive</strong> : valeur comptable et fiscale, numérotation chronologique obligatoire, génère la TVA collectée, constitue une créance exigible</li>
</ul>

<h2>Les mentions indispensables d'une facture proforma</h2>
<ul>
  <li>La mention "<strong>FACTURE PROFORMA</strong>" ou "<strong>PRO FORMA INVOICE</strong>" bien visible</li>
  <li>Un numéro de référence (ex. : PRO-2026-0001)</li>
  <li>Date de validité de l'offre (généralement 15 à 30 jours)</li>
  <li>Coordonnées vendeur et acheteur</li>
  <li>Détail des produits/services avec prix en FCFA</li>
  <li>Conditions de paiement et de livraison</li>
</ul>

<h2>Créez votre facture proforma avec DocuGest Ivoire</h2>
<p>Le module <strong>Facture proforma</strong> de DocuGest Ivoire génère des proformas professionnelles en FCFA avec la mention "PROFORMA" bien visible, une date de validité et toutes les informations nécessaires. Envoyez votre proforma à votre client en PDF en moins de 2 minutes.</p>`,
  },

  {
    slug: "contrat-prestation-services-freelance-cote-divoire",
    title: "Contrat de prestation de services : protégez votre activité freelance en CI",
    category: "Juridique",
    reading_time_min: 6,
    published: true,
    meta_title: "Contrat prestation de services freelance Côte d'Ivoire | DocuGest Ivoire",
    meta_description:
      "Comment rédiger un contrat de prestation de services solide pour protéger votre activité freelance en Côte d'Ivoire. Clauses essentielles, pièges à éviter.",
    excerpt:
      "Prestataire indépendant ou freelance en Côte d'Ivoire ? Un contrat de prestation bien rédigé est votre meilleure protection contre les impayés et les litiges.",
    content: `<h2>Pourquoi un contrat de prestation est indispensable</h2>
<p>Trop de prestataires indépendants en Côte d'Ivoire travaillent encore sur une simple parole ou un échange WhatsApp. Les conséquences peuvent être désastreuses : prestations non payées, scope creep (élargissement du périmètre sans compensation), litiges sans recours légal. Un <strong>contrat de prestation de services</strong> bien rédigé vous protège sur tous ces points.</p>

<h2>Les éléments clés d'un contrat de prestation solide</h2>

<h3>1. L'objet précis du contrat</h3>
<p>Décrivez avec précision ce que vous vous engagez à réaliser. Plus c'est précis, moins il y a de risque de désaccord sur ce qui est inclus ou non dans la prestation.</p>
<blockquote>
  <strong>Mauvais exemple :</strong> "Création d'un site web"<br/>
  <strong>Bon exemple :</strong> "Développement d'un site web vitrine en 5 pages (Accueil, À propos, Services, Portfolio, Contact), responsive mobile, avec formulaire de contact, hébergé et livré en 30 jours."
</blockquote>

<h3>2. La durée et les délais</h3>
<p>Fixez une date de début, une date de fin prévisionnelle et des jalons intermédiaires si nécessaire. Précisez les conditions de renouvellement.</p>

<h3>3. Les conditions financières</h3>
<p>Mentionnez explicitement :</p>
<ul>
  <li>Le montant total HT et TTC en FCFA</li>
  <li>L'échéancier de paiement (ex. : 30 % à la signature, 40 % au livrable intermédiaire, 30 % à la livraison finale)</li>
  <li>Les pénalités de retard</li>
  <li>Le mode de paiement accepté</li>
</ul>

<h3>4. La clause de confidentialité</h3>
<p>Si vous avez accès à des informations sensibles (base de données clients, stratégie commerciale, données financières), une clause de confidentialité est indispensable — pour vous protéger et rassurer votre client.</p>

<h3>5. La clause de résiliation</h3>
<p>Définissez les conditions dans lesquelles chaque partie peut résilier le contrat, ainsi que les indemnités dues en cas de résiliation anticipée.</p>

<h3>6. La juridiction compétente</h3>
<p>En cas de litige, quel tribunal est compétent ? En Côte d'Ivoire, indiquez le <strong>Tribunal de Commerce d'Abidjan</strong> pour les litiges commerciaux.</p>

<h2>Les pièges classiques à éviter</h2>
<ul>
  <li>Ne pas définir le nombre de révisions incluses (et leur coût au-delà)</li>
  <li>Oublier de préciser qui est propriétaire des livrables (droits de propriété intellectuelle)</li>
  <li>Ne pas prévoir de clause en cas de retard du client dans la fourniture des éléments nécessaires</li>
  <li>Commencer à travailler sans signature du contrat</li>
</ul>

<h2>Générez votre contrat avec DocuGest Ivoire</h2>
<p>Le module <strong>Contrat de prestation de services</strong> de DocuGest Ivoire génère un contrat professionnel en PDF avec toutes les clauses essentielles, conforme aux pratiques juridiques ivoiriennes. Le contrat inclut automatiquement la clause de confidentialité, les obligations des parties (générables par IA) et le bloc de double signature "Lu et approuvé".</p>`,
  },

  {
    slug: "documents-indispensables-creer-entreprise-cote-divoire",
    title: "5 documents indispensables pour créer son entreprise en Côte d'Ivoire",
    category: "Entrepreneuriat",
    reading_time_min: 5,
    published: true,
    meta_title: "Créer une entreprise en Côte d'Ivoire : les documents clés | DocuGest Ivoire",
    meta_description:
      "Quels documents sont nécessaires pour créer une entreprise en Côte d'Ivoire ? RCCM, NCC, CNPS, statuts... Le guide complet pour les entrepreneurs ivoiriens.",
    excerpt:
      "Créer son entreprise en Côte d'Ivoire, c'est plus simple qu'on ne le pense avec les bons outils. Voici les 5 documents administratifs incontournables pour démarrer légalement.",
    content: `<h2>L'entrepreneuriat en Côte d'Ivoire : un secteur en plein essor</h2>
<p>Avec un taux de croissance économique parmi les plus élevés d'Afrique de l'Ouest (autour de 7 % par an), la Côte d'Ivoire attire de plus en plus d'entrepreneurs. Le Centre de Promotion des Investissements (CEPICI) a simplifié les procédures de création d'entreprise, permettant aujourd'hui de créer une société en <strong>moins de 24 heures</strong> pour certaines formes juridiques.</p>

<h2>Document 1 : Le RCCM (Registre du Commerce et du Crédit Mobilier)</h2>
<p>Le RCCM est votre <strong>carte d'identité commerciale</strong>. Il atteste que votre entreprise est légalement enregistrée et vous donne le droit d'exercer une activité commerciale en Côte d'Ivoire.</p>
<p><strong>Où l'obtenir ?</strong> Au Tribunal de Commerce d'Abidjan ou via le CEPICI (guichet unique). Le numéro RCCM a un format du type : CI-ABJ-XXXX-X-XXXXXXX.</p>

<h2>Document 2 : Le NCC (Numéro Compte Contribuable)</h2>
<p>Le NCC est attribué par la <strong>Direction Générale des Impôts (DGI)</strong>. Il permet d'identifier votre entreprise fiscalement et est obligatoire pour toute facturation avec TVA.</p>
<p><strong>Format :</strong> une combinaison de lettres et de chiffres unique à votre entreprise. Depuis 2023, il tend à être remplacé ou complété par le <strong>Numéro de Contribuable Unifié</strong>.</p>

<h2>Document 3 : Le numéro CNPS employeur</h2>
<p>Dès que vous employez des salariés, vous devez vous immatriculer à la <strong>Caisse Nationale de Prévoyance Sociale (CNPS)</strong>. Ce numéro vous permettra de déclarer vos cotisations sociales (retraite, prestations familiales, accidents du travail).</p>

<h2>Document 4 : Les statuts de la société (pour SARL, SA, SAS)</h2>
<p>Si vous créez une société commerciale (SARL, SA, SAS), vous devez rédiger des <strong>statuts</strong> qui définissent les règles de fonctionnement de votre entreprise : objet social, capital, associés, gérance, répartition des bénéfices. Ces statuts doivent être notariés ou enregistrés.</p>

<h2>Document 5 : L'autorisation d'exercer (secteurs réglementés)</h2>
<p>Certains secteurs nécessitent des autorisations spécifiques :</p>
<ul>
  <li><strong>BTP</strong> : agrément du Ministère de la Construction</li>
  <li><strong>Santé</strong> : autorisation du Ministère de la Santé</li>
  <li><strong>Transport</strong> : agrément du Ministère des Transports</li>
  <li><strong>Finances / Microfinance</strong> : agrément de la BCEAO</li>
</ul>

<h2>Après la création : les documents du quotidien</h2>
<p>Une fois votre entreprise créée, vous aurez besoin de produire régulièrement des documents commerciaux et administratifs :</p>
<ul>
  <li>Factures normalisées pour chaque vente</li>
  <li>Bulletins de paie pour chaque salarié</li>
  <li>Déclarations fiscales mensuelles ou trimestrielles</li>
  <li>Contrats de travail pour vos employés</li>
</ul>
<p><strong>DocuGest Ivoire</strong> vous accompagne pour tous ces documents du quotidien, gratuitement et en ligne.</p>`,
  },

  {
    slug: "digitalisation-pme-cote-divoire-outils-gratuits",
    title: "Digitalisation des PME ivoiriennes : les outils gratuits pour moderniser votre gestion",
    category: "Entrepreneuriat",
    reading_time_min: 5,
    published: true,
    meta_title: "Digitalisation PME Côte d'Ivoire : outils gratuits | DocuGest Ivoire",
    meta_description:
      "Comment les PME ivoiriennes peuvent se digitaliser sans gros budget ? Découvrez les meilleurs outils gratuits pour gérer vos documents, finances et équipes en 2026.",
    excerpt:
      "La transformation digitale n'est plus réservée aux grandes entreprises. En 2026, les PME ivoiriennes ont accès à des outils gratuits et puissants pour moderniser leur gestion.",
    content: `<h2>La digitalisation, une opportunité pour les PME ivoiriennes</h2>
<p>En Côte d'Ivoire, les PME représentent plus de 95 % du tissu économique. Pourtant, beaucoup utilisent encore des cahiers, des dossiers papier et des tableaux Excel basiques pour gérer leur activité. La digitalisation n'est pas qu'une tendance : c'est un <strong>levier de croissance</strong> qui permet de gagner du temps, de réduire les erreurs et de professionnaliser son image.</p>
<p>La bonne nouvelle : en 2026, de nombreux outils sont accessibles <strong>gratuitement</strong> sur Internet.</p>

<h2>1. La gestion des documents commerciaux</h2>
<p><strong>DocuGest Ivoire</strong> est la solution de référence pour les entrepreneurs ivoiriens. Créez gratuitement vos factures, devis, bulletins de paie, contrats et bien plus, directement depuis votre navigateur, sans installation. Vos documents sont conformes aux normes ivoiriennes (FCFA, TVA 18 %, Code du travail).</p>
<p><strong>Avantages :</strong> 100 % gratuit, en français, 11 types de documents, génération PDF en 1 clic, données sauvegardées localement.</p>

<h2>2. La communication et la messagerie</h2>
<ul>
  <li><strong>WhatsApp Business</strong> : indispensable en Côte d'Ivoire pour communiquer avec vos clients et fournisseurs. Le catalogue produits et les messages automatiques changent la donne.</li>
  <li><strong>Gmail / Google Workspace</strong> : une adresse email professionnelle (@votreentreprise.com) renforce votre crédibilité. Google Workspace propose une version gratuite.</li>
</ul>

<h2>3. La comptabilité simplifiée</h2>
<ul>
  <li><strong>Wave Accounting</strong> : logiciel de comptabilité gratuit très utilisé par les PME africaines. Permet de suivre les revenus, dépenses et de générer des rapports.</li>
  <li><strong>Google Sheets</strong> : pour des tableaux de bord simples, un budget prévisionnel ou un suivi de trésorerie.</li>
</ul>

<h2>4. La gestion de projets et des équipes</h2>
<ul>
  <li><strong>Trello</strong> : gestion visuelle des tâches en tableau kanban. Parfait pour les équipes jusqu'à 10 personnes.</li>
  <li><strong>Notion</strong> : wiki d'entreprise, base de données, CRM simple — tout en un. Version gratuite très complète.</li>
</ul>

<h2>5. Le paiement digital</h2>
<p>L'un des avantages majeurs de la Côte d'Ivoire est la forte pénétration du <strong>Mobile Money</strong> :</p>
<ul>
  <li><strong>Orange Money</strong>, <strong>MTN MoMo</strong>, <strong>Wave</strong> : pour recevoir des paiements de vos clients, même sans compte bancaire</li>
  <li><strong>CinetPay</strong> ou <strong>Fedapay</strong> : pour intégrer le paiement en ligne sur votre site web ou application</li>
</ul>

<h2>Les conseils pour réussir sa digitalisation</h2>
<ol>
  <li><strong>Commencez petit :</strong> adoptez un outil à la fois. La résistance au changement est réelle — ne bouleversez pas toute l'organisation d'un coup.</li>
  <li><strong>Formez votre équipe :</strong> même les outils les plus simples nécessitent un minimum de formation.</li>
  <li><strong>Sécurisez vos données :</strong> sauvegardez régulièrement sur Google Drive ou un autre cloud.</li>
  <li><strong>Mesurez les résultats :</strong> définissez des indicateurs simples (temps économisé, erreurs réduites, satisfaction client).</li>
</ol>

<h2>Conclusion</h2>
<p>La digitalisation des PME ivoiriennes est en marche. Les outils existent, ils sont souvent gratuits et accessibles depuis un smartphone. Commencez dès aujourd'hui par digitaliser votre gestion documentaire avec <strong>DocuGest Ivoire</strong> — c'est le point de départ idéal pour une transformation progressive et réussie.</p>`,
  },
];
