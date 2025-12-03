# Jour de Marché API

Une plateforme e-commerce API complète pour connecter agriculteurs, commerçants et consommateurs avec gestion des commandes, paiements et livraisons.

## 🚀 Quick Start

### Prérequis
- Node.js v18+
- Docker & Docker Compose
- npm ou yarn

### Installation

1. **Cloner le projet**
```bash
git clone <repo-url>
cd jour_de_marche_api
```

2. **Configurer l'environnement**
```bash
cp .env.example .env
```

3. **Installer les dépendances**
```bash
npm install
```

4. **Démarrer avec Docker Compose**
```bash
docker-compose up -d
```

5. **Exécuter les migrations**
```bash
npm run migrate
```

6. **Seeder la base de données**
```bash
npm run seed
```

### Développement local

```bash
npm run dev
```

Le serveur démarre à `http://localhost:3000`

## 📁 Structure du Projet

```
├── config/           # Configuration (DB, Redis, Logger)
├── src/
│   ├── api/         # Routes et controllers par domaine
│   ├── models/      # Schémas MongoDB
│   ├── middlewares/ # Middlewares Express
│   ├── services/    # Services métier
│   ├── jobs/        # Bull queues et workers
│   ├── utils/       # Utilitaires
│   ├── docs/        # Documentation OpenAPI
│   ├── tests/       # Tests unitaires et intégration
│   ├── app.js       # Configuration Express
│   └── server.js    # Point d'entrée
├── scripts/         # Scripts de déploiement
├── infra/          # Infrastructure (Docker, K8s, Terraform)
└── uploads/        # Stockage des fichiers
```

## 🔌 Modules API

- **Auth** - Authentification JWT
- **Users** - Gestion des utilisateurs
- **Shops** - Gestion des boutiques/agriculteurs
- **Products** - Catalogue produits
- **Orders** - Gestion des commandes
- **Payments** - Intégration paiements
- **Drivers** - Gestion des livreurs
- **Admin** - Interface d'administration
- **Uploads** - Gestion des fichiers

## 🔒 Authentification

JWT Bearer Token. À passer en header:
```
Authorization: Bearer <token>
```

## 🗄️ Bases de Données

- **MongoDB** - Base de données principale
- **Redis** - Cache et queues (Bull)

## 📋 Scripts Disponibles

```bash
npm run dev          # Développement avec nodemon
npm run start        # Production
npm run migrate      # Migrations base de données
npm run seed         # Seeder les données
npm run test         # Lancer les tests
npm run test:watch   # Tests en mode watch
npm run lint         # Linter le code
npm run build        # Build pour production
```

## 🐳 Docker

### Démarrer tous les services
```bash
docker-compose up -d
```

### Voir les logs
```bash
docker-compose logs -f api
```

### Arrêter les services
```bash
docker-compose down
```

## 📚 Documentation API

- OpenAPI/Swagger: `docs/openapi.yaml`
- Collection Postman: `docs/postman_collection.json`

Accéder à Swagger UI: `http://localhost:3000/api/docs`

## 🧪 Tests

```bash
# Tous les tests
npm run test

# Tests unitaires
npm run test:unit

# Tests d'intégration
npm run test:integration

# Avec coverage
npm run test:coverage
```

## 📝 Variables d'Environnement

Voir `.env.example` pour la liste complète des variables requises.

Principales:
- `NODE_ENV` - Environnement (development, test, production)
- `PORT` - Port du serveur (défaut: 3000)
- `MONGODB_URI` - Connexion MongoDB
- `REDIS_HOST` - Host Redis
- `JWT_SECRET` - Clé secrète JWT

## 🚨 Gestion des Erreurs

L'API retourne des codes HTTP standards:
- `200` - Succès
- `201` - Ressource créée
- `400` - Erreur de validation
- `401` - Non authentifié
- `403` - Non autorisé
- `404` - Non trouvé
- `500` - Erreur serveur

## 🔄 CI/CD

À configurer avec:
- GitHub Actions / GitLab CI
- Tests automatiques
- Linting
- Build Docker
- Déploiement automatique

## 🛠️ Stack Technique

- **Runtime:** Node.js
- **Framework:** Express.js
- **Base de données:** MongoDB
- **Cache:** Redis
- **Queues:** Bull
- **Auth:** JWT (jsonwebtoken)
- **Validation:** Joi/Zod
- **Testing:** Jest
- **Logging:** Winston
- **API Docs:** OpenAPI/Swagger

## 📞 Support

Pour toute question ou bug, créer une issue GitHub.

## 📄 License

À définir

---

**Dernière mise à jour:** Novembre 2025
