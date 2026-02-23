const axios = require('axios');

const API_URL = 'http://localhost:3000/api';
const USER_EMAIL = 'hermane@example.com';
const USER_PASSWORD = 'Passe123';

let authToken = '';
let testOrderId = '';
let testShopId = '';
let testUserId = '';

async function login() {
  try {
    console.log('🔐 Connexion...');
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: USER_EMAIL,
      password: USER_PASSWORD
    });
    
    authToken = response.data.data.token;
    testUserId = response.data.data.user._id;
    console.log('✅ Connecté!', testUserId ? `(User: ${testUserId})` : '');
    return true;
  } catch (error) {
    console.error('❌ Erreur login:', error.response?.data?.message || error.message);
    return false;
  }
}

async function getShop() {
  try {
    console.log('\n📋 Recherche boutique...');
    const response = await axios.get(`${API_URL}/shops/my-shops`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    if (response.data.data.length > 0) {
      testShopId = response.data.data[0]._id;
      console.log(`✅ Boutique trouvée: ${response.data.data[0].name} (${testShopId})`);
      return true;
    }
    console.log('⚠️  Aucune boutique trouvée');
    return false;
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testOrdersRoutes() {
  console.log('\n🧪 Test des routes Orders & Notifications\n');
  console.log('='.repeat(50));

  // Test 1: Create Order
  console.log('\n1️⃣  POST /api/orders - Créer une commande');
  try {
    const orderData = {
      items: [
        { productId: '507f1f77bcf86cd799439011', quantity: 2, price: 10.00 }
      ],
      shopId: testShopId,
      deliveryAddress: '123 Rue de Test, 75001 Paris',
      paymentMethod: 'card',
      deliveryType: 'delivery',
      notes: 'Test order'
    };
    
    const response = await axios.post(`${API_URL}/orders`, orderData, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    testOrderId = response.data.data._id;
    console.log(`✅ Commande créée!`);
    console.log(`   📦 ID: ${testOrderId}`);
    console.log(`   📝 Numéro: ${response.data.data.orderNumber}`);
    console.log(`   📊 Statut: ${response.data.data.status}`);
  } catch (error) {
    console.log(`❌ Erreur: ${error.response?.data?.message || error.message}`);
  }

  // Test 2: Get Orders
  console.log('\n2️⃣  GET /api/orders - Liste des commandes');
  try {
    const response = await axios.get(`${API_URL}/orders`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    console.log(`✅ ${response.data.data.length} commandes trouvées`);
  } catch (error) {
    console.log(`❌ Erreur: ${error.response?.data?.message || error.message}`);
  }

  // Test 3: Get Orders by Shop
  console.log(`\n3️⃣  GET /api/orders/shop/${testShopId} - Commandes boutique`);
  try {
    const response = await axios.get(`${API_URL}/orders/shop/${testShopId}`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    console.log(`✅ ${response.data.data.length} commandes pour cette boutique`);
  } catch (error) {
    console.log(`❌ Erreur: ${error.response?.data?.message || error.message}`);
  }

  // Test 4: Get Orders by Buyer
  console.log(`\n4️⃣  GET /api/orders/buyer/${testUserId} - Commandes client`);
  try {
    const response = await axios.get(`${API_URL}/orders/buyer/${testUserId}`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    console.log(`✅ ${response.data.data.length} commandes pour ce client`);
  } catch (error) {
    console.log(`❌ Erreur: ${error.response?.data?.message || error.message}`);
  }

  // Test 5: Update Order Status (confirmed)
  if (testOrderId) {
    console.log(`\n5️⃣  PATCH /api/orders/${testOrderId}/status - Confirmer commande`);
    try {
      const response = await axios.patch(
        `${API_URL}/orders/${testOrderId}/status`,
        { status: 'confirmed' },
        { headers: { 'Authorization': `Bearer ${authToken}` } }
      );
      console.log(`✅ Statut confirmé: ${response.data.data.status}`);
    } catch (error) {
      console.log(`❌ Erreur: ${error.response?.data?.message || error.message}`);
    }

    // Test 6: Update Order Status (preparing)
    console.log(`\n6️⃣  PATCH /api/orders/${testOrderId}/status - Préparation`);
    try {
      const response = await axios.patch(
        `${API_URL}/orders/${testOrderId}/status`,
        { status: 'preparing' },
        { headers: { 'Authorization': `Bearer ${authToken}` } }
      );
      console.log(`✅ Statut préparation: ${response.data.data.status}`);
    } catch (error) {
      console.log(`❌ Erreur: ${error.response?.data?.message || error.message}`);
    }

    // Test 7: Update Order Status (in_delivery)
    console.log(`\n7️⃣  PATCH /api/orders/${testOrderId}/status - En livraison`);
    try {
      const response = await axios.patch(
        `${API_URL}/orders/${testOrderId}/status`,
        { status: 'in_delivery' },
        { headers: { 'Authorization': `Bearer ${authToken}` } }
      );
      console.log(`✅ Statut livraison: ${response.data.data.status}`);
    } catch (error) {
      console.log(`❌ Erreur: ${error.response?.data?.message || error.message}`);
    }

    // Test 8: Update Order Status (delivered)
    console.log(`\n8️⃣  PATCH /api/orders/${testOrderId}/status - Livrée`);
    try {
      const response = await axios.patch(
        `${API_URL}/orders/${testOrderId}/status`,
        { status: 'delivered' },
        { headers: { 'Authorization': `Bearer ${authToken}` } }
      );
      console.log(`✅ Statut livré: ${response.data.data.status}`);
    } catch (error) {
      console.log(`❌ Erreur: ${error.response?.data?.message || error.message}`);
    }
  }

  // Test 9: Get Notifications
  console.log(`\n9️⃣  GET /api/notifications?userId=${testUserId} - Notifications`);
  try {
    const response = await axios.get(`${API_URL}/notifications?userId=${testUserId}`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    console.log(`✅ ${response.data.data.length} notifications trouvées`);
    if (response.data.data.length > 0) {
      console.log(`   Dernière: ${response.data.data[0].title}`);
    }
  } catch (error) {
    console.log(`❌ Erreur: ${error.response?.data?.message || error.message}`);
  }

  console.log('\n' + '='.repeat(50));
  console.log('\n✅ Tests terminés!\n');
  
  console.log('📝 Résumé des endpoints testés:');
  console.log('   ✅ POST /api/orders - Création commande');
  console.log('   ✅ GET /api/orders - Liste commandes');
  console.log('   ✅ GET /api/orders/shop/:shopId - Commandes boutique');
  console.log('   ✅ GET /api/orders/buyer/:buyerId - Commandes client');
  console.log('   ✅ PATCH /api/orders/:id/status - Mise à jour statut');
  console.log('   ✅ GET /api/notifications?userId=... - Notifications\n');
}

async function main() {
  const loggedIn = await login();
  if (loggedIn) {
    const hasShop = await getShop();
    if (hasShop) {
      await testOrdersRoutes();
    } else {
      console.log('\n⚠️  Impossible de tester sans boutique');
    }
  }
  
  console.log('🌐 URLs testées localement:');
  console.log(`   - API: ${API_URL}\n`);
}

main();
