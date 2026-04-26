# Gribouille

Un clone de Doodle simple pour planifier des événements entre potes.

## Features
- **Accès Protégé** : Mot de passe global pour le site.
- **Organisation Privée** : Mot de passe organisateur par événement pour la gestion/suppression.
- **Vote Flexible** : Choix illimité de dates et heures.
- **Intégration Maps** : L'adresse renvoie directement sur Google Maps.

## Installation avec Docker

1. Assurez-vous d'avoir Docker et Docker Compose installés.
2. Modifiez le mot de passe du site dans `docker-compose.yml` (variable `SITE_PASSWORD`).
3. Lancez le projet :
   ```bash
   docker-compose up --build -d
   ```
4. Accédez au site sur `http://localhost:8080`.

## Développement local

### Backend
```bash
cd backend
npm install
# Créer un fichier .env avec SITE_PASSWORD=potes
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Accès sur `http://localhost:5173`.
