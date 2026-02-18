# Améliorations API - Boutiques et Produits

## 🎯 Modifications apportées

### 1. Statut par défaut des boutiques changé en "active"

**Avant**: Les boutiques créées avaient le statut "pending" par défaut, donc invisibles publiquement.  
**Maintenant**: Les boutiques créées sont automatiquement **"active"** et visibles immédiatement.

#### Fichiers modifiés:
- `src/models/Shop.js` - Ligne 32: `default: 'active'`
- `src/api/shops/shops.controller.js` - Ligne 66: `status: status || 'active'`

---

### 2. Nouvelles routes pour les boutiques

#### **GET /api/shops/my-shops** 🔒 (Authentification requise)
Récupère toutes les boutiques de l'utilisateur connecté (pour le dashboard)

**Exemple:**
```javascript
GET https://jour-marche-api.onrender.com/api/shops/my-shops
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "name": "Ma Boutique",
      "logo": "https://...",
      "banner": "https://...",
      "status": "active",
      "category": { "name": "Alimentation", "slug": "alimentation" },
      "address": { "city": "Paris", ... },
      "stats": { "totalProducts": 10, "totalOrders": 50, ... }
    }
  ]
}
```

#### **GET /api/shops/:shopId** (Public)
Récupère une boutique spécifique par son ID

**Exemple:**
```javascript
GET https://jour-marche-api.onrender.com/api/shops/6995ed25788304948bb2f462

Response:
{
  "success": true,
  "data": {
    "_id": "6995ed25788304948bb2f462",
    "name": "La Criée Atlantique",
    "logo": "https://images.unsplash.com/...",
    "banner": "https://images.unsplash.com/...",
    "description": "Poissonnerie artisanale...",
    "owner": {
      "_id": "...",
      "firstName": "Hermane",
      "lastName": "Nguessan",
      "email": "hermane@example.com"
    },
    "category": { "name": "Poissons & Viandes", "slug": "poissons-viandes" },
    "address": {
      "street": "12 Port de Commerce",
      "city": "Rennes",
      "zipCode": "35000",
      "country": "France",
      "coordinates": { "type": "Point", "coordinates": [-1.6778, 48.1173] }
    },
    "contact": {
      "email": "contact@criee-atlantique.fr",
      "phone": "+33 2 99 12 34 56"
    },
    "deliveryRadius": 10,
    "deliveryFee": 8,
    "status": "active"
  }
}
```

#### **PUT /api/shops/:shopId** 🔒 (Authentification requise)
Met à jour une boutique (seulement si vous êtes le propriétaire)

**Exemple:**
```javascript
PUT https://jour-marche-api.onrender.com/api/shops/6995ed25788304948bb2f462
Authorization: Bearer <token>
Content-Type: application/json

{
  "description": "Nouvelle description",
  "deliveryFee": 10,
  "hours": {
    "monday": { "open": "09:00", "close": "18:00" }
  }
}

Response:
{
  "success": true,
  "message": "Boutique mise à jour avec succès",
  "data": { ... }
}
```

---

### 3. Nouvelles routes pour les produits

#### **GET /api/products/shop/:shopId** 🔒 (Authentification requise)
Récupère tous les produits d'une boutique (seulement si vous êtes le propriétaire)

**Exemple:**
```javascript
GET https://jour-marche-api.onrender.com/api/products/shop/6995ed25788304948bb2f462
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "name": "Saumon Atlantique Frais",
      "images": ["https://images.unsplash.com/..."],
      "price": 24.90,
      "quantity": 40,
      "unit": "kg",
      "status": "active",
      "category": { "name": "Poissons & Viandes" }
    }
  ]
}
```

#### **GET /api/products/:productId** (Public)
Récupère un produit spécifique par son ID

**Exemple:**
```javascript
GET https://jour-marche-api.onrender.com/api/products/69960123788304948bb2f567

Response:
{
  "success": true,
  "data": {
    "_id": "69960123788304948bb2f567",
    "name": "Saumon Atlantique Frais",
    "slug": "saumon-atlantique-frais",
    "description": "Saumon frais de l'Atlantique...",
    "images": [
      "https://images.unsplash.com/photo-1574781330855-d0db8cc6a79c?w=800",
      "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800"
    ],
    "price": 24.90,
    "quantity": 40,
    "unit": "kg",
    "status": "active",
    "shop": {
      "_id": "...",
      "name": "La Criée Atlantique",
      "logo": "https://...",
      "address": { "city": "Rennes" }
    },
    "category": { "name": "Poissons & Viandes" }
  }
}
```

#### **PUT /api/products/:productId** 🔒 (Authentification requise)
Met à jour un produit (seulement si vous êtes propriétaire de la boutique)

