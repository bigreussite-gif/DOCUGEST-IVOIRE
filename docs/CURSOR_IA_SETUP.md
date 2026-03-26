# Configuration Cursor (skills + MCP) — DocuGest

Ce dépôt ne peut pas « installer » les MCP à ta place : ils se configurent dans **Cursor → Settings → MCP** (ou fichier utilisateur). Ce guide sert à aller vite et limiter les erreurs.

## 1. Skills (guides intégrés à l’agent)

Dans Cursor, ouvre **Settings → Rules, Skills & Memories** (ou équivalent) et :

- Active / garde les **skills** liés à ta stack : **Next.js**, **React**, **Vercel**, **PostgreSQL** si proposés.
- Tu peux ajouter des skills personnalisés dans ton dossier utilisateur `~/.cursor/skills/` (fichiers `SKILL.md`) pour les conventions du projet.

Pour **ce repo**, les règles d’équipe peuvent vivre dans `.cursor/rules/` (à créer si besoin) — l’assistant les lit automatiquement quand elles existent.

## 2. MCP recommandés pour ce projet

| MCP | Intérêt |
|-----|--------|
| **Vercel** | Déploiements, env, logs (déjà souvent disponible via extension Cursor). |
| **GitHub** | PR, issues, CI (si le repo est sur GitHub). |
| **PostgreSQL** | Requêtes / schéma DB (à connecter avec ton `DATABASE_URL` — **jamais** en clair dans le dépôt). |
| **Filesystem** | Accès fichiers contrôlé (selon besoin). |
| **Navigateur (IDE)** | Tests UI dans Cursor. |

**InsForge** : si tu utilises leur MCP, configure-le avec les identifiants fournis par InsForge (dashboard projet).

## 3. Exemple de bloc MCP (à adapter)

Dans **Cursor Settings → MCP → Add server**, le format ressemble à :

```json
{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres", "postgresql://USER:PASS@HOST:5432/DB"]
    }
  }
}
```

Remplace la chaîne par ta vraie URL (idéalement via une variable d’environnement référencée selon ce que Cursor autorise sur ta version).

> **Sécurité** : ne commite jamais de secrets ; utilise des env locales ou les secrets Cursor.

## 4. Ce que l’agent peut faire sans MCP supplémentaire

- Lire / modifier le code du workspace  
- Lancer `npm run build`, tests, `git`  
- Utiliser les outils déjà exposés par ton Cursor (MCP déjà activés chez toi)

## 5. Aller plus vite sur ce repo

- Un fichier `.env` valide dans `client/` pour l’API Next et la base  
- `npm install` dans `client/` après clone  
- Règles projet dans `.cursor/rules/*.mdc` pour rappeler stack, langue (FR), et commandes de build

---

*Dernière mise à jour : généré pour standardiser l’onboarding IA sur DocuGest.*
