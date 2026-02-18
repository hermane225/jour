# 🔌 API Routes - Documentation Complète pour Frontend

**Base URL:** `https://jour-marche-api.onrender.com/api`

---

## 📋 Table des matières

1. [Authentification](#authentification)
2. [Profil Utilisateur](#profil-utilisateur)
3. [Catégories](#catégories)
4. [Boutiques](#boutiques)
5. [Produits](#produits)
6. [Panier](#panier)
7. [Commandes](#commandes)
8. [Paiements](#paiements)
9. [Uploads](#uploads)
10. [Admin (Dashboard)](#admin-dashboard)
11. [Drivers/Livreurs](#driverslivreurs)

---

## 🔐 Authentification

### 1. Inscription
```http
POST /api/auth/register
Content-Type: application/json
```

**Body:**
```json
{
  "firstName": "Jean",
  "lastName": "Dupont",
  "email": "jean@example.com",
  "password": "Password123",
  "phone": "+33 6 12 34 56 78"
}
```

**Réponse:**
```json
{
  "success": true,
  "message": "Utilisateur créé avec succès",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user_id",
      "firstName": "Jean",
      "lastName": "Dupont",
      "email": "jean@example.com",
      "role": "customer"
    }
  }
}
```

---

### 2. Connexion
```http
POST /api/auth/login
Content-Type: application/json
```

**Body:**
```json
{
  "email": "jean@example.com",
  "password": "Password123"
}
```

**Réponse:**
```json
{
  "success": true,
  "message": "Connexion réussie",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user_id",
      "firstName": "Jean",
      "lastName": "Dupont",
      "email": "jean@example.com",
      "role": "customer"
    }
  }
}
```

---

### 3. Mot de passe oublié
```http
POST /api/auth/forgot-password
Content-Type: application/json
```

**Body:**
```json
{
  "email": "jean@example.com"
}
```

---

### 4. Réinitialiser le mot de passe
```http
POST /api/auth/reset-password/:token
Content-Type: application/json
```

**Body:**
```json
{
  "password": "NewPassword123"
}
```

---

## 👤 Profil Utilisateur

### 1. Obtenir le profil de l'utilisateur connecté
```http
GET /api/users/profile
Authorization: Bearer <token>
```

**Réponse:**
```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "firstName": "Jean",
    "lastName": "Dupont",
    "email": "jean@example.com",
    "phone": "+33 6 12 34 56 78",
    "role": "customer",
    "status": "active",
    "avatar": "https://...",
    "address": {
      "street": "123 Rue de la Paix",
      "city": "Paris",
      "zipCode": "75001",
      "country": "France"
    },
    "preferences": {
      "notifications": {
        "email": true,
        "sms": true,
        "push": true
      },
      "language": "fr"
    }
  }
}
```

---

### 2. Mettre à jour le profil
```http
PUT /api/users/profile
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "firstName": "Jean",
  "lastName": "Martin",
  "phone": "+33 6 98 76 54 32"
}
```

---

### 3. Mettre à jour l'adresse
```http
PUT /api/users/address
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "street": "456 Avenue des Champs",
  "city": "Lyon",
  "zipCode": "69001",
  "country": "France",
  "latitude": 45.7640,
  "longitude": 4.8357
}
```

---

### 4. Mettre à jour les préférences
```http
PUT /api/users/preferences
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "notifications": {
    "email": true,
    "sms": false,
    "push": true
  },
  "language": "fr"
}
```

---

### 5. Supprimer le compte
```http
DELETE /api/users/account
Authorization: Bearer <token>
```

---

## 📂 Catégories

### 1. Obtenir toutes les catégories
```http
GET /api/categories
```

**Réponse:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "cat_id",
      "name": "Fruits & Légumes",
      "slug": "fruits-legumes",
      "description": "Produits frais",
      "icon": "🥬",
      "image": "https://..."
    }
  ]
}
```

---

### 2. Obtenir une catégorie par ID
```http
GET /api/categories/:categoryId
```

---

### 3. Créer une catégorie (Admin)
```http
POST /api/categories
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Boulangerie",
  "description": "Pain et viennoiseries",
  "icon": "🥖"
}
```

---

## 🏪 Boutiques

### 1. Obtenir toutes les boutiques
```http
GET /api/shops
```

**Query Parameters:**
- `page` (optional) - Numéro de page (défaut: 1)
- `limit` (optional) - Nombre par page (défaut: 10)
- `category` (optional) - Filtrer par catégorie ID
- `search` (optional) - Recherche par nom

**Réponse:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "shop_id",
      "name": "Le Potager de Marie",
      "slug": "le-potager-de-marie",
      "logo": "https://...",
      "banner": "https://...",
      "description": "Fruits et légumes bio",
      "category": {
        "_id": "cat_id",
        "name": "Fruits & Légumes"
      },
      "address": {
        "street": "18 Chemin des Vergers",
        "city": "Bordeaux",
        "zipCode": "33000"
      },
      "contact": {
        "email": "contact@potager.fr",
        "phone": "+33 4 78 12 34 56"
      },
      "hours": {
        "monday": { "open": "08:00", "close": "19:00" }
      },
      "deliveryOptions": ["livraison locale", "retrait en magasin"],
      "rating": 4.5,
      "status": "active"
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "pages": 3
  }
}
```

---

### 2. Obtenir une boutique par ID
```http
GET /api/shops/:shopId
```

---

### 3. Obtenir une boutique par slug
```http
GET /api/shops/slug/:slug
```

**Exemple:** `GET /api/shops/slug/le-potager-de-marie`

---

### 4. Créer une boutique
```http
POST /api/shops
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Ma Boutique",
  "category": "cat_id",
  "description": "Description de ma boutique",
  "logo": "https://...",
  "banner": "https://...",
  "address": {
    "street": "123 Rue Example",
    "city": "Paris",
    "zipCode": "75001",
    "country": "France",
    "coordinates": {
      "type": "Point",
      "coordinates": [2.3522, 48.8566]
    }
  },
  "contact": {
    "email": "contact@shop.com",
    "phone": "+33 1 23 45 67 89"
  },
  "hours": {
    "monday": { "open": "09:00", "close": "18:00" }
  },
  "deliveryOptions": ["livraison locale"]
}
```

---

### 5. Obtenir mes boutiques
```http
GET /api/shops/my-shops
Authorization: Bearer <token>
```

**Réponse:** Liste des boutiques appartenant à l'utilisateur connecté

---

### 6. Mettre à jour une boutique
```http
PUT /api/shops/:shopId
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:** Mêmes champs que la création

---

### 7. Supprimer une boutique
```http
DELETE /api/shops/:shopId
Authorization: Bearer <token>
```

---

## 📦 Produits

### 1. Obtenir tous les produits
```http
GET /api/products
```

**Query Parameters:**
- `page` (optional) - Numéro de page
- `limit` (optional) - Nombre par page
- `category` (optional) - Filtrer par catégorie
- `shop` (optional) - Filtrer par boutique
- `search` (optional) - Recherche par nom
- `minPrice` (optional) - Prix minimum
- `maxPrice` (optional) - Prix maximum

**Réponse:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "product_id",
      "name": "Tomates fraîches",
      "slug": "tomates-fraiches",
      "description": "Tomates bio du jardin",
      "price": 2500,
      "images": ["https://..."],
      "category": {
        "_id": "cat_id",
        "name": "Fruits & Légumes"
      },
      "shop": {
        "_id": "shop_id",
        "name": "Le Potager de Marie",
        "logo": "https://..."
      },
      "quantity": 100,
      "unit": "kg",
      "status": "active"
    }
  ],
  "pagination": {
    "total": 250,
    "page": 1,
    "limit": 20,
    "pages": 13
  }
}
```

---

### 2. Obtenir un produit par ID
```http
GET /api/products/:productId
```

---

### 3. Obtenir les produits d'une boutique
```http
GET /api/products/shop/:shopId
```

---

### 4. Créer un produit
```http
POST /api/products
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Tomates fraîches",
  "description": "Tomates bio du jardin",
  "shop": "shop_id",
  "category": "cat_id",
  "price": 2500,
  "quantity": 100,
  "unit": "kg",
  "images": ["https://..."],
  "variants": [
    {
      "name": "Taille",
      "options": ["Petit", "Moyen", "Grand"]
    }
  ]
}
```

---

### 5. Mettre à jour un produit
```http
PUT /api/products/:productId
Authorization: Bearer <token>
Content-Type: application/json
```

---

### 6. Supprimer un produit
```http
DELETE /api/products/:productId
Authorization: Bearer <token>
```

---

## 🛒 Panier

### 1. Obtenir le panier
```http
GET /api/carts
Authorization: Bearer <token>
```

**Réponse:**
```json
{
  "success": true,
  "data": {
    "id": "cart_id",
    "items": [
      {
        "id": "item_id",
        "product": {
          "_id": "product_id",
          "name": "Tomates fraîches",
          "price": 2500,
          "images": ["https://..."],
          "shop": {
            "name": "Le Potager de Marie",
            "logo": "https://..."
          }
        },
        "quantity": 3,
        "selectedVariants": {
          "size": "Moyen"
        },
        "priceAtAdd": 2500,
        "subtotal": 7500
      }
    ],
    "deliveryFee": 1500,
    "totalAmount": 9000,
    "itemsTotal": 7500,
    "itemsCount": 3
  }
}
```

---

### 2. Ajouter un article au panier
```http
POST /api/carts/items
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "productId": "product_id",
  "quantity": 2,
  "selectedVariants": {
    "size": "Moyen",
    "color": "Rouge"
  }
}
```

---

### 3. Modifier la quantité d'un article
```http
PUT /api/carts/items/:itemId
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "quantity": 5
}
```

---

### 4. Retirer un article du panier
```http
DELETE /api/carts/items/:itemId
Authorization: Bearer <token>
```

---

### 5. Mettre à jour les frais de livraison
```http
PUT /api/carts/delivery-fee
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "deliveryFee": 1500
}
```

---

### 6. Vider le panier
```http
DELETE /api/carts
Authorization: Bearer <token>
```

---

### 7. Fusionner le panier invité
```http
POST /api/carts/merge
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "guestItems": [
    {
      "productId": "product_id",
      "quantity": 2,
      "selectedVariants": {
        "size": "Moyen"
      }
    }
  ]
}
```

---

## 📋 Commandes

### 1. Obtenir toutes mes commandes
```http
GET /api/orders
Authorization: Bearer <token>
```

**Query Parameters:**
- `status` (optional) - Filtrer par statut
- `page` (optional) - Pagination
- `limit` (optional) - Nombre par page

**Réponse:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "order_id",
      "orderNumber": "ORD-20260218-001",
      "status": "confirmed",
      "total": 9000,
      "items": [
        {
          "product": {
            "name": "Tomates fraîches",
            "images": ["https://..."]
          },
          "quantity": 3,
          "price": 2500
        }
      ],
      "deliveryAddress": {
        "street": "123 Rue Example",
        "city": "Paris"
      },
      "deliveryFee": 1500,
      "createdAt": "2026-02-18T10:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 10,
    "page": 1,
    "pages": 1
  }
}
```

---

### 2. Obtenir une commande par ID
```http
GET /api/orders/:orderId
Authorization: Bearer <token>
```

---

### 3. Créer une commande
```http
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "items": [
    {
      "product": "product_id",
      "quantity": 3,
      "price": 2500
    }
  ],
  "deliveryAddress": {
    "street": "123 Rue Example",
    "city": "Paris",
    "zipCode": "75001",
    "country": "France"
  },
  "deliveryFee": 1500,
  "paymentMethod": "card"
}
```

---

### 4. Annuler une commande
```http
PUT /api/orders/:orderId/cancel
Authorization: Bearer <token>
```

---

### 5. Obtenir les commandes d'une boutique
```http
GET /api/orders/shop/:shopId
Authorization: Bearer <token>
```

---

## 💳 Paiements

### 1. Créer un paiement
```http
POST /api/payments
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "orderId": "order_id",
  "amount": 9000,
  "method": "card",
  "cardDetails": {
    "number": "4242424242424242",
    "expMonth": "12",
    "expYear": "2027",
    "cvc": "123"
  }
}
```

---

### 2. Vérifier le statut d'un paiement
```http
GET /api/payments/:paymentId
Authorization: Bearer <token>
```

---

## 📤 Uploads

### 1. Upload une image
```http
POST /api/uploads
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**
- `file` - Le fichier à uploader

**Réponse:**
```json
{
  "success": true,
  "data": {
    "url": "https://cloudinary.com/.../image.jpg",
    "publicId": "uploads/xyz123"
  }
}
```

---

### 2. Supprimer une image
```http
DELETE /api/uploads/:publicId
Authorization: Bearer <token>
```

---

## 🎛️ Admin (Dashboard)

**Note:** Toutes les routes admin nécessitent `role: 'admin'`

### 1. Statistiques Dashboard
```http
GET /api/admin/stats
Authorization: Bearer <admin_token>
```

**Réponse:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 150,
    "totalOrders": 450,
    "totalRevenue": 125000,
    "ordersByStatus": [
      { "_id": "pending", "count": 25 },
      { "_id": "delivered", "count": 300 }
    ],
    "usersByRole": [
      { "_id": "customer", "count": 145 },
      { "_id": "admin", "count": 5 }
    ]
  }
}
```

---

### 2. Gestion Utilisateurs

#### Lister tous les utilisateurs
```http
GET /api/admin/users
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `role` (optional) - customer ou admin
- `limit` (optional) - Défaut: 10
- `skip` (optional) - Pour pagination

---

#### Modifier le rôle d'un utilisateur
```http
PUT /api/admin/users/:userId/role
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Body:**
```json
{
  "role": "admin"
}
```

---

#### Modifier le statut d'un utilisateur
```http
PUT /api/admin/users/:userId/status
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Body:**
```json
{
  "status": "suspended"
}
```

**Statuts:** `active`, `inactive`, `suspended`, `deleted`

---

#### Supprimer un utilisateur
```http
DELETE /api/admin/users/:userId
Authorization: Bearer <admin_token>
```

---

### 3. Gestion Boutiques

#### Lister toutes les boutiques
```http
GET /api/admin/shops
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `status` (optional) - active, inactive, suspended, pending
- `limit` (optional)
- `skip` (optional)

---

#### Modifier le statut d'une boutique
```http
PUT /api/admin/shops/:shopId/status
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Body:**
```json
{
  "status": "active"
}
```

---

#### Supprimer une boutique
```http
DELETE /api/admin/shops/:shopId
Authorization: Bearer <admin_token>
```

---

### 4. Gestion Produits

#### Lister tous les produits
```http
GET /api/admin/products
Authorization: Bearer <admin_token>
```

---

#### Supprimer un produit
```http
DELETE /api/admin/products/:productId
Authorization: Bearer <admin_token>
```

---

### 5. Gestion Commandes

#### Lister toutes les commandes
```http
GET /api/admin/orders
Authorization: Bearer <admin_token>
```

---

#### Modifier le statut d'une commande
```http
PUT /api/admin/orders/:orderId/status
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Body:**
```json
{
  "status": "delivering"
}
```

**Statuts:** `pending`, `confirmed`, `preparing`, `ready`, `delivering`, `delivered`, `cancelled`

---

### 6. Paramètres

#### Obtenir les paramètres
```http
GET /api/admin/settings
Authorization: Bearer <admin_token>
```

---

#### Mettre à jour un paramètre
```http
PUT /api/admin/settings
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Body:**
```json
{
  "key": "commission_rate",
  "value": 0.15
}
```

---

### 7. Notifications

#### Envoyer une notification
```http
POST /api/admin/notify
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Body:**
```json
{
  "userIds": ["user_id_1", "user_id_2"],
  "title": "Nouvelle fonctionnalité",
  "message": "Découvrez notre nouveau système !",
  "type": "info"
}
```

**Types:** `info`, `warning`, `error`, `success`

---

## 🚗 Drivers/Livreurs

### 1. Obtenir tous les livreurs
```http
GET /api/drivers
Authorization: Bearer <token>
```

---

### 2. Obtenir un livreur par ID
```http
GET /api/drivers/:driverId
Authorization: Bearer <token>
```

---

### 3. Créer un profil livreur
```http
POST /api/drivers
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "vehicleType": "moto",
  "vehicleNumber": "AB-123-CD",
  "licenseNumber": "123456789"
}
```

---

### 4. Mettre à jour le statut (disponible/occupé)
```http
PUT /api/drivers/:driverId/status
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "status": "available"
}
```

---

## 📱 Exemple d'intégration Frontend

### React/Next.js avec Axios

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://jour-marche-api.onrender.com/api',
});

// Ajouter le token à chaque requête
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Exemples d'utilisation

// 1. Connexion
export const login = async (email, password) => {
  const { data } = await api.post('/auth/login', { email, password });
  localStorage.setItem('token', data.data.token);
  return data;
};

// 2. Obtenir le profil
export const getProfile = async () => {
  const { data } = await api.get('/users/profile');
  return data.data;
};

// 3. Obtenir le panier
export const getCart = async () => {
  const { data } = await api.get('/carts');
  return data.data;
};

// 4. Ajouter au panier
export const addToCart = async (productId, quantity, variants) => {
  const { data } = await api.post('/carts/items', {
    productId,
    quantity,
    selectedVariants: variants,
  });
  return data.data;
};

// 5. Obtenir les boutiques
export const getShops = async (params = {}) => {
  const { data } = await api.get('/shops', { params });
  return data;
};

// 6. Obtenir les produits
export const getProducts = async (params = {}) => {
  const { data } = await api.get('/products', { params });
  return data;
};

// 7. Créer une commande
export const createOrder = async (orderData) => {
  const { data } = await api.post('/orders', orderData);
  return data.data;
};

// 8. Admin - Obtenir les stats
export const getAdminStats = async () => {
  const { data } = await api.get('/admin/stats');
  return data.data;
};
```

