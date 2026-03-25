---
name: insforge-backend
description: >-
  Backend InsForge pour DocuGest Ivoire — utiliser le MCP InsForge et le CLI
  (@insforge/cli) pour métadonnées, SQL, storage, functions, logs et secrets ;
  consulter fetch-docs avant d’écrire du code SDK.
---

# InsForge — backend DocuGest Ivoire

## Contexte repo

- **Client** : `client/` (React + Vite).
- **API locale actuelle** : `server/` (Express + stockage dev JSON). L’alignement progressif avec InsForge se fait via SDK + variables d’environnement une fois le projet lié.

## Avant toute intégration code

1. Appeler le MCP **`fetch-docs`** avec `docType: "instructions"`.
2. Pour une feature précise, appeler **`fetch-docs`** ou **`fetch-sdk-docs`** (feature + `typescript`) selon le besoin (auth, db, storage, functions, AI, realtime).

## Quand utiliser quoi

| Besoin | Outil |
|--------|--------|
| Schéma, clé anon, URL backend | MCP `get-backend-metadata`, `get-table-schema` |
| SQL (migrations, index) | MCP `run-raw-sql` (ou CLI `insforge db` si disponible) |
| Buckets, functions, déploiement | MCP `create-bucket`, `create-function`, `create-deployment`, etc. |
| Logique applicative (auth, CRUD, storage) | SDK `@insforge/sdk` dans le code (pas le MCP) |
| Tâches infra / terminal | **InsForge CLI** (voir ci-dessous) |

## InsForge CLI (tâches backend)

Toujours exécuter depuis la racine du repo **`docugest-ivoire`** :

```bash
npx insforge whoami
npx insforge current
npx insforge link --project-id <UUID>   # si accès au projet
npx insforge metadata
npx insforge db --help
npx insforge functions --help
npx insforge storage --help
npx insforge secrets --help
npx insforge logs insforge.logs
```

Le package **`@insforge/cli`** est en `devDependency` : préférer `npx insforge` ou `npm exec insforge`.

### Si `link` renvoie « Access denied »

- Vérifier dans le dashboard InsForge que le compte a accès au projet.
- Utiliser l’extension **InsForge** dans Cursor : *Login* puis *Select Project* / *Install MCP* pour le bon workspace.

## Rappels SDK (voir doc à jour via MCP)

- Créer le client avec `createClient({ baseUrl, anonKey })` depuis les métadonnées backend.
- Les opérations SDK renvoient `{ data, error }`.
- Inserts base : format **tableau** `[{ ... }]`.
