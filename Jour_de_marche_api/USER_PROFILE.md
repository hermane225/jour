# 👤 Profil Utilisateur Unique - Documentation

## Vue d'ensemble

Chaque utilisateur a un profil unique identifié par son `_id` MongoDB. Le système garantit :
- **1 utilisateur = 1 profil** - Profil unique par compte
- **1 utilisateur = 1 panier** - Panier isolé automatiquement
- **Isolation complète** - Changement d'utilisateur = nouveau profil/panier

---

## 🔐 Concept d'isolation

### Fonctionnement

```
┌─────────────────────────────────────────┐
│         Utilisateur A connecté          │
│  - Profil A (données personnelles)     │
│  - Panier A (articles en cours)        │
│  - Boutiques A (si propriétaire)       │
│  - Commandes A (historique)            │
└─────────────────────────────────────────┘

           ⬇️  Déconnexion / Connexion

┌─────────────────────────────────────────┐
│         Utilisateur B connecté          │
│  - Profil B (différent de A)           │
│  - Panier B (vide ou avec items de B)  │
│  - Boutiques B (si propriétaire)       │
│  - Commandes B (historique)            │
└─────────────────────────────────────────┘
```

---

## 📋 Modèle Utilisateur

### Structure du profil

```javascript
{
  "_id": "user_id_unique",
  "firstName": "Jean",
  "lastName": "Dupont",
  "email": "jean@example.com",       // Unique
  "phone": "+33 6 12 34 56 78",
  "role": "customer",                // ou "admin"
  "status": "active",                // active, inactive, suspended, deleted
  "avatar": "https://...",
  "address": {
    "street": "123 Rue de la Paix",
    "city": "Paris",
    "zipCode": "75001",
    "country": "France",
    "latitude": 48.8566,
    "longitude": 2.3522
  },
  "isVerified": true,
  "preferences": {
    "notifications": {
      "email": true,
      "sms": true,
      "push": true
    },
    "language": "fr"
  },
  "lastLogin": "2025-02-18T10:30:00.000Z",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-02-18T10:30:00.000Z"
}
```

---

## 🔌 Routes API - Profil Utilisateur

### 1. GET /api/users/profile

**Récupérer le profil de l'utilisateur connecté** (profil unique)

```javascript
const token = localStorage.getItem('token');

const response = await fetch('https://jour-marche-api.onrender.com/api/users/profile', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const data = await response.json();
console.log(data.data); // Profil unique de l'utilisateur
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
    },
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

---

### 2. PUT /api/users/profile

**Mettre à jour le profil**

```javascript
const response = await fetch('https://jour-marche-api.onrender.com/api/users/profile', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    firstName: 'Jean',
    lastName: 'Martin',
    phone: '+33 6 98 76 54 32'
  })
});
```

**Réponse:**
```json
{
  "success": true,
  "message": "Profil mis à jour avec succès",
  "data": {
    "_id": "user_id",
    "firstName": "Jean",
    "lastName": "Martin",
    "phone": "+33 6 98 76 54 32"
  }
}
```

---

### 3. PUT /api/users/address

**Mettre à jour l'adresse**

```javascript
await fetch('https://jour-marche-api.onrender.com/api/users/address', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    street: '456 Avenue des Champs',
    city: 'Lyon',
    zipCode: '69001',
    country: 'France',
    latitude: 45.7640,
    longitude: 4.8357
  })
});
```

---

### 4. PUT /api/users/preferences

**Mettre à jour les préférences**

```javascript
await fetch('https://jour-marche-api.onrender.com/api/users/preferences', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    notifications: {
      email: true,
      sms: false,
      push: true
    },
    language: 'fr'
  })
});
```

---

### 5. DELETE /api/users/account

**Supprimer le compte (soft delete)**

```javascript
await fetch('https://jour-marche-api.onrender.com/api/users/account', {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

---

## 🔄 Gestion du changement d'utilisateur

### Frontend (React exemple)

```javascript
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState(null);

  // Charger le profil utilisateur
  const loadUserProfile = async (token) => {
    const response = await fetch(
      'https://jour-marche-api.onrender.com/api/users/profile',
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    const data = await response.json();
    return data.data;
  };

  // Charger le panier utilisateur
  const loadUserCart = async (token) => {
    const response = await fetch(
      'https://jour-marche-api.onrender.com/api/carts',
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    const data = await response.json();
    return data.data;
  };

  // Connexion
  const login = async (email, password) => {
    // 1. Connexion
    const loginResponse = await fetch(
      'https://jour-marche-api.onrender.com/api/auth/login',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      }
    );
    const loginData = await loginResponse.json();
    
    if (loginData.success) {
      const token = loginData.data.token;
      const userId = loginData.data.user.id;
      
      // 2. Sauvegarder le token
      localStorage.setItem('token', token);
      localStorage.setItem('userId', userId);
      
      // 3. Charger le profil unique
      const profile = await loadUserProfile(token);
      setUser(profile);
      
      // 4. Charger le panier unique
      const userCart = await loadUserCart(token);
      setCart(userCart);
      
      console.log('✅ Utilisateur connecté:', profile.email);
      console.log('✅ Panier chargé:', userCart.items.length, 'articles');
    }
  };

  // Déconnexion
  const logout = () => {
    // Nettoyer tout
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setUser(null);
    setCart(null);
    console.log('✅ Utilisateur déconnecté');
  };

  // Vérifier si l'utilisateur a changé
  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
    
    if (token && (!user || user._id !== storedUserId)) {
      // Recharger le profil et le panier
      loadUserProfile(token).then(setUser);
      loadUserCart(token).then(setCart);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, cart, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

### Utilisation dans un composant

```javascript
function ProfilePage() {
  const { user, cart } = useAuth();

  if (!user) return <div>Chargement...</div>;

  return (
    <div className="profile">
      <h1>Mon Profil</h1>
      <div className="user-info">
        <h2>{user.firstName} {user.lastName}</h2>
        <p>Email: {user.email}</p>
        <p>Rôle: {user.role}</p>
        {user.avatar && <img src={user.avatar} alt="Avatar" />}
      </div>
      
      <div className="cart-summary">
        <h3>Mon Panier</h3>
        <p>{cart?.items?.length || 0} articles</p>
        <p>Total: {cart?.totalAmount || 0} FCFA</p>
      </div>
    </div>
  );
}
```

---

## 🔒 Isolation Automatique

### Backend - Middleware d'authentification

Le middleware `authenticate` extrait automatiquement l'ID de l'utilisateur depuis le JWT :

```javascript
// src/middlewares/auth.middleware.js
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'Non authentifié' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, role: decoded.role }; // ID unique
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token invalide' });
  }
};
```

### Garantie d'unicité

Toutes les routes utilisent `req.user.id` pour :
- Récupérer le profil : `User.findById(req.user.id)`
- Récupérer le panier : `Cart.findOne({ user: req.user.id })`
- Récupérer les boutiques : `Shop.find({ owner: req.user.id })`
- Récupérer les commandes : `Order.find({ customer: req.user.id })`

**Impossible d'accéder aux données d'un autre utilisateur** ✅

---

## 📊 Données liées au profil

### Relations dans la base de données

```
User (Profil unique)
  ├── Cart (1 panier unique)
  │   └── CartItem[] (articles)
  ├── Shop[] (0 ou plusieurs boutiques)
  │   └── Product[] (produits par boutique)
  ├── Order[] (historique commandes)
  └── Transaction[] (historique paiements)