---

### Vanilla JavaScript avec Fetch

```javascript
const API_URL = 'https://jour-marche-api.onrender.com/api';

// Helper pour les requêtes
async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };
  
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_URL}${endpoint}`, config);
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.message || 'Une erreur est survenue');
  }
  
  return data;
}

// Exemples d'utilisation

// Connexion
async function login(email, password) {
  const data = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  
  localStorage.setItem('token', data.data.token);
  return data.data.user;
}

// Obtenir les boutiques
async function getShops(page = 1, limit = 10) {
  const data = await apiRequest(`/shops?page=${page}&limit=${limit}`);
  return data.data;
}

// Ajouter au panier
async function addToCart(productId, quantity) {
  const data = await apiRequest('/carts/items', {
    method: 'POST',
    body: JSON.stringify({ productId, quantity }),
  });
  return data.data;
}
```

---

## 🔑 Gestion des Tokens

### Sauvegarder le token après connexion
```javascript
// Après login/register
localStorage.setItem('token', data.data.token);
localStorage.setItem('userId', data.data.user.id);
localStorage.setItem('userRole', data.data.user.role);
```

### Vérifier si l'utilisateur est connecté
```javascript
const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token;
};
```

### Vérifier si l'utilisateur est admin
```javascript
const isAdmin = () => {
  const role = localStorage.getItem('userRole');
  return role === 'admin';
};
```

### Déconnexion
```javascript
const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
  localStorage.removeItem('userRole');
  // Rediriger vers la page de connexion
  window.location.href = '/login';
};
```

---

## ⚠️ Gestion des Erreurs

### Codes HTTP courants
- `200` - Succès
- `201` - Créé avec succès
- `400` - Erreur de validation
- `401` - Non authentifié
- `403` - Non autorisé (pas les permissions)
- `404` - Ressource non trouvée
- `500` - Erreur serveur

### Format des erreurs
```json
{
  "success": false,
  "message": "Message d'erreur",
  "error": "Détails de l'erreur"
}
```

### Exemple de gestion
```javascript
try {
  const data = await api.get('/users/profile');
  // Traiter les données
} catch (error) {
  if (error.response) {
    // Erreur de l'API
    if (error.response.status === 401) {
      // Token expiré, rediriger vers login
      logout();
    } else {
      console.error(error.response.data.message);
    }
  } else {
    // Erreur réseau
    console.error('Erreur réseau');
  }
}
```

---

## 📊 Résumé des Routes

### Routes Publiques (sans auth)
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password/:token`
- `GET /api/categories`
- `GET /api/categories/:categoryId`
- `GET /api/shops`
- `GET /api/shops/:shopId`
- `GET /api/shops/slug/:slug`
- `GET /api/products`
- `GET /api/products/:productId`

