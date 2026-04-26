# Gribouille

A simple, fast, and subscription-free tool, perfect for organizing outings with friends in 5 minutes.

## Why this project?
Developed to meet a specific need for flexibility—allowing an unlimited number of date suggestions—without the subscription constraints found in mainstream services. The architecture is fully serverless, leveraging Firebase for minimal maintenance.

## Features
- **Open Access**: No account required, no ads, no subscriptions.
- **Private Management**: Organizer password per event to modify, edit, or delete polls.
- **Flexible Voting**: Unlimited choice of dates and times.
- **Maps Integration**: Addresses link directly to Google Maps.

## Architecture
This project is a full-stack web application deployed on **Firebase**.

- **Frontend**: React with TypeScript and Vite.
- **Backend**: Firebase Cloud Functions.
- **Database**: Firestore.

## Local Development

### Prerequisites
- Node.js (LTS version recommended)
- Firebase CLI (`npm install -g firebase-tools`)

### Setup
1. Clone the repository.
2. Install dependencies:
   ```bash
   cd frontend && npm install
   cd ../functions && npm install
   ```

### Running
Start the project locally using the Firebase emulators:

```bash
firebase emulators:start
```

Access the site at the URL provided by the emulators (usually `http://localhost:5173`).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
