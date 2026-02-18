const axios = require('axios');
require('dotenv').config();

const API_URL = process.env.API_URL || 'https://jour-marche-api.onrender.com/api';
const USER_EMAIL = 'hermane@example.com';
const USER_PASSWORD = 'Passe123';

let token = '';
let productId = '';
let cartItemId = '';

async function login() {
  console.log('\n🔐 Connexion...');
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: USER_EMAIL,
      password: USER_PASSWORD,
    });
    token = response.data.data.token;
    console.log('✅ Connecté avec succès');
    return true;
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.response?.data || error.message);
    return false;
  }
}

async function getProducts() {
  console.log('\n📦 Récupération d\'un produit...');
  try {
    const response = await axios.get(`${API_URL}/products`);
    const products = response.data.data;
    if (products.length > 0) {
      productId = products[0]._id;
      console.log(`✅ Produit récupéré: ${products[0].name} (${productId})`);
      return true;
    }
    console.error('❌ Aucun produit trouvé');
    return false;
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
    return false;
  }
}

async function testGetCart() {
  console.log('\n🛒 Test: GET /api/carts');
  try {
    const response = await axios.get(`${API_URL}/carts`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('✅ Panier récupéré:');
    console.log(`   - Items: ${response.data.data.itemsCount || 0}`);
    console.log(`   - Total: ${response.data.data.totalAmount} FCFA`);
    return true;
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
    return false;
  }
}

async function testAddItem() {
  console.log('\n➕ Test: POST /api/carts/items');
  try {
    const response = await axios.post(
      `${API_URL}/carts/items`,
      {
        productId: productId,
        quantity: 2,
        selectedVariants: {
          size: 'M',
          color: 'Rouge',
        },
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    console.log('✅ Article ajouté au panier:');
    console.log(`   - Items: ${response.data.data.items.length}`);
    console.log(`   - Total: ${response.data.data.totalAmount} FCFA`);
    
    if (response.data.data.items.length > 0) {
      cartItemId = response.data.data.items[0].id;
      console.log(`   - Item ID: ${cartItemId}`);
    }
    return true;
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
    return false;
  }
}

async function testUpdateQuantity() {
  console.log(`\n♻️ Test: PUT /api/carts/items/${cartItemId}`);
  try {
    const response = await axios.put(
      `${API_URL}/carts/items/${cartItemId}`,
      { quantity: 5 },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    console.log('✅ Quantité mise à jour:');
    console.log(`   - Items: ${response.data.data.items.length}`);
    console.log(`   - Total: ${response.data.data.totalAmount} FCFA`);
    return true;
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
    return false;
  }
}

async function testUpdateDeliveryFee() {
  console.log('\n🚚 Test: PUT /api/carts/delivery-fee');
  try {
    const response = await axios.put(
      `${API_URL}/carts/delivery-fee`,
      { deliveryFee: 1500 },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    console.log('✅ Frais de livraison mis à jour:');
    console.log(`   - Frais: ${response.data.data.deliveryFee} FCFA`);
    console.log(`   - Total: ${response.data.data.totalAmount} FCFA`);
    return true;
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
    return false;
  }
}

async function testRemoveItem() {
  console.log(`\n🗑️  Test: DELETE /api/carts/items/${cartItemId}`);
  try {
    const response = await axios.delete(`${API_URL}/carts/items/${cartItemId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('✅ Article retiré:');
    console.log(`   - Items restants: ${response.data.data.items.length}`);
    console.log(`   - Total: ${response.data.data.totalAmount} FCFA`);
    return true;
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
    return false;
  }
}

async function testClearCart() {
  console.log('\n🧹 Test: DELETE /api/carts');
  try {
    const response = await axios.delete(`${API_URL}/carts`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('✅ Panier vidé:');
    console.log(`   - Items: ${response.data.data.items.length}`);
    console.log(`   - Total: ${response.data.data.totalAmount} FCFA`);
    return true;
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
    return false;
  }
}

async function testMergeCart() {
  console.log('\n🔄 Test: POST /api/carts/merge');
  try {
    const response = await axios.post(
      `${API_URL}/carts/merge`,
      {
        guestItems: [
          {
            productId: productId,
            quantity: 3,
            selectedVariants: { size: 'L' },
          },
        ],
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    console.log('✅ Panier fusionné:');
    console.log(`   - Items: ${response.data.data.items.length}`);
    console.log(`   - Total: ${response.data.data.totalAmount} FCFA`);
    return true;
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Test du système de panier');
  console.log('=============================');
  console.log(`API: ${API_URL}`);
  console.log(`User: ${USER_EMAIL}`);

  const results = {
    total: 0,
    passed: 0,
    failed: 0,
  };

  // Connexion
  if (!(await login())) {
    console.log('\n❌ Impossible de continuer sans connexion');
    return;
  }

  // Récupérer un produit
  if (!(await getProducts())) {
    console.log('\n❌ Impossible de continuer sans produit');
    return;
  }

  // Tests
  const tests = [
    { name: 'Get Cart', fn: testGetCart },
    { name: 'Add Item', fn: testAddItem },
    { name: 'Update Quantity', fn: testUpdateQuantity },
    { name: 'Update Delivery Fee', fn: testUpdateDeliveryFee },
    { name: 'Remove Item', fn: testRemoveItem },
    { name: 'Clear Cart', fn: testClearCart },
    { name: 'Merge Cart', fn: testMergeCart },
  ];

  for (const test of tests) {
    results.total++;
    const success = await test.fn();
    if (success) {
      results.passed++;
    } else {
      results.failed++;
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  console.log('\n=============================');
  console.log('📊 Résultats des tests');
  console.log('=============================');
  console.log(`✅ Tests réussis: ${results.passed}/${results.total}`);
  console.log(`❌ Tests échoués: ${results.failed}/${results.total}`);
  console.log(`📈 Taux de réussite: ${Math.round((results.passed / results.total) * 100)}%`);
}

runTests().catch(console.error);