### Routes Utilisateur (auth requise)
- `GET /api/users/profile`
- `PUT /api/users/profile`
- `PUT /api/users/address`
- `PUT /api/users/preferences`
- `DELETE /api/users/account`
- `GET /api/carts`
- `POST /api/carts/items`
- `PUT /api/carts/items/:itemId`
- `DELETE /api/carts/items/:itemId`
- `PUT /api/carts/delivery-fee`
- `DELETE /api/carts`
- `POST /api/carts/merge`
- `GET /api/orders`
- `GET /api/orders/:orderId`
- `POST /api/orders`
- `PUT /api/orders/:orderId/cancel`
- `POST /api/shops`
- `GET /api/shops/my-shops`
- `PUT /api/shops/:shopId`
- `DELETE /api/shops/:shopId`
- `POST /api/products`
- `PUT /api/products/:productId`
- `DELETE /api/products/:productId`

### Routes Admin (auth + role admin)
- `GET /api/admin/stats`
- `GET /api/admin/users`
- `PUT /api/admin/users/:userId/role`
- `PUT /api/admin/users/:userId/status`
- `DELETE /api/admin/users/:userId`
- `GET /api/admin/shops`
- `PUT /api/admin/shops/:shopId/status`
- `DELETE /api/admin/shops/:shopId`
- `GET /api/admin/products`
- `DELETE /api/admin/products/:productId`
- `GET /api/admin/orders`
- `PUT /api/admin/orders/:orderId/status`
- `GET /api/admin/settings`
- `PUT /api/admin/settings`
- `POST /api/admin/notify`

---

## 🎯 Checklist Intégration

### Frontend Client
- [ ] Système d'authentification (login/register)
- [ ] Page profil utilisateur
- [ ] Liste des boutiques avec filtres
- [ ] Page détail boutique
- [ ] Liste des produits avec filtres
- [ ] Page détail produit
- [ ] Système de panier
- [ ] Processus de commande
- [ ] Historique des commandes

### Frontend Admin
- [ ] Connexion admin
- [ ] Dashboard avec statistiques
- [ ] Gestion des utilisateurs
- [ ] Gestion des boutiques
- [ ] Gestion des produits
- [ ] Gestion des commandes
- [ ] Paramètres de la plateforme

---

**API Base URL:** `https://jour-marche-api.onrender.com/api`

**Documentation complète disponible dans:**
- [SYSTEM_SUMMARY.md](./SYSTEM_SUMMARY.md)
- [ADMIN_DASHBOARD.md](./ADMIN_DASHBOARD.md)
- [USER_PROFILE.md](./USER_PROFILE.md)
- [CART_SYSTEM.md](./CART_SYSTEM.md)
