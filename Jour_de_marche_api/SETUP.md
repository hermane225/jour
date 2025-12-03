# Jour de Marché API - Guide de Configuration

## 📋 Démarrage Rapide

### 1. Cloner et installer
```bash
cd jour_de_marche_api
npm install
```

### 2. Configuration de l'environnement
```bash
cp .env.example .env
```

Éditer `.env` et configurer:
- `MONGODB_URI` - Connexion MongoDB
- `REDIS_HOST` - Host Redis
- `JWT_SECRET` - Clé secrète JWT
- `SMTP_*` - Configuration email
- Autres services...

### 3. Démarrer avec Docker Compose
```bash
docker-compose up -d
```

### 4. Initialiser la base de données
```bash
npm run migrate
npm run seed
```

### 5. Démarrer le serveur
```bash
npm run dev
```

Le serveur est accessible à `http://localhost:3000`

## 🔑 Variables d'Environnement Essentielles

| Variable | Description | Défaut |
|----------|-------------|--------|
| `NODE_ENV` | Environnement | `development` |
| `PORT` | Port du serveur | `3000` |
| `MONGODB_URI` | Connexion MongoDB | `mongodb://localhost:27017/jour_de_marche` |
| `REDIS_HOST` | Host Redis | `localhost` |
| `JWT_SECRET` | Clé JWT | À changer en production |
| `CORS_ORIGINS` | Origines CORS | `http://localhost:3000,3001` |

## 🏗️ Architecture

```
src/
├── api/          # Routes, controllers, validators
├── models/       # Schémas MongoDB
├── middlewares/  # Middlewares Express
├── services/     # Services métier
├── jobs/         # Bull queues et workers
├── utils/        # Utilitaires
├── tests/        # Tests
└── docs/         # Documentation
```

## 🧪 Tests

```bash
# Lancer tous les tests
npm run test

# Tests unitaires
npm run test:unit

# Tests d'intégration
npm run test:integration

# Avec coverage
npm run test:coverage
```

## 📚 Documentation API

API OpenAPI/Swagger disponible via Swagger UI (en développement)

Accédez à: `http://localhost:3000/api/docs`

## 🚀 Déploiement

### Docker
```bash
docker build -t jour-de-marche-api:latest .
docker run -p 3000:3000 --env-file .env jour-de-marche-api:latest
```

### Kubernetes
```bash
kubectl apply -f infra/k8s/
```

### Terraform
```bash
cd infra/terraform
terraform init
terraform plan
terraform apply
```

## 🔒 Sécurité

- ✅ JWT pour l'authentification
- ✅ Rate limiting
- ✅ Validation des entrées
- ✅ Helmet pour les headers de sécurité
- ✅ CORS configuré

À faire:
- [ ] HTTPS/SSL en production
- [ ] Secrets management
- [ ] Audit logging
- [ ] WAF (Web Application Firewall)

## 📞 Support

Pour les issues: GitHub Issues
Pour les PRs: Créer une PR dans develop

## 📄 Licence

Propriétaire

---

Version: 1.0.0 | Date: Novembre 2025
