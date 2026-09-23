# LEARNINGS — nplusoneproblem (GraphQL N+1)

## Objectif
Observer concrètement le problème N+1 en GraphQL, le mesurer via les logs PostgreSQL,
puis le corriger avec DataLoader (batching).

## Setup
- PostgreSQL 14 sur serveur Ubuntu local, accédé depuis le Mac via un tunnel SSH
  (`ssh -f -N -L 5433:localhost:5432 djiredjire@192.168.1.89`)
- Données : 50 users, 250 posts (5/user), 2500 comments (10/post)
- Requête testée :
```graphql
  query { users { name posts { title } } }
```

## Résultats mesurés (logs PostgreSQL réels, pas théoriques)

| Version              | Requêtes SQL générées | Facteur |
|-----------------------|------------------------|---------|
| Resolvers naïfs        | 51                     | 1x      |
| Avec DataLoader        | 2                      | ÷25     |

## Ce qui a été appris

- Le nombre de requêtes en version naïve suit une loi **1 + N** (N = nombre de users
  renvoyés) : avec 5000 users, ça serait devenu 5001 requêtes. Avec DataLoader, ça
  reste **2**, quel que soit le nombre de users — le nombre de requêtes dépend de la
  **profondeur d'imbrication** de la requête GraphQL, plus du tout du volume de données.
- Piège technique rencontré en comptant les requêtes dans les logs : `pg` (node-postgres)
  distingue les requêtes simples (`statement:` dans les logs) des requêtes paramétrées
  (`execute` dans les logs, via le protocole étendu Parse/Bind/Execute). Un `grep -c
  "statement:"` seul sous-compte largement — il faut `grep -cE "statement:|execute "`.
- DataLoader doit être instancié **une fois par requête HTTP** (dans le `context` de
  `createYoga`), jamais en singleton global — sinon son cache interne fuiterait entre
  différentes requêtes/utilisateurs.
- Seul le resolver `User.posts` a été optimisé dans cette première passe ; `Post.author`
  et `Comment.author` restent volontairement naïfs pour l'instant — à traiter en
  itération suivante avec leurs propres DataLoaders dédiés.

## Prochaine itération possible
- Ajouter un DataLoader pour `Post.author` et `Comment.author`
- Mesurer l'effet combiné sur une requête encore plus imbriquée (users → posts → comments → author)
