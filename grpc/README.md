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

## À essayer toi-même
- Modifie `user.proto` pour ajouter un champ (ex: `string phone = 4;`) dans `UserResponse`,
  ajoute la donnée dans `server.js`, relance les deux — tu verras que le contrat impose
  la cohérence entre les deux côtés.
- Essaie de lancer uniquement `client.js` sans le serveur : tu obtiens une erreur de connexion
  claire, contrairement à REST où une erreur réseau peut être plus ambiguë.
