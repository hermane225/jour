# Déploiement sur Render - Jour de Marché API

## Prérequis

1. Un compte [Render](https://render.com)
2. Un compte [MongoDB Atlas](https://www.mongodb.com/atlas) (gratuit)
3. Votre code sur GitHub ou GitLab

## Étape 1 : Configurer MongoDB Atlas

Render ne supporte pas MongoDB nativement. Utilisez MongoDB Atlas (gratuit) :

1. Créez un compte sur [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Créez un cluster gratuit (M0 Sandbox)
3. Dans **Network Access**, ajoutez `0.0.0.0/0` pour permettre les connexions depuis Render
4. Dans **Database Access**, créez un utilisateur avec mot de passe
5. Récupérez votre **Connection String** :
   ```
   mongodb+srv://<username>:<password>@cluster.xxxxx.mongodb.net/jour_de_marche?retryWrites=true&w=majority
   ```

## Étape 2 : Déployer sur Render

### Option A : Déploiement automatique avec Blueprint

1. Connectez votre repo GitHub/GitLab à Render
2. Cliquez sur **New** → **Blueprint**
3. Sélectionnez votre repo contenant `render.yaml`
4. Render créera automatiquement les services

### Option B : Déploiement manuel

1. **Créer le service Redis** :
   - Dashboard → New → Redis
   - Nom : `jour-de-marche-redis`
   - Plan : Free (25MB)

2. **Créer le Web Service** :
   - Dashboard → New → Web Service
   - Connectez votre repo
   - Configuration :
     - **Name** : `jour-de-marche-api`
     - **Region** : Frankfurt (EU)
     - **Branch** : `main`
     - **Root Directory** : `Jour_de_marche_api`
     - **Runtime** : Node
     - **Build Command** : `npm ci`
     - **Start Command** : `npm start`

## Étape 3 : Configurer les variables d'environnement

Dans le dashboard Render de votre Web Service → **Environment** :

### Variables obligatoires

| Variable | Description |
|----------|-------------|
| `NODE_ENV` | `production` |
| `PORT` | `3000` (automatique sur Render) |
| `MONGODB_URI` | Votre connection string MongoDB Atlas |
| `JWT_SECRET` | Clé secrète (générer avec: `openssl rand -hex 32`) |
| `JWT_REFRESH_SECRET` | Clé secrète refresh token |
| `REDIS_HOST` | Automatique si Redis Render |
| `REDIS_PORT` | `6379` |
| `BULL_REDIS_URL` | URL Redis pour les queues |

### Variables optionnelles (selon vos besoins)

| Variable | Description |
|----------|-------------|
| `SMTP_HOST` | Serveur SMTP pour emails |
| `SMTP_PORT` | Port SMTP (587) |
| `SMTP_USER` | Utilisateur SMTP |
| `SMTP_PASS` | Mot de passe SMTP |
| `TWILIO_ACCOUNT_SID` | Pour SMS |
| `TWILIO_AUTH_TOKEN` | Token Twilio |
| `TWILIO_PHONE` | Numéro Twilio |
| `CORS_ORIGINS` | URLs autorisées (ex: `https://monsite.com`) |
| `ADMIN_EMAIL` | Email admin initial |
| `ADMIN_PASSWORD` | Mot de passe admin |

## Étape 4 : Vérifier le déploiement

1. Attendez que le build soit terminé dans le dashboard Render
2. Accédez à votre URL : `https://jour-de-marche-api.onrender.com`
3. Testez le endpoint de santé : `https://jour-de-marche-api.onrender.com/health`

## Structure des URLs

- **API** : `https://jour-de-marche-api.onrender.com`
- **Documentation Swagger** : `https://jour-de-marche-api.onrender.com/api-docs`

## Notes importantes

### Plan gratuit Render
- Le service s'éteint après 15 min d'inactivité
- Premier démarrage lent (~30 sec)
- Limité à 750 heures/mois
- Pour la production, passez au plan **Starter** ($7/mois)

### Stockage des fichiers
Le plan gratuit n'a pas de stockage persistant. Pour les uploads :
- Utilisez **AWS S3** ou **Cloudinary**
- Configurez `STORAGE_TYPE=s3` et les variables AWS

### Domaine personnalisé
1. Dashboard → Settings → Custom Domains
2. Ajoutez votre domaine
3. Configurez le CNAME chez votre registrar

## Commandes utiles

```bash
# Générer une clé secrète
openssl rand -hex 32

# Tester l'API
curl https://jour-de-marche-api.onrender.com/health
```

## Dépannage

### L'API ne démarre pas
- Vérifiez les logs dans le dashboard Render
- Assurez-vous que `MONGODB_URI` est correcte
- Vérifiez que MongoDB Atlas autorise les connexions (0.0.0.0/0)

### Erreurs de connexion Redis
- Vérifiez que le service Redis est actif
- Utilisez les variables d'environnement fournies par Render

### Timeout au premier accès
- Normal sur le plan gratuit (cold start)
- Le service se réveille après 15 min d'inactivité
