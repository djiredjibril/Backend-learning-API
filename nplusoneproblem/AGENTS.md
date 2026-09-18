# AGENTS.md — nplusoneproblem

## Contexte du projet

Projet pédagogique du programme "Learning Backend" : démontrer concrètement le
problème N+1 en GraphQL, l'observer via les logs PostgreSQL, puis le corriger avec
DataLoader (batching). Objectif : mesurer et comparer le nombre de requêtes SQL
générées avant/après l'optimisation, pas construire une API de production.

## Architecture

- Code du projet : sur ce Mac
- Base de données PostgreSQL : sur le serveur Ubuntu local (192.168.1.89), accessible
  via le réseau domestique (règles pg_hba.conf + ufw restreintes à ce réseau)

## Stack technique

- Node.js (via nvm ou install système sur le Mac)
- `graphql-yoga` — serveur GraphQL
- `pg` (node-postgres) — driver PostgreSQL natif
- `dataloader` — batching des requêtes (à ajouter à l'étape 2, pas encore installé)
- Modules ES (`"type": "module"` dans package.json) — utiliser `import`/`export`,
  jamais `require`

## Base de données

- PostgreSQL 14, base `n1_db`, utilisateur dédié `n1_user`
- Accès réseau local uniquement (192.168.1.0/24), jamais exposé au-delà
- Identifiants dans `.env` (jamais en dur dans le code, jamais commité — voir .gitignore)
- Schéma :
```sql
  users(id, name, email)
  posts(id, title, body, author_id → users.id)
  comments(id, body, post_id → posts.id, author_id → users.id)
```
- Index en place sur posts.author_id, comments.post_id, comments.author_id
- Volumétrie de test : 50 users, 250 posts, 2500 comments (déjà seedés)

## Schéma GraphQL cible

```graphql
type User { id: ID!, name: String!, email: String!, posts: [Post!]! }
type Post { id: ID!, title: String!, body: String!, author: User!, comments: [Comment!]! }
type Comment { id: ID!, body: String!, author: User! }
type Query { users: [User!]! }
```

## Déroulement attendu du projet (ne pas sauter les étapes)

1. **Version naïve d'abord** : chaque resolver de relation (Post.author, User.posts,
   Comment.author, Post.comments) fait sa propre requête SQL séparée via le pool pg.
   C'est volontaire — ne pas optimiser prématurément.
2. **Mesurer** : avec log_statement = 'all' activé côté PostgreSQL (sur le serveur),
   exécuter une requête imbriquée sur tous les users et compter les requêtes SQL
   générées dans /var/log/postgresql/postgresql-14-main.log (sur le serveur, via SSH).
3. **Corriger avec DataLoader** : un loader par relation, batchant les IDs demandés
   en un seul WHERE id IN (...). Un loader par requête HTTP, jamais un loader global
   partagé entre requêtes.
4. **Remesurer** et comparer.
5. Documenter les deux chiffres dans LEARNINGS.md.

## Ce que l'agent ne doit PAS faire

- Ne pas ajouter de couche de cache global (Redis, etc.) — hors scope de ce projet
- Ne pas migrer vers un ORM — l'objectif est de voir le SQL brut généré
- Ne pas "optimiser" les resolvers avant l'étape 3 du déroulement
