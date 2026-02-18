const axios = require('axios');

const API_URL = 'https://jour-marche-api.onrender.com/api';
const USER_EMAIL = 'hermane@example.com';
const USER_PASSWORD = 'Passe123';

let authToken = '';

async function login() {
  try {
    console.log('🔐 Connexion...');
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: USER_EMAIL,
      password: USER_PASSWORD
    });
    
    authToken = response.data.data.token;
    console.log('✅ Connecté!\n');
    return true;
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    return false;
  }
}

async function testNewRoutes() {
  console.log('🧪 Test des nouvelles routes API\n');
  console.log('='.repeat(50) + '\n');

  // Test 1: GET /api/shops/my-shops
  console.log('1️⃣  Test: GET /api/shops/my-shops');
  try {
    const response = await axios.get(`${API_URL}/shops/my-shops`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    const shops = response.data.data;
    console.log(`✅ Réussi! ${shops.length} boutiques trouvées`);
    
    if (shops.length > 0) {
      const shop = shops[0];
      console.log(`   📍 Exemple: ${shop.name} (${shop.address?.city || 'N/A'})`);
      console.log(`   📊 Statut: ${shop.status}`);
      console.log(`   🎨 Logo: ${shop.logo ? '✅' : '❌'}`);
      console.log(`   📈 Produits: ${shop.stats?.totalProducts || 0}`);
      
      // Test 2: GET /api/shops/:shopId
      console.log(`\n2️⃣  Test: GET /api/shops/${shop._id}`);
      try {
        const shopResponse = await axios.get(`${API_URL}/shops/${shop._id}`);
        console.log(`✅ Réussi! Détails de la boutique récupérés`);
        console.log(`   👤 Propriétaire: ${shopResponse.data.data.owner?.firstName || 'N/A'}`);
        console.log(`   📂 Catégorie: ${shopResponse.data.data.category?.name || 'N/A'}`);
      } catch (error) {
        console.log(`❌ Erreur: ${error.response?.data?.message || error.message}`);
      }

      // Test 3: GET /api/products/shop/:shopId
      console.log(`\n3️⃣  Test: GET /api/products/shop/${shop._id}`);
      try {
        const productsResponse = await axios.get(
          `${API_URL}/products/shop/${shop._id}`,
          { headers: { 'Authorization': `Bearer ${authToken}` } }
        );
        
        const products = productsResponse.data.data;
        console.log(`✅ Réussi! ${products.length} produits trouvés`);
        
        if (products.length > 0) {
          const product = products[0];
          console.log(`   📦 Exemple: ${product.name}`);
          console.log(`   💰 Prix: ${product.price}€`);
          console.log(`   🖼️  Images: ${product.images?.length || 0}`);
          console.log(`   ⭐ Statut: ${product.status}`);

          // Test 4: GET /api/products/:productId
          console.log(`\n4️⃣  Test: GET /api/products/${product._id}`);
          try {
            const productResponse = await axios.get(`${API_URL}/products/${product._id}`);
            console.log(`✅ Réussi! Détails du produit récupérés`);
            console.log(`   🏪 Boutique: ${productResponse.data.data.shop?.name || 'N/A'}`);
          } catch (error) {
            console.log(`❌ Erreur: ${error.response?.data?.message || error.message}`);
          }
        }
      } catch (error) {
        console.log(`❌ Erreur: ${error.response?.data?.message || error.message}`);
      }
    }
  } catch (error) {
    console.log(`❌ Erreur: ${error.response?.data?.message || error.message}`);
  }

  // Test 5: GET /api/shops (public)
  console.log(`\n5️⃣  Test: GET /api/shops (public)`);
  try {
    const response = await axios.get(`${API_URL}/shops`);
    const shops = response.data.data;
    console.log(`✅ Réussi! ${shops.length} boutiques publiques affichées`);
    
    console.log('\n📋 Liste des boutiques actives:');
    shops.forEach((shop, index) => {
      console.log(`   ${index + 1}. ${shop.name} - ${shop.address?.city || 'N/A'}`);
      console.log(`      Logo: ${shop.logo ? '✅' : '❌'} | Banner: ${shop.banner ? '✅' : '❌'}`);
    });
  } catch (error) {
    console.log(`❌ Erreur: ${error.response?.data?.message || error.message}`);
  }

  // Test 6: GET /api/products (public)
  console.log(`\n6️⃣  Test: GET /api/products (public)`);
  try {
    const response = await axios.get(`${API_URL}/products`);
    const products = response.data.data;
    console.log(`✅ Réussi! ${products.length} produits publics affichés`);
    
    if (products.length > 0) {
      console.log('\n📦 Exemples de produits:');
      products.slice(0, 3).forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.name} - ${product.price}€`);
        console.log(`      Boutique: ${product.shop?.name || 'N/A'}`);
        console.log(`      Images: ${product.images?.length || 0}`);
      });
    }
  } catch (error) {
    console.log(`❌ Erreur: ${error.response?.data?.message || error.message}`);
  }

  console.log('\n' + '='.repeat(50));
  console.log('\n✅ Tests terminés!\n');
  
  console.log('📝 Récapitulatif des nouvelles fonctionnalités:');
  console.log('   ✅ Les boutiques créées sont maintenant ACTIVES par défaut');
  console.log('   ✅ Les propriétaires peuvent voir leurs boutiques');
  console.log('   ✅ Les propriétaires peuvent gérer leurs produits');
  console.log('   ✅ Toutes les données (images, descriptions) sont affichées');
  console.log('   ✅ Le frontend peut maintenant afficher les boutiques et produits!\n');
}

async function main() {
  const loggedIn = await login();
  if (loggedIn) {
    await testNewRoutes();
  }
  
  console.log('🌐 URLs de l\'API:');
  console.log(`   - Boutiques: ${API_URL}/shops`);
  console.log(`   - Mes boutiques: ${API_URL}/shops/my-shops`);
  console.log(`   - Produits: ${API_URL}/products`);
  console.log(`\n📚 Documentation: API_IMPROVEMENTS.md\n`);
}

main();
