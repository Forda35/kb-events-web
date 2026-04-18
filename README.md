# KB Events — Site Web

Site web React (Vite) connecté au même backend que l'application mobile KB Events.

## Stack
- React 18 + Vite
- React Router v6
- jsPDF + html2canvas (téléchargement PDF billet)
- qrcode (génération QR)
- Backend : `https://kbapp-backend.onrender.com/api`

## Installation locale

```bash
npm install
npm run dev
```

## Déploiement sur Vercel

1. Pusher le projet sur GitHub
2. Importer le repo sur [vercel.com](https://vercel.com)
3. Framework preset : **Vite**
4. Build command : `npm run build`
5. Output directory : `dist`
6. Cliquer **Deploy**

Le fichier `vercel.json` gère automatiquement le routing SPA (toutes les URLs redirigées vers `index.html`).

## APK Android

Placer le fichier `kb-events.apk` dans le dossier `public/` avant le build.
Le bouton de téléchargement sur le site pointera automatiquement vers `/kb-events.apk`.

## Synchronisation app ↔ site

Les deux utilisent le même backend et la même base de données :
- Un compte créé sur le site fonctionne sur l'app et vice versa
- Un billet acheté sur le site apparaît dans l'app et vice versa
- Les QR codes sont identiques et scannables depuis les deux plateformes

## Pages

| Route | Description | Auth requise |
|-------|-------------|--------------|
| `/` | Accueil + liste des événements | Non |
| `/login` | Connexion | Non |
| `/register` | Inscription | Non |
| `/forgot-password` | Réinitialisation mot de passe | Non |
| `/mes-billets` | Mes billets + téléchargement PDF | Oui |
| `/terms` | CGU | Non |
