# 🛒 Système de Panier - Documentation

## Vue d'ensemble

Le système de panier permet aux utilisateurs de:
- Ajouter/retirer des produits
- Modifier les quantités
- Gérer les variantes (taille, couleur)
- Calculer automatiquement les totaux
- Gérer les frais de livraison
- Fusionner le panier invité lors de la connexion

## Architecture

### Modèles

#### Cart (Panier)
```javascript
{
  user: ObjectId,           // Référence utilisateur (unique)
  items: [CartItem],        // Liste des articles
  deliveryFee: Number,      // Frais de livraison
  totalAmount: Number,      // Total calculé automatiquement
  lastActivity: Date,       // Dernière activité
  createdAt: Date,
  updatedAt: Date
}
```

#### CartItem (Article du panier)
```javascript
{
  product: ObjectId,        // Référence produit
  quantity: Number,         // Quantité (min: 1)
  selectedVariants: {       // Variantes sélectionnées
    size: String,
    color: String
  },
  priceAtAdd: Number,       // Prix au moment de l'ajout
  addedAt: Date            // Date d'ajout
}
```

### Caractéristiques

✅ **Un panier par utilisateur** - Index unique sur `user`
✅ **Calcul automatique** - Total mis à jour à chaque modification
✅ **Vérification du stock** - Validation avant ajout/modification
✅ **Nettoyage automatique** - Suppression des produits indisponibles
✅ **Prix figé** - Prix au moment de l'ajout (`priceAtAdd`)
✅ **Fusion panier invité** - Lors de la connexion

---

## API Routes

