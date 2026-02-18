const axios = require('axios');

const API_URL = 'https://jour-marche-api.onrender.com/api';
const USER_EMAIL = 'hermane@example.com';
const USER_PASSWORD = 'Passe123';

let authToken = '';

// Fonction de connexion
async function login() {
  try {
    console.log('🔐 Connexion à l\'API...');
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: USER_EMAIL,
      password: USER_PASSWORD
    });
    
    authToken = response.data.data.token;
    console.log('✅ Connexion réussie!');
    return response.data.data;
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.response?.data || error.message);
    throw error;
  }
}

// Fonction pour activer une boutique
async function activateShop(shopId) {
  try {
    const response = await axios.patch(
      `${API_URL}/shops/${shopId}`,
      { status: 'active' },
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error(`❌ Erreur activation boutique ${shopId}:`, error.response?.data || error.message);
    return null;
  }
}

// Fonction pour récupérer les boutiques (même pending)
async function getAllShops() {
  try {
    // On va essayer de récupérer via l'endpoint des produits pour voir les boutiques
    const productsResponse = await axios.get(`${API_URL}/products`);
    const products = productsResponse.data.data || productsResponse.data;
    
    // Extraire les boutiques uniques des produits
    const shopIds = new Set();
    const shops = [];
    
    if (Array.isArray(products)) {
      products.forEach(product => {
        if (product.shop && product.shop._id && !shopIds.has(product.shop._id)) {
          shopIds.add(product.shop._id);
          shops.push(product.shop);
        }
      });
    }
    
    return shops;
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
    return [];
  }
}

async function main() {
  try {
    console.log('🚀 Activation des boutiques...\n');
    
    // Connexion
    await login();
    
    // Récupérer les boutiques
    console.log('\n📋 Récupération des boutiques...');
    const shops = await getAllShops();
    
    if (shops.length === 0) {
      console.log('⚠️  Aucune boutique trouvée');
      return;
    }
    
    console.log(`✅ ${shops.length} boutiques trouvées\n`);
    
    // Activer chaque boutique
    console.log('🔄 Activation des boutiques...\n');
    let activated = 0;
    
    for (const shop of shops) {
      console.log(`▶️  Activation de: ${shop.name}`);
      const result = await activateShop(shop._id);
      if (result) {
        console.log(`   ✅ ${shop.name} activée`);
        activated++;
      }
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log(`\n✅ ${activated} boutiques activées avec succès!`);
    console.log('\n🎉 Toutes les boutiques sont maintenant visibles!');
    console.log(`\n🌐 Testez : ${API_URL}/shops`);
    
  } catch (error) {
    console.error('\n❌ Erreur:', error.message);
  }
}

main();
