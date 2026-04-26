# Gribouille

Un clone de Doodle simple, rapide et sans abonnement, idéal pour organiser tes sorties entre potes en 5 minutes.

## Features
- **Accès Libre** : Pas besoin de compte, pas de pub, pas d'abonnement.
- **Gestion Privée** : Mot de passe organisateur par événement pour modifier, éditer ou supprimer tes sondages.
- **Vote Flexible** : Choix illimité de dates et heures.
- **Intégration Maps** : L'adresse renvoie directement sur Google Maps.

## Installation avec Docker

1. Assurez-vous d'avoir Docker et Docker Compose installés.
2. Lancez le projet :
   ```bash
   docker compose up -d
   ```
3. Accédez au site sur `http://localhost:8080`.

## Développement local

Le projet est configuré en mode **Hot Reload** pour le développement.

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Accès sur `http://localhost:8080` (le frontend proxyifie les appels API vers le port 3001 du backend).