### 1. Récupérer le panier
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
          "images": ["url"],
          "shop": {
            "name": "Le Potager de Marie",
            "logo": "url"
          }
        },
        "quantity": 3,
        "selectedVariants": {
          "size": "M"
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

### 2. Ajouter un article
```http
POST /api/carts/items
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "product_id",
  "quantity": 2,
  "selectedVariants": {
    "size": "L",
    "color": "Rouge"
  }
}
```

**Réponse:**
```json
{
  "success": true,
  "message": "Article ajouté au panier",
  "data": {
    "id": "cart_id",
    "items": [...],
    "deliveryFee": 0,
    "totalAmount": 5000
  }
}
```

**Erreurs possibles:**
- `404` - Produit non trouvé
- `400` - Produit non disponible
- `400` - Stock insuffisant

---

### 3. Modifier la quantité
```http
PUT /api/carts/items/:itemId
Authorization: Bearer <token>
Content-Type: application/json

{
  "quantity": 5
}
```

**Réponse:**
```json
{
  "success": true,
  "message": "Quantité mise à jour",
  "data": {
    "id": "cart_id",
    "items": [...],
    "totalAmount": 12500
  }
}
```

---

### 4. Retirer un article
```http
DELETE /api/carts/items/:itemId
Authorization: Bearer <token>
```

**Réponse:**
```json
{
  "success": true,
  "message": "Article retiré du panier",
  "data": {
    "id": "cart_id",
    "items": [...],
    "totalAmount": 7500
  }
}
```

---

### 5. Mettre à jour les frais de livraison
```http
PUT /api/carts/delivery-fee
Authorization: Bearer <token>
Content-Type: application/json

{
  "deliveryFee": 1500
}
```

**Réponse:**
```json
{
  "success": true,
  "message": "Frais de livraison mis à jour",
  "data": {
    "deliveryFee": 1500,
    "totalAmount": 9000
  }
}
```

---

### 6. Vider le panier
```http
DELETE /api/carts
Authorization: Bearer <token>
```

**Réponse:**
```json
{
  "success": true,
  "message": "Panier vidé",
  "data": {
    "id": "cart_id",
    "items": [],
    "deliveryFee": 0,
    "totalAmount": 0
  }
}
```

---

### 7. Fusionner le panier invité
```http
POST /api/carts/merge
Authorization: Bearer <token>
Content-Type: application/json

{
  "guestItems": [
    {
      "productId": "product_id",
      "quantity": 2,
      "selectedVariants": {
        "size": "M"
      }
    }
  ]
}
```

**Réponse:**
```json
{
  "success": true,
  "message": "Panier fusionné avec succès",
  "data": {
    "id": "cart_id",
    "items": [...],
    "totalAmount": 15000
  }
}
```

---

## Logique métier

### Ajout d'article

1. **Vérification produit**
   - Le produit existe?
   - Statut = `active`?
   - Stock suffisant?

2. **Vérification panier**
   - Article déjà présent avec mêmes variantes?
   - Si oui → additionner quantités
   - Si non → ajouter nouvel item

3. **Calcul et sauvegarde**
   - Calculer `totalAmount`
   - Sauvegarder panier
   - Retourner panier avec produits populés

### Modification de quantité

1. **Vérification**
   - Item existe dans le panier?
   - Stock suffisant pour nouvelle quantité?

2. **Mise à jour**
   - Modifier `quantity`
   - Recalculer `totalAmount`
   - Sauvegarder

### Nettoyage automatique

Lors de `getCart()`:
1. Charger le panier
2. Pour chaque item:
   - Vérifier que le produit existe
   - Vérifier `status = 'active'`
   - Vérifier `quantity > 0`
   - Ajuster quantité si nécessaire
3. Retirer items invalides
4. Recalculer total

---

## Tests

### Installation
```bash
npm install
```

### Exécution des tests
```bash
node scripts/test-cart.js
```

### Tests couverts
✅ GET /api/carts - Récupérer le panier
✅ POST /api/carts/items - Ajouter un article
✅ PUT /api/carts/items/:itemId - Modifier la quantité
✅ PUT /api/carts/delivery-fee - Frais de livraison
✅ DELETE /api/carts/items/:itemId - Retirer un article
✅ DELETE /api/carts - Vider le panier
✅ POST /api/carts/merge - Fusionner panier invité

---

## Intégration Frontend

### 1. Connexion → Charger le panier
```javascript
// Lors de la connexion
const token = response.data.token;
localStorage.setItem('token', token);

// Charger le panier utilisateur
const cart = await fetch('https://jour-marche-api.onrender.com/api/carts', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### 2. Changement d'utilisateur → Nettoyer
```javascript
// Lors de la déconnexion
const oldUserId = localStorage.getItem('userId');

// Déconnexion
localStorage.removeItem('token');
localStorage.removeItem('userId');

// Lors de la connexion d'un nouveau user
const newUserId = response.data.user.id;
if (oldUserId !== newUserId) {
  // Le backend gère automatiquement via user unique
  console.log('Nouveau panier chargé');
}
```

### 3. Ajouter au panier
```javascript
const addToCart = async (productId, quantity, variants) => {
  const response = await fetch('https://jour-marche-api.onrender.com/api/carts/items', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      productId,
      quantity,
      selectedVariants: variants
    })
  });
  
  const data = await response.json();
  return data.data; // Le panier mis à jour
};
```

### 4. Modifier quantité
```javascript
const updateQuantity = async (itemId, quantity) => {
  const response = await fetch(
    `https://jour-marche-api.onrender.com/api/carts/items/${itemId}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ quantity })
    }
  );
  
  const data = await response.json();
  return data.data;
};
```

---

## Sécurité

✅ **Authentification requise** - Toutes les routes nécessitent un JWT
✅ **Isolation utilisateur** - Un panier par user (index unique)
✅ **Validation des données** - Express-validator sur tous les inputs
✅ **Vérification du stock** - Impossible de commander plus que disponible
✅ **Prix figé** - Le prix ne change pas si le produit est modifié

---

## Performance

### Index MongoDB
```javascript
// Cart collection
{ user: 1 }           // Unique index
{ lastActivity: 1 }   // Pour cleanup des vieux paniers
```

### Optimisations
- Population selective (seulement les champs nécessaires)
- Calcul du total en mémoire (pas de requête DB)
- Nettoyage lazy (lors du GET, pas de cron job)

---

## Maintenance

### Nettoyer les paniers inactifs
```javascript
// Script à exécuter périodiquement
const Cart = require('./src/models/Cart');

// Supprimer paniers inactifs depuis 30 jours
const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

await Cart.deleteMany({
  lastActivity: { $lt: thirtyDaysAgo },
  items: { $size: 0 }
});
```

---

## Roadmap futures améliorations

🔄 Stock réservation temporaire (15min)
🔄 Notifications stock faible
🔄 Calcul automatique des frais de livraison par distance
🔄 Suggestions de produits similaires
🔄 Codes promo/réductions
🔄 Historique des paniers abandonnés
🔄 Limite de quantité par produit

---

## Support

Pour toute question ou bug:
- Email: support@jourmarche.com
- GitHub Issues: https://github.com/votre-repo/issues
