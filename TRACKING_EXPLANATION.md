# Explication du Tracking et des Événements

## 📊 Types d'Événements Trackés

Votre système tracke automatiquement tous les accès et actions sur les liens partagés. Voici ce que chaque événement signifie :

### 1. **OPEN_SHARE** (Ouverture du lien)
- **Quand** : Dès qu'une personne ouvre votre lien de partage
- **Exemple** : Quelqu'un clique sur votre lien et arrive sur la page du dossier partagé
- **Tracké sur** : Tous les devices (desktop, mobile, tablette)

### 2. **OPEN_FOLDER** (Ouverture d'un sous-dossier)
- **Quand** : Quand quelqu'un ouvre un sous-dossier dans votre partage
- **Exemple** : Navigation dans `/share/token/folder/123`
- **Tracké sur** : Tous les devices

### 3. **VIEW_FILE** (Visualisation d'un fichier)
- **Quand** : Quand quelqu'un visualise un fichier en ligne (sans télécharger)
- **Exemple** : Ouverture d'un PDF, image, ou document dans le viewer
- **Tracké sur** : Tous les devices

### 4. **DOWNLOAD_FILE** (Téléchargement d'un fichier)
- **Quand** : Quand quelqu'un télécharge un fichier
- **Exemple** : Clic sur le bouton de téléchargement
- **Tracké sur** : Tous les devices (y compris mobile)

### 5. **ACCESS_DENIED** (Accès refusé)
- **Quand** : Tentative d'accès non autorisée
- **Exemples** : 
  - Lien expiré
  - Quota de vues atteint
  - Mot de passe incorrect
  - Pays non autorisé
- **Tracké sur** : Tous les devices

---

## 🔍 User Agent - Qu'est-ce que c'est ?

Le **User Agent** est une chaîne de caractères envoyée par le navigateur/appareil qui identifie :
- Le type d'appareil (ordinateur, téléphone, tablette)
- Le système d'exploitation (Windows, macOS, iOS, Android, Linux)
- Le navigateur utilisé (Chrome, Safari, Firefox, Edge, etc.)
- La version du navigateur

### Exemple de User Agent

```
Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36
```

**Décodage** :
- `Macintosh; Intel Mac OS X 10_15_7` → Mac avec macOS Catalina (10.15.7)
- `Chrome/120.0.0.0` → Navigateur Chrome version 120
- `Safari/537.36` → Moteur de rendu Safari

### Autres exemples

**iPhone avec Safari** :
```
Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1
```

**Android avec Chrome** :
```
Mozilla/5.0 (Linux; Android 13; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36
```

**Windows avec Edge** :
```
Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0
```

---

## 📱 Tracking sur Tous les Devices

Le système tracke maintenant **automatiquement côté serveur** tous les événements, ce qui garantit :

✅ **Fonctionne sur mobile** : Même si JavaScript est désactivé ou bloque les trackers
✅ **Fonctionne sur tous navigateurs** : Desktop, mobile, tablette
✅ **Géolocalisation précise** : Utilise l'IP réelle pour localiser exactement l'utilisateur
✅ **Détection d'appareil** : Le User Agent permet d'identifier le type d'appareil utilisé

### Données Collectées pour Chaque Événement

Pour chaque événement, le système enregistre :

1. **Géolocalisation** :
   - Pays
   - Ville (exacte)
   - Région
   - Coordonnées GPS (latitude/longitude)
   - ISP (Fournisseur d'accès internet)
   - Détection VPN/Datacenter

2. **Appareil** :
   - User Agent (type d'appareil, OS, navigateur)
   - Visitor ID (identifiant unique du visiteur)

3. **Contexte** :
   - Timestamp (date et heure exacte)
   - Referer (d'où vient le visiteur)
   - Fichier/Dossier concerné (si applicable)

---

## 🔐 Confidentialité

- Les IP sont **hashées** pour protéger la vie privée
- Aucune donnée personnelle n'est collectée
- Seules les métadonnées techniques sont enregistrées

---

## 📈 Où Voir les Données

Toutes ces données sont visibles dans votre dashboard :
- **Globe interactif** : Visualisation géographique des accès
- **Détails des points** : Cliquez sur un point pour voir toutes les informations
- **Logs d'activité** : Liste complète de tous les événements
