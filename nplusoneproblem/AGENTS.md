# AGENTS.md — nplusoneproblem

## Contexte du projet

Projet pédagogique du programme "Learning Backend" : démontrer concrètement le
problème N+1 en GraphQL, l'observer via les logs PostgreSQL, puis le corriger avec
DataLoader (batching). Objectif : mesurer et comparer le nombre de requêtes SQL
générées avant/après l'optimisation, pas construire une API de production.

## Stack technique

- Node.js v20 (déjà installé sur la machine hôte)
- `graphql-yoga` — serveur GraphQL
- `pg` (node-postgres) — driver PostgreSQL natif
- `dataloader` — batching des requêtes (à ajouter à l'étape 2, pas encore installé)
- Modules ES (`"type": "module"` dans package.json) — utiliser `import`/`export`,
  jamais `require`

## Base de données

- PostgreSQL, base `n_problem_db`, utilisateur dédié `john`
- Accès **local uniquement** (`host: localhost`) — pas d'accès réseau distant configuré
- Identifiants **jamais en dur dans le code** : passer par des variables d'environnement
  (`.env` + `dotenv`), même si un exemple précédent (`db.js` initial) les avait en dur —
  à corriger dès l'ajout de `dotenv`
- Schéma :
```sql
  users(id, name, email)
  posts(id, title, body, author_id → users.id)
  comments(id, body, post_id → posts.id, author_id → users.id)
```
- Index déjà en place sur `posts.author_id`, `comments.post_id`, `comments.author_id`
- Volumétrie de test : 50 users, 250 posts, 2500 comments (déjà seedés)

## Schéma GraphQL cible

```graphql
type User { id: ID!, name: String!, email: String!, posts: [Post!]! }
type Post { id: ID!, title: String!, body: String!, author: User!, comments: [Comment!]! }
type Comment { id: ID!, body: String!, author: User! }
type Query { users: [User!]! }
```

## Déroulement attendu du projet (ne pas sauter les étapes)

1. **Version naïve d'abord** : chaque resolver de relation (`Post.author`,
   `User.posts`, `Comment.author`, `Post.comments`) fait sa propre requête SQL
   séparée via le pool `pg`. C'est volontaire — ne pas optimiser prématurément.
2. **Mesurer** : avec `log_statement = 'all'` activé côté PostgreSQL, exécuter une
   requête imbriquée sur tous les users et compter les requêtes SQL générées dans
   `/var/log/postgresql/postgresql-16-main.log`.
3. **Corriger avec DataLoader** : un loader par relation, batchant les IDs demandés
   en un seul `WHERE id IN (...)`. **Un loader par requête HTTP**, jamais un loader
   global partagé entre requêtes (fuite de cache entre utilisateurs sinon).
4. **Remesurer** et comparer.
5. Documenter les deux chiffres dans `LEARNINGS.md` (nombre de requêtes avant/après,
   pas juste "c'est mieux").

## Commandes utiles

```bash
npm install                    # installer les dépendances
node server.js                 # lancer le serveur (port 4000)
sudo systemctl restart postgresql   # après modif de postgresql.conf
sudo tail -f /var/log/postgresql/postgresql-16-main.log   # observer les requêtes en direct
```

## Conventions de code

- Un resolver = une responsabilité claire, pas de logique métier mélangée dans le
  schéma GraphQL
- Toute requête SQL passe par `db.js` (le pool `pg` partagé), jamais de connexion
  ad hoc ailleurs
- Nommer explicitement les DataLoaders selon la relation qu'ils batchent
  (ex: `postsByAuthorIdLoader`, pas `loader1`)

## Ce que l'agent ne doit PAS faire

- Ne pas ajouter de couche de cache global (Redis, etc.) — hors scope de ce projet
- Ne pas migrer vers un ORM (Prisma, TypeORM...) — l'objectif est de voir le SQL brut
  généré, un ORM masquerait ça
- Ne pas "optimiser" les resolvers avant l'étape 3 du déroulement — la version
  naïve doit rester observable telle quelle avant toute correction
