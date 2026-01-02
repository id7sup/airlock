# Variables d'environnement pour la production

## ⚠️ IMPORTANT : Variables requises

### Mapbox (pour le globe de suivi) - OBLIGATOIRE
```
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.eyJ1IjoiaWQ3c3VwIiwiYSI6ImNtanhjdnlwZDAwMjIzZHNlZGU5c2Q5NjAifQ.do66guUWEHb9HjJ_BXIKsg
```

**Cette variable est OBLIGATOIRE** pour que le globe de suivi fonctionne. Sans elle, vous verrez l'erreur "Token Mapbox non configuré".

### Firebase
```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

### Clerk
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
```

### S3/Storage
```
S3_ENDPOINT=...
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...
S3_BUCKET_NAME=...
AWS_REGION=...
```

## Instructions pour Vercel/Production

1. Allez dans les paramètres de votre projet Vercel
2. Section "Environment Variables"
3. Ajoutez toutes les variables ci-dessus
4. Assurez-vous que `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` est bien définie
5. Redéployez l'application

