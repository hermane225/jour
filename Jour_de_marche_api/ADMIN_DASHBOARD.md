# 🎛️ Dashboard Admin - Documentation API

## Vue d'ensemble

Ce document présente toutes les routes API disponibles pour le **dashboard administrateur**. 
Le frontend du dashboard admin est séparé mais utilise la même API backend.

---

## 🔐 Authentification Admin

Toutes les routes admin nécessitent :
1. **Authentification JWT** - Token dans le header `Authorization: Bearer <token>`
2. **Rôle Admin** - L'utilisateur doit avoir `role: 'admin'`

### Vérifier le rôle

```javascript
// Lors de la connexion
const response = await fetch('https://jour-marche-api.onrender.com/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@example.com',
    password: 'password'
  })
});

const { data } = await response.json();
const token = data.token;
const role = data.user.role; // Doit être 'admin'

if (role === 'admin') {
  // Accès au dashboard admin
  localStorage.setItem('adminToken', token);
}
```

---

## 📊 Statistiques du Dashboard

### GET /api/admin/stats

Récupérer les statistiques globales de la plateforme.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Réponse:**
```json
{
  "success": true,
  "message": "Statistiques du tableau de bord",
  "data": {
    "totalUsers": 150,
    "totalOrders": 450,
    "totalRevenue": 125000,
    "ordersByStatus": [
      { "_id": "pending", "count": 25 },
      { "_id": "confirmed", "count": 50 },
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

## 👥 Gestion des Utilisateurs

### 1. GET /api/admin/users

Récupérer tous les utilisateurs avec filtres et pagination.

**Query Parameters:**
- `role` (optional) - Filtrer par rôle: `customer` ou `admin`
- `limit` (optional) - Nombre de résultats par page (défaut: 10)
- `skip` (optional) - Nombre de résultats à sauter (pagination)

**Exemple:**
```javascript
const response = await fetch(
  'https://jour-marche-api.onrender.com/api/admin/users?role=customer&limit=20&skip=0',
  {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  }
);
```

**Réponse:**
```json
{
  "success": true,
  "message": "Utilisateurs récupérés",
  "data": [
    {
      "_id": "user_id",
      "firstName": "Jean",
      "lastName": "Dupont",
      "email": "jean@example.com",
      "role": "customer",
      "status": "active",
      "createdAt": "2025-01-15T10:30:00.000Z"
    }
  ],
  "total": 145
}
```

---

### 2. PUT /api/admin/users/:userId/role

Modifier le rôle d'un utilisateur.

**Body:**
```json
{
  "role": "admin"
}
```

**Réponse:**
```json
{
  "success": true,
  "message": "Rôle utilisateur mis à jour",
  "data": {
    "_id": "user_id",
    "firstName": "Jean",
    "lastName": "Dupont",
    "email": "jean@example.com",
    "role": "admin"
  }
}
```

---

### 3. PUT /api/admin/users/:userId/status

Modifier le statut d'un utilisateur.

**Body:**
```json
{
  "status": "suspended"
}
```

**Valeurs possibles:** `active`, `inactive`, `suspended`, `deleted`

**Réponse:**
```json
{
  "success": true,
  "message": "Statut utilisateur mis à jour",
  "data": {
    "_id": "user_id",
    "status": "suspended"
  }
}
```

---

### 4. DELETE /api/admin/users/:userId

Supprimer un utilisateur.

**Réponse:**
```json
{
  "success": true,
  "message": "Utilisateur supprimé",
  "data": {
    "_id": "user_id",
    "email": "jean@example.com"
  }
}
```

---

## 🏪 Gestion des Boutiques

### 1. GET /api/admin/shops

Récupérer toutes les boutiques.

**Query Parameters:**
- `status` (optional) - Filtrer par statut: `active`, `inactive`, `suspended`, `pending`
- `limit` (optional) - Défaut: 10
- `skip` (optional) - Pour pagination

**Réponse:**
```json
{
  "success": true,
  "message": "Boutiques récupérées",
  "data": [
    {
      "_id": "shop_id",
      "name": "Le Potager de Marie",
      "slug": "le-potager-de-marie",
      "logo": "https://...",
      "status": "active",
      "owner": {
        "_id": "user_id",
        "firstName": "Marie",
        "lastName": "Dubois",
        "email": "marie@example.com"
      },
      "createdAt": "2025-01-10T08:00:00.000Z"
    }
  ],
  "total": 25
}
```

---

### 2. PUT /api/admin/shops/:shopId/status

Modifier le statut d'une boutique.

**Body:**
```json
{
  "status": "active"
}
```

**Valeurs possibles:** `active`, `inactive`, `suspended`, `pending`

**Réponse:**
```json
{
  "success": true,
  "message": "Statut boutique mis à jour",
  "data": {
    "_id": "shop_id",
    "name": "Le Potager de Marie",
    "status": "active"
  }
}
```

---

### 3. DELETE /api/admin/shops/:shopId

Supprimer une boutique.

**Réponse:**
```json
{
  "success": true,
  "message": "Boutique supprimée",
  "data": {
    "_id": "shop_id",
    "name": "Le Potager de Marie"
  }
}
```

---

## 📦 Gestion des Produits

### 1. GET /api/admin/products

Récupérer tous les produits.

**Query Parameters:**
- `status` (optional) - Filtrer par statut: `active`, `inactive`, `discontinued`
- `limit` (optional) - Défaut: 20
- `skip` (optional) - Pour pagination

**Réponse:**
```json
{
  "success": true,
  "message": "Produits récupérés",
  "data": [
    {
      "_id": "product_id",
      "name": "Tomates fraîches",
      "slug": "tomates-fraiches",
      "price": 2500,
      "quantity": 100,
      "images": ["https://..."],
      "status": "active",
      "shop": {
        "_id": "shop_id",
        "name": "Le Potager de Marie",
        "logo": "https://..."
      },
      "category": {
        "_id": "cat_id",
        "name": "Fruits & Légumes"
      }
    }
  ],
  "total": 250
}
```

---

### 2. DELETE /api/admin/products/:productId

Supprimer un produit.

**Réponse:**
```json
{
  "success": true,
  "message": "Produit supprimé",
  "data": {
    "_id": "product_id",
    "name": "Tomates fraîches"
  }
}
```

---

## 📋 Gestion des Commandes

### 1. GET /api/admin/orders

Récupérer toutes les commandes.

**Query Parameters:**
- `status` (optional) - Filtrer par statut
- `limit` (optional) - Défaut: 20
- `skip` (optional) - Pour pagination

**Statuts possibles:**
- `pending` - En attente
- `confirmed` - Confirmée
- `preparing` - En préparation
- `ready` - Prête
- `delivering` - En livraison
- `delivered` - Livrée
- `cancelled` - Annulée

**Réponse:**
```json
{
  "success": true,
  "message": "Commandes récupérées",
  "data": [
    {
      "_id": "order_id",
      "orderNumber": "ORD-20250215-001",
      "status": "confirmed",
      "total": 5000,
      "customer": {
        "_id": "user_id",
        "firstName": "Jean",
        "lastName": "Dupont",
        "email": "jean@example.com",
        "phone": "+33 6 12 34 56 78"
      },
      "shop": {
        "_id": "shop_id",
        "name": "Le Potager de Marie",
        "logo": "https://..."
      },
      "createdAt": "2025-02-15T10:00:00.000Z"
    }
  ],
  "total": 450
}
```

---

### 2. PUT /api/admin/orders/:orderId/status

Modifier le statut d'une commande.

**Body:**
```json
{
  "status": "delivering"
}
```

**Réponse:**
```json
{
  "success": true,
  "message": "Statut commande mis à jour",
  "data": {
    "_id": "order_id",
    "orderNumber": "ORD-20250215-001",
    "status": "delivering"
  }
}
```

---

## ⚙️ Paramètres de la Plateforme

### 1. GET /api/admin/settings

Récupérer tous les paramètres de la plateforme.

**Réponse:**
```json
{
  "success": true,
  "message": "Paramètres récupérés",
  "data": {
    "commission_rate": 0.15,
    "min_order_amount": 1000,
    "max_delivery_distance": 50,
    "platform_name": "Jour de Marché",
    "support_email": "support@jourmarche.com"
  }
}
```

---

### 2. PUT /api/admin/settings

Mettre à jour un paramètre.

**Body:**
```json
{
  "key": "commission_rate",
  "value": 0.12
}
```

**Réponse:**
```json
{
  "success": true,
  "message": "Paramètre mis à jour",
  "data": {
    "key": "commission_rate",
    "value": 0.12
  }
}
```

---

## 📢 Notifications

### POST /api/admin/notify

Envoyer une notification à plusieurs utilisateurs.

**Body:**
```json
{
  "userIds": ["user_id_1", "user_id_2"],
  "title": "Nouvelle fonctionnalité",
  "message": "Découvrez notre nouveau système de panier !",
  "type": "info"
}
```

**Types:** `info`, `warning`, `error`, `success`

**Réponse:**
```json
{
  "success": true,
  "message": "Notification envoyée",
  "data": {
    "recipientCount": 2,
    "title": "Nouvelle fonctionnalité",
    "type": "info"
  }
}
```

---

## 📊 Exemple d'intégration Frontend

### Composant Dashboard Admin (React)

```javascript
import { useEffect, useState } from 'react';

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const adminToken = localStorage.getItem('adminToken');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const response = await fetch(
      'https://jour-marche-api.onrender.com/api/admin/stats',
      {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      }
    );
    const data = await response.json();
    setStats(data.data);
  };

  if (!stats) return <div>Chargement...</div>;

  return (
    <div className="dashboard">
      <h1>Dashboard Admin</h1>
      <div className="stats-cards">
        <div className="card">
          <h3>Utilisateurs</h3>
          <p>{stats.totalUsers}</p>
        </div>
        <div className="card">
          <h3>Commandes</h3>
          <p>{stats.totalOrders}</p>
        </div>
        <div className="card">
          <h3>Revenu Total</h3>
          <p>{stats.totalRevenue} FCFA</p>
        </div>
      </div>
    </div>
  );
}
```

### Gestion des Utilisateurs

```javascript
function UserManagement() {
  const [users, setUsers] = useState([]);
  const adminToken = localStorage.getItem('adminToken');

  const fetchUsers = async () => {
    const response = await fetch(
      'https://jour-marche-api.onrender.com/api/admin/users?limit=50',
      {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      }
    );
    const data = await response.json();
    setUsers(data.data);
  };

  const updateUserStatus = async (userId, newStatus) => {
    await fetch(
      `https://jour-marche-api.onrender.com/api/admin/users/${userId}/status`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ status: newStatus })
      }
    );
    fetchUsers(); // Recharger la liste
  };

  return (
    <div className="user-management">
      <h2>Gestion des Utilisateurs</h2>
      <table>
        <thead>
          <tr>
            <th>Nom</th>
            <th>Email</th>
            <th>Rôle</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user._id}>
              <td>{user.firstName} {user.lastName}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>{user.status}</td>
              <td>
                <button onClick={() => updateUserStatus(user._id, 'suspended')}>
                  Suspendre
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## 🔒 Sécurité

