# Airlock - Transparence Sécurité

**Version 1.0** | Dernière mise à jour : Janvier 2025

## 🔐 Déclaration de Sécurité

Airlock est une plateforme de partage de fichiers sécurisée conçue pour les équipes exigeant un contrôle élevé sur leurs données. Cette page clarifie exactement comment fonctionne notre architecture de sécurité.

---

## Ce que Airlock FAIT ✅

### 1. Chiffrement en Transit
- **TLS 1.3 obligatoire** sur toutes les communications
- Tous les échanges client-serveur sont chiffrés
- Aucune exception ou fallback à des protocoles non sécurisés

### 2. Chiffrement au Repos
- Stockage exclusif dans **Cloudflare R2** (service géré)
- Cloudflare implémente le chiffrement au repos selon ses standards
- Les fichiers ne sont pas chiffrés côté client par défaut

### 3. Contrôle d'Accès Granulaire
- **Système de permissions** : Owner, Editor, Viewer
- **Liens de partage sécurisés** avec :
  - Tokens uniques de 64 caractères (hachés SHA-256)
  - Expiration automatique configurée
  - Protection par mot de passe optionnelle
  - Quota de vues (limites de consultations)
  - Révocation instantanée
- **Isolation par workspace** : chaque utilisateur n'accède qu'à ses propres données

### 4. URLs Présignées Temporaires
- Les fichiers sont servis via des URLs signées par Cloudflare R2
- **Expiration configurable** :
  - Upload : 5 minutes
  - Téléchargement : 1 heure
  - Affichage/prévisualisation : 2 minutes
- Impossible d'accéder à un fichier après expiration de l'URL

### 5. Traçabilité Complète
- Enregistrement de tous les accès (vues, téléchargements)
- Analytics en temps réel
- Localisation géographique des accès (via Mapbox)

### 6. Pas de Transit par les Serveurs Airlock
- L'upload se fait **directement navigateur → Cloudflare R2**
- Les fichiers ne passent jamais par nos serveurs
- Airlock reçoit uniquement les métadonnées

### 7. Pas d'Analyse de Contenu
- **Airlock n'analyse, n'indexe, ni n'exploite le contenu de vos fichiers**
- Pas de machine learning sur le contenu
- Pas d'accès aux données personnelles pour du marketing ou de la monétisation

---

## Ce que Airlock N'EST PAS ❌

