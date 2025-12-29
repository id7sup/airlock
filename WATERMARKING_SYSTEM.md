# Système de Watermarking Page par Page

## Vue d'ensemble

Ce système implémente une approche "render-to-images server-side" pour sécuriser la visualisation des PDFs en mode lecture seule. Au lieu de servir le PDF original, le système génère des images watermarkées page par page.

## Architecture

### 1. Pipeline Backend (Asynchrone)

**Service**: `src/services/pdf-pages.ts`

- Récupère le PDF original depuis R2 (bucket privé)
- Rasterise le PDF page par page (1600-2200px de large) en WebP
- Incruste un watermark diagonal répétitif dans chaque page
- Stocke les pages dans R2 : `derived/{fileId}/pages/{pageIndex}.webp`
- Enregistre un manifest dans R2 : `derived/{fileId}/manifest.json`
- Met à jour Firestore : `derivedAssets` avec `pageCount`, `status=ready`, `variant=watermarked_pages`

### 2. API de Lecture

**Endpoints**:

- `GET /api/share/file/[fileId]/viewer-manifest?token=...`
  - Valide les droits (sharelink + expiration + quota)
  - Calcule la règle par fichier (`downloadAllowed?`)
  - Retourne un manifest avec `pageCount` et `pageUrls` (URLs vers notre backend)
  - Ne renvoie jamais l'URL de l'original quand `download` est OFF

- `GET /api/share/[shareId]/file/[fileId]/page/[n]?token=...`
  - Stream une page watermarkée spécifique depuis R2
  - Headers: `Content-Type: image/webp`, `Content-Disposition: inline`
  - Validation complète des droits à chaque requête

- `POST /api/share/file/[fileId]/generate-pages`
  - Déclenche la génération asynchrone des pages
  - Non-bloquant, retourne immédiatement

- `POST /api/share/file/[fileId]/download`
  - Télécharge le fichier original SEULEMENT si `downloadAllowed=true`
  - Retourne 403 si `downloadAllowed=false`

### 3. Viewer Frontend

**Composant**: `src/components/shared/PDFPageViewer.tsx`

- UI: colonne scrollable avec pages empilées
- Rendu: chaque page = `<img>` natif (pas Next/Image)
- Lazy loading: `IntersectionObserver` pour charger les pages à la demande
- Protection: bloque les clics, menu contextuel, drag-and-drop
- Scroll fluide entre les pages

## Sécurité

### Mesures implémentées

1. **Bucket R2 privé**: Aucun objet public
2. **URLs backend**: Pas d'URLs présignées exposées, tout passe par notre backend
3. **Validation à chaque requête**: Token, shareId, droits vérifiés pour chaque page
4. **Watermark incrusté**: Texte diagonal répétitif non retirable
5. **Pas d'exposition de l'original**: En mode lecture seule, seul le backend peut accéder à l'original

### Limitations réalistes

> "Sur le web, 'impossible à télécharger' n'existe pas à 100% : si l'utilisateur peut voir, il peut capturer."

L'objectif est de :
- Ne pas exposer l'original
- Rendre l'extraction non triviale
- Watermarker pour dissuader et tracer

## Dépendances

### Requises

- `pdfjs-dist@4.0.379`: Pour parser et rasteriser les PDFs
- `sharp@0.33.0`: Pour le traitement d'images et watermarking

### Optionnelle (pour vraie rasterisation)

- `canvas`: Pour la rasterisation réelle des PDFs (nécessite des dépendances système)

**Note**: Si `canvas` n'est pas installé, le système utilise un placeholder blanc avec watermark. Pour la vraie rasterisation, installez `canvas` et ses dépendances système.

## Installation de canvas (optionnel)

### macOS

```bash
brew install pkg-config cairo pango libpng jpeg giflib librsvg pixman
npm install canvas
```

### Linux (Ubuntu/Debian)

```bash
sudo apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev
npm install canvas
```

## Flux d'utilisation

1. **Utilisateur ouvre un PDF en mode lecture seule**
   - Le frontend appelle `/api/share/file/[fileId]/viewer-manifest`
   - Si les pages ne sont pas générées, le backend déclenche la génération asynchrone
   - Le frontend reçoit `status: "processing"` et fait du polling

2. **Génération des pages (backend)**
   - Le service `generateWatermarkedPages` traite le PDF
   - Chaque page est rasterisée et watermarkée
   - Les pages sont uploadées dans R2
   - Le manifest est créé et Firestore est mis à jour

3. **Affichage des pages (frontend)**
   - Le polling détecte `status: "ready"`
   - Le composant affiche les pages avec lazy loading
   - Chaque page est chargée via `/api/share/[shareId]/file/[fileId]/page/[n]`
   - Scroll fluide entre les pages

4. **Téléchargement (si autorisé)**
   - Bouton "Télécharger" visible si `downloadAllowed=true`
   - Appel à `/api/share/file/[fileId]/download`
   - Retourne une URL présignée vers l'original

## Structure des fichiers

```
src/
├── services/
│   └── pdf-pages.ts              # Service de génération
├── app/api/share/
│   ├── file/[fileId]/
│   │   ├── viewer-manifest/      # Manifest endpoint
│   │   ├── generate-pages/       # Génération async
│   │   └── download/              # Download endpoint
│   └── [shareId]/file/[fileId]/page/[n]/  # Streaming pages
└── components/shared/
    └── PDFPageViewer.tsx         # Viewer component
```

## Notes importantes

1. **Performance**: La génération des pages peut prendre du temps pour les gros PDFs. Le système est asynchrone pour ne pas bloquer l'utilisateur.

2. **Fallback**: Si la génération échoue ou si `canvas` n'est pas installé, le système peut servir un placeholder. Pour une vraie production, installez `canvas`.

3. **Cache**: Les pages sont cachées dans R2. Le manifest est mis en cache côté Firestore.

4. **Rate limiting**: À implémenter si nécessaire sur les endpoints de streaming.

5. **Logs**: À ajouter pour tracer `file_viewed`, `page_loaded`, etc.

