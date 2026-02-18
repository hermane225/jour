# 🛒 Système de Panier - Guide Rapide

## ✅ Implémentation Complète

Le système de panier a été ajouté au backend avec toutes les fonctionnalités nécessaires.

### 📁 Fichiers créés

```
src/
  models/
    Cart.js                      ✅ Modèle Cart + CartItem
  api/
    carts/
      carts.controller.js       ✅ Toutes les opérations CRUD
      carts.routes.js           ✅ 7 routes API
      carts.validator.js        ✅ Validation des données

scripts/
  test-cart.js                  ✅ Tests automatisés

docs/
  CART_SYSTEM.md                ✅ Documentation complète
```

---

## 🚀 Routes API Disponibles

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/carts` | Récupérer le panier |
| POST | `/api/carts/items` | Ajouter un article |
| PUT | `/api/carts/items/:itemId` | Modifier la quantité |
| DELETE | `/api/carts/items/:itemId` | Retirer un article |
| PUT | `/api/carts/delivery-fee` | Mettre à jour les frais |
| DELETE | `/api/carts` | Vider le panier |
| POST | `/api/carts/merge` | Fusionner panier invité |

---

## 💡 Caractéristiques Clés

✅ **1 user = 1 panier** - Panier unique par utilisateur
✅ **Nettoyage automatique** - Changement d'utilisateur = nouveau panier
✅ **Validation stock** - Impossible de commander plus que disponible
✅ **Calcul automatique** - Total mis à jour automatiquement
✅ **Prix figé** - Prix au moment de l'ajout
✅ **Variantes** - Taille, couleur, etc.

---

## 📋 Exemples d'utilisation

### 1. Récupérer le panier (Frontend)

```javascript
const token = localStorage.getItem('token');

const response = await fetch('https://jour-marche-api.onrender.com/api/carts', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const data = await response.json();
console.log(data.data); // { items: [...], totalAmount: 5000, ... }
```

### 2. Ajouter un produit

```javascript
const response = await fetch('https://jour-marche-api.onrender.com/api/carts/items', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    productId: '507f1f77bcf86cd799439011',
    quantity: 2,
    selectedVariants: {
      size: 'M',
      color: 'Rouge'
    }
  })
});

const data = await response.json();
```

### 3. Modifier la quantité

```javascript
const itemId = '507f1f77bcf86cd799439012';

await fetch(`https://jour-marche-api.onrender.com/api/carts/items/${itemId}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    quantity: 5
  })
});
```

### 4. Retirer un article

```javascript
await fetch(`https://jour-marche-api.onrender.com/api/carts/items/${itemId}`, {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### 5. Vider le panier

```javascript
await fetch('https://jour-marche-api.onrender.com/api/carts', {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

---

## 🔐 Gestion des utilisateurs

### Quand un utilisateur se connecte:

```javascript
// 1. Connexion
const loginResponse = await fetch('https://jour-marche-api.onrender.com/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password'
  })
});

const { data } = await loginResponse.json();
const token = data.token;
const userId = data.user.id;

// 2. Sauvegarder le token et userId
localStorage.setItem('token', token);
localStorage.setItem('userId', userId);

// 3. Charger le panier de l'utilisateur
const cartResponse = await fetch('https://jour-marche-api.onrender.com/api/carts', {
  headers: { 'Authorization': `Bearer ${token}` }
});

const cart = await cartResponse.json();
```

### Changement d'utilisateur:

```javascript
// L'ancien panier est automatiquement isolé
// Un nouveau panier vide est créé pour le nouvel utilisateur
// Pas besoin de nettoyer manuellement
```

---

## 🧪 Tests

### Tester le système:

```bash
# Installer les dépendances
npm install

# Lancer les tests
node scripts/test-cart.js
```

Les tests couvrent:
- ✅ Récupération du panier
- ✅ Ajout d'article
- ✅ Modification de quantité
- ✅ Frais de livraison
- ✅ Suppression d'article
- ✅ Vidage du panier
- ✅ Fusion avec panier invité

---

## 🎯 Prochaines étapes

1. **Déployer sur Render**
   ```bash
   git add .
   git commit -m "feat: Add cart system"
   git push origin main
   ```

2. **Tester l'API en production**
   ```bash
   node scripts/test-cart.js
   ```

3. **Intégrer au frontend**
   - Créer les composants panier
   - Ajouter les appels API
   - Gérer l'état global (Redux/Context)

---

## 📚 Documentation complète

Pour plus de détails, consultez [CART_SYSTEM.md](./CART_SYSTEM.md)

---

## ✨ Points forts du système

🎯 **Isolation totale** - Chaque utilisateur a son propre panier
🔒 **Sécurisé** - Authentification JWT requise
⚡ **Performant** - Index MongoDB optimisés
🛡️ **Robuste** - Validation complète des données
🧹 **Auto-nettoyage** - Suppression des produits indisponibles
💰 **Prix figé** - Protection contre les variations de prix

---

## 🆘 Support

En cas de problème:
1. Vérifier les logs: `src/logs/`
2. Consulter la documentation: `CART_SYSTEM.md`
3. Lancer les tests: `node scripts/test-cart.js`