```

---

## ✅ Tests d'isolation

### Tester le changement d'utilisateur

```javascript
// 1. Connexion Utilisateur A
await login('userA@example.com', 'password');
const userAProfile = await getProfile(); // ID unique A
const userACart = await getCart();       // Panier A

// 2. Déconnexion
await logout();

// 3. Connexion Utilisateur B
await login('userB@example.com', 'password');
const userBProfile = await getProfile(); // ID unique B (différent de A)
const userBCart = await getCart();       // Panier B (différent de A)

// Vérifications
assert(userAProfile._id !== userBProfile._id); // IDs différents
assert(userACart._id !== userBCart._id);       // Paniers différents
```

---

## 🎯 Bonnes pratiques Frontend

### 1. Toujours vérifier l'utilisateur actuel

```javascript
const checkCurrentUser = () => {
  const token = localStorage.getItem('token');
  const storedUserId = localStorage.getItem('userId');
  
  if (!token || !storedUserId) {
    // Rediriger vers login
    window.location.href = '/login';
  }
};
```

### 2. Recharger lors du changement

```javascript
window.addEventListener('storage', (event) => {
  if (event.key === 'userId') {
    // Un autre onglet a changé d'utilisateur
    window.location.reload();
  }
});
```

### 3. Nettoyer à la déconnexion

```javascript
const logout = () => {
  // Nettoyer localStorage
  localStorage.clear();
  
  // Nettoyer sessionStorage
  sessionStorage.clear();
  
  // Nettoyer l'état React
  setUser(null);
  setCart(null);
  
  // Rediriger
  navigate('/login');
};
```

---

## 📈 Résumé

| Concept | Implémentation |
|---------|----------------|
| **Profil unique** | 1 user = 1 document User avec `_id` unique |
| **Panier unique** | 1 user = 1 document Cart avec index `{ user: 1 }` unique |
| **Isolation** | JWT contient `user.id`, toutes les requêtes filtrent par `req.user.id` |
| **Changement user** | Nouveau JWT = nouveau `user.id` = nouvelles données |
| **Sécurité** | Middleware authenticate vérifie le token + rôle |

---

## 🆘 Support

Pour l'intégration frontend du profil utilisateur :
- Route principale : `GET /api/users/profile`
- Documentation admin : `/ADMIN_DASHBOARD.md`
- Documentation panier : `/CART_SYSTEM.md`