**Exemple:**
```javascript
PUT https://jour-marche-api.onrender.com/api/products/69960123788304948bb2f567
Authorization: Bearer <token>
Content-Type: application/json

{
  "price": 26.90,
  "quantity": 50,
  "status": "active"
}

Response:
{
  "success": true,
  "message": "Produit mis à jour avec succès",
  "data": { ... }
}
```

#### **DELETE /api/products/:productId** 🔒 (Authentification requise)
Supprime un produit (seulement si vous êtes propriétaire de la boutique)

**Exemple:**
```javascript
DELETE https://jour-marche-api.onrender.com/api/products/69960123788304948bb2f567
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Produit supprimé avec succès"
}
```

---

## 🚀 Utilisation dans le Frontend

### 1. Afficher toutes les boutiques actives (Page d'accueil)

```javascript
// GET /api/shops
const response = await fetch('https://jour-marche-api.onrender.com/api/shops');
const { data, pagination } = await response.json();

// Afficher chaque boutique
data.forEach(shop => {
  console.log(shop.name);        // Nom de la boutique
  console.log(shop.logo);        // URL du logo
  console.log(shop.banner);      // URL de la bannière
  console.log(shop.description); // Description
  console.log(shop.address.city); // Ville
});
```

### 2. Dashboard du propriétaire - Mes boutiques

```javascript
// GET /api/shops/my-shops
const response = await fetch('https://jour-marche-api.onrender.com/api/shops/my-shops', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const { data } = await response.json();

// Afficher les boutiques de l'utilisateur
data.forEach(shop => {
  console.log(`${shop.name}: ${shop.stats.totalProducts} produits`);
});
```

### 3. Dashboard - Produits de ma boutique

```javascript
// GET /api/products/shop/:shopId
const shopId = '6995ed25788304948bb2f462';
const response = await fetch(
  `https://jour-marche-api.onrender.com/api/products/shop/${shopId}`,
  {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
);
const { data } = await response.json();

// Afficher les produits
data.forEach(product => {
  console.log(`${product.name}: ${product.price}€`);
  console.log(`Images: ${product.images.length}`);
});
```

### 4. Créer une boutique (elle sera automatiquement active)

```javascript
// POST /api/shops
const response = await fetch('https://jour-marche-api.onrender.com/api/shops', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: "Ma Nouvelle Boutique",
    category: "698e0278e049def1e793e693", // ID de la catégorie
    description: "Description de ma boutique",
    logo: "https://images.unsplash.com/photo-1560493676-04071c5f467b?w=400",
    banner: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200",
    address: {
      street: "10 Rue du Commerce",
      city: "Paris",
      zipCode: "75001",
      country: "France",
      coordinates: {
        type: "Point",
        coordinates: [2.3522, 48.8566]
      }
    },
    contact: {
      email: "contact@maboutique.fr",
      phone: "+33 1 23 45 67 89"
    },
    deliveryRadius: 10,
    deliveryFee: 5,
    minimumOrder: 20
  })
});

const { data } = await response.json();
console.log("Boutique créée:", data.name);
console.log("Status:", data.status); // "active" automatiquement!
```

---

## 📋 Checklist Frontend

### Page Accueil / Catalogue
- [ ] Afficher la liste des boutiques avec logo, nom, ville
- [ ] Cliquer sur une boutique pour voir ses détails
- [ ] Afficher les produits d'une boutique sur sa page
- [ ] Afficher les images, prix, descriptions des produits

### Dashboard Propriétaire
- [ ] Voir "Mes Boutiques" (`GET /api/shops/my-shops`)
- [ ] Accéder au dashboard d'une boutique spécifique
- [ ] Voir les statistiques (totalProducts, totalOrders, totalRevenue)
- [ ] Modifier les informations de la boutique (`PUT /api/shops/:shopId`)

### Gestion Produits (Dashboard Boutique)
- [ ] Lister les produits de la boutique (`GET /api/products/shop/:shopId`)
- [ ] Créer un nouveau produit (`POST /api/products`)
- [ ] Modifier un produit existant (`PUT /api/products/:productId`)
- [ ] Supprimer un produit (`DELETE /api/products/:productId`)

---

## ✅ Résumé des améliorations

1. ✅ **Boutiques automatiquement actives** - Plus besoin d'approbation manuelle
2. ✅ **Routes dashboard propriétaire** - Accès facile aux boutiques et produits de l'utilisateur
3. ✅ **CRUD complet** - Création, lecture, mise à jour, suppression pour boutiques et produits
4. ✅ **Sécurité** - Vérification que seul le propriétaire peut modifier ses ressources
5. ✅ **Images et données complètes** - Tous les champs nécessaires (logo, banner, images, descriptions)

---

## 🔄 Déploiement

Pour déployer ces modifications sur Render:

```bash
git add .
git commit -m "feat: Add shop dashboard and product management endpoints"
git push origin main
```

Render déploiera automatiquement les modifications en 2-5 minutes.

---

**Date**: 18 février 2026  
**API Base URL**: https://jour-marche-api.onrender.com/api