### Protection des routes

```javascript
// Middleware frontend pour vérifier le rôle admin
const useAdminAuth = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
    }
  }, [user, navigate]);
};

// Utilisation
function AdminRoute() {
  useAdminAuth();
  return <AdminDashboard />;
}
```

---

## 📈 Résumé des Routes Admin

| Catégorie | Route | Méthode | Description |
|-----------|-------|---------|-------------|
| **Stats** | `/api/admin/stats` | GET | Statistiques dashboard |
| **Users** | `/api/admin/users` | GET | Liste utilisateurs |
| **Users** | `/api/admin/users/:id/role` | PUT | Modifier rôle |
| **Users** | `/api/admin/users/:id/status` | PUT | Modifier statut |
| **Users** | `/api/admin/users/:id` | DELETE | Supprimer |
| **Shops** | `/api/admin/shops` | GET | Liste boutiques |
| **Shops** | `/api/admin/shops/:id/status` | PUT | Modifier statut |
| **Shops** | `/api/admin/shops/:id` | DELETE | Supprimer |
| **Products** | `/api/admin/products` | GET | Liste produits |
| **Products** | `/api/admin/products/:id` | DELETE | Supprimer |
| **Orders** | `/api/admin/orders` | GET | Liste commandes |
| **Orders** | `/api/admin/orders/:id/status` | PUT | Modifier statut |
| **Settings** | `/api/admin/settings` | GET | Récupérer paramètres |
| **Settings** | `/api/admin/settings` | PUT | Mettre à jour |
| **Notify** | `/api/admin/notify` | POST | Envoyer notification |

---

## ✅ Checklist Implémentation Frontend

- [ ] Créer page de connexion admin
- [ ] Protéger les routes avec `role === 'admin'`
- [ ] Implémenter dashboard avec statistiques
- [ ] Créer page gestion utilisateurs
- [ ] Créer page gestion boutiques
- [ ] Créer page gestion produits
- [ ] Créer page gestion commandes
- [ ] Implémenter système de notifications
- [ ] Ajouter gestion des paramètres
- [ ] Tester toutes les actions CRUD

---

## 📞 Support

Pour toute question sur l'intégration :
- Documentation complète : `/CART_SYSTEM.md`
- API Base URL : `https://jour-marche-api.onrender.com/api`
