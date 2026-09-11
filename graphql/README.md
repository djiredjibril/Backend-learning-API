# Exemple pratique — GraphQL

## Installation
```
npm install did
```

## 1. Lancer le serveur
```
node server.js
```
→ Disponible sur http://localhost:4000/graphql (interface graphique Yoga incluse,
   tu peux tester tes requêtes directement dans le navigateur).

## 2. Lancer le client de démonstration (dans un second terminal)
```
node client.js
```

## Ce que cet exemple démontre
- Le client ne demande QUE les champs voulus (`name`, `posts.title`) → pas d'over-fetching.
- Une seule requête récupère des données liées (un user + ses posts) → pas d'under-fetching
  (en REST classique, il aurait fallu 2 appels : `/users/1` puis `/users/1/posts`).
- Une mutation (`addUser`) pour illustrer l'écriture de données.

## À essayer toi-même
Ouvre http://localhost:4000/graphql dans un navigateur et teste, par exemple :

```graphql
query {
  user(id: "1") {
    email
  }
}
```

Remarque bien : tu n'obtiens QUE l'email, rien d'autre. C'est le principe central de GraphQL.