### 1. Pas une Solution "Zero-Knowledge"
- Airlock **n'est pas "zero-knowledge"** au sens cryptographique strict
- Zero-knowledge signifierait : seul l'utilisateur détient les clés de déchiffrement
- Chez Airlock :
  - Les fichiers sont chiffrés chez Cloudflare R2
  - Cloudflare (l'opérateur de stockage) peut techniquement y accéder
  - Airlock gère les clés et les permissions

### 2. Pas du Chiffrement End-to-End Client-Only
- Les clés ne sont pas détenues exclusivement par l'utilisateur
- Aucun chiffrement côté client avant upload (à moins d'implémenter vous-même)
- Airlock stocke et gère les métadonnées de contrôle d'accès

### 3. Pas Anonyme
- Tous les accès sont traçables avec logs détaillés
- Les partages nécessitent une authentification
- Les analytiques incluent la géolocalisation

---

## Architecture Technique

```
┌─────────────────────────────────────────────┐
│ Utilisateur (Browser)                       │
│ ├── TLS 1.3 (chiffrement en transit)       │
└─────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────┐
│ Airlock Server (Next.js + Firebase)         │
│ ├── Authentification Clerk                  │
│ ├── Gestion des permissions                 │
│ ├── Génération URLs présignées              │
│ └── Logs & Analytics                        │
└─────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────┐
│ Cloudflare R2 (Object Storage)              │
│ ├── Chiffrement au repos                    │
│ ├── Redondance géographique                 │
│ └── Sécurité selon standards Cloudflare     │
└─────────────────────────────────────────────┘
```

---

## Flux de Sécurité : Partage d'un Fichier

### Étape 1 : Upload
1. Utilisateur authentifié via Clerk
2. Vérification des permissions (base Firebase)
3. Génération d'une URL présignée Cloudflare R2 (valable 5 min)
4. **Client upload directement vers Cloudflare R2** (pas par Airlock)
5. Airlock enregistre la métadonnée du fichier dans Firebase

**Résultat : Votre fichier = Chiffré au repos chez Cloudflare R2**

### Étape 2 : Création du Lien de Partage
1. Utilisateur configure les règles (mot de passe, expiration, quota)
2. Génération d'un token unique 64-char
3. Hachage SHA-256 du token avant stockage
4. Stockage sécurisé en base de données

**Résultat : Lien unique + Contrôle total**

### Étape 3 : Accès Visiteur
1. Visiteur reçoit le lien (token en clair)
2. Validation du token (comparaison avec hash SHA-256)
3. Vérification : expiration, quota, mot de passe, révocation
4. Génération d'une URL présignée Cloudflare R2 (valable 1-2 min)
5. Visiteur télécharge directement depuis Cloudflare
6. Enregistrement de l'accès : IP, navigateur, localisation, timestamp

**Résultat : Traçabilité + Sécurité**

---

## Conformité & Certifications

### RGPD
- ✅ Les données restent sous votre contrôle
- ✅ Droit à l'oubli : suppression des fichiers = suppression complète
- ✅ Droit d'accès : accès à vos données via votre compte
- ✅ Pas de sous-traitant non déclaré

### Localisation des Données
- Stockage : **Cloudflare R2** (géographie configurable)
- Base de données : **Firebase** (UE/US selon configuration)
- Serveurs : **PM2 sur serveur privé** (localisation à spécifier)

---

## Recommandations de Sécurité

### Pour une Confidentialité Maximale
Si vous avez des exigences de **zero-knowledge** ou de **confidentialité absolue** :

1. **Chiffrez avant upload** :
   - Utilisez 7-Zip, Veracrypt, ou OpenPGP
   - Uploadez le fichier chiffré sur Airlock
   - Partagez le mot de passe séparément (canal différent)

2. **Utilisez des DNS privés** :
   - ProtonDNS, Mullvad DNS, ou autres services sans logs

3. **VPN ou Tor** (optionnel) :
   - Pour masquer votre IP lors de l'upload/téléchargement

---

## Gestion des Incidents

| Scénario | Airlock Peut | Airlock Ne Peut Pas |
|----------|-------------|-------------------|
| Accès aux fichiers uploadés | Non (Cloudflare les chiffre) | Voir le contenu |
| Révoquer un lien partagé | Oui (instantané) | Récupérer copies téléchargées |
| Voir qui a consulté | Oui (logs détaillés) | - |
| Supprimer un fichier | Oui (suppression logique & physique) | Récupérer depuis backups anciens |
| Accéder sans permission | Non (tokens validés) | - |

---

## Politique de Divulgation Responsable

Si vous découvrez une vulnérabilité de sécurité :

1. **NE PAS publier publiquement**
2. Contactez : `security@airlck.com`
3. Décrivez :
   - La vulnérabilité découverte
   - Les étapes pour la reproduire
   - L'impact potentiel
4. Délai : réponse sous 48h, correctif sous 30 jours

---

## Questions Fréquentes

**Q: Airlock peut-il lire mes fichiers ?**
R: Non. Les fichiers sont chez Cloudflare R2 chiffrés au repos. Airlock ne stocke que les métadonnées de contrôle d'accès.

**Q: Cloudflare peut-il lire mes fichiers ?**
R: Techniquement oui, c'est l'opérateur du stockage. Mais Cloudflare a des certifications de sécurité strictes (ISO 27001, SOC 2) et une politique d'accès limité.

**Q: Et si je veux du vrai zero-knowledge ?**
R: Chiffrez vos fichiers avant de les uploader sur Airlock. Utilisez 7-Zip, Veracrypt, ou OpenPGP.

**Q: Airlock conserve-t-il les fichiers supprimés ?**
R: Non. Suppression = suppression physique immédiate chez Cloudflare R2.

**Q: Vendez-vous mes données ?**
R: Non. Jamais. Nous n'avons aucun incitatif commercial à vendre vos données.

---

## Contact & Support

- **Sécurité** : security@airlck.com
- **Confidentialité** : contact@airlck.com
- **Support** : contact@airlck.com
- **Site** : https://airlck.com

---

**Airlock Security Team**
Engagement : Sécurité forte, transparence honnête, zéro compromis sur vos données.
