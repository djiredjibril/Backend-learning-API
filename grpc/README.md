# Exemple pratique — gRPC
 
## Installation
```
npm install
```
 
## 1. Lancer le serveur
```
node server.js
```
→ Écoute sur 0.0.0.0:50051 (pas de navigateur possible, gRPC n'est pas fait pour ça)
 
## 2. Lancer le client (dans un second terminal)
```
node client.js
```
 
## Ce que cet exemple démontre
- **user.proto** : le contrat strict partagé entre client et serveur (typage fort).
  C'est LA différence fondamentale avec REST/GraphQL : rien ne fonctionne si le contrat
  n'est pas respecté des deux côtés.
- **GetUser** : un appel "unaire" classique, équivalent d'un GET REST.
- **ListUsers** : du *streaming serveur* — le serveur envoie plusieurs messages
  successifs pour une seule requête du client (impossible nativement en REST classique,
  il faudrait du polling ou des WebSockets).
- **UpdateUserName** : une mise à jour qui renvoie l'objet complet à jour (pas juste un
  statut "OK"), avec une validation (`INVALID_ARGUMENT` si le nom est vide) et une
  erreur `NOT_FOUND` si l'id n'existe pas.
- **CreatePost** : illustre un service "créer une ressource liée à un user" — avec
  vérification que l'`authorId` existe avant de créer le post (comme une contrainte
  de clé étrangère). Le client (`client.js`) teste volontairement un `authorId`
  inexistant pour montrer l'erreur `NOT_FOUND` gérée proprement.
## Les codes d'erreur gRPC utilisés ici
gRPC a ses propres codes de statut standardisés (équivalents des codes HTTP) :
- `grpc.status.NOT_FOUND` (5) — ressource introuvable
- `grpc.status.INVALID_ARGUMENT` (3) — donnée envoyée invalide
Contrairement à REST où le code HTTP est souvent le seul indice, ici le `message`
d'erreur est structuré et prévisible côté client (`err.code`, `err.message`).
 
## À essayer toi-même
- Modifie `user.proto` pour ajouter un champ (ex: `string phone = 4;`) dans `UserResponse`,
  ajoute la donnée dans `server.js`, relance les deux — tu verras que le contrat impose
  la cohérence entre les deux côtés.
- Essaie de lancer uniquement `client.js` sans le serveur : tu obtiens une erreur de connexion
  claire, contrairement à REST où une erreur réseau peut être plus ambiguë.
 
