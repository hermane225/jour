const axios = require('axios');

const API_URL = 'https://jour-marche-api.onrender.com/api';

async function verifyData() {
  try {
    console.log('🔍 Vérification des données créées...\n');
    
    // Récupérer les boutiques
    console.log('📍 Boutiques créées:');
    console.log('==================');
    const shopsResponse = await axios.get(`${API_URL}/shops`);
    const shops = shopsResponse.data.data || shopsResponse.data;
    
    if (Array.isArray(shops)) {
      shops.forEach((shop, index) => {
        console.log(`\n${index + 1}. ${shop.name}`);
        console.log(`   📂 Catégorie: ${shop.category?.name || 'N/A'}`);
        console.log(`   📍 Ville: ${shop.address?.city || 'N/A'}`);
        console.log(`   ⭐ Status: ${shop.status}`);
        console.log(`   🎨 Logo: ${shop.logo ? '✅' : '❌'}`);
        console.log(`   🖼️  Banner: ${shop.banner ? '✅' : '❌'}`);
      });
      console.log(`\n✅ Total: ${shops.length} boutiques`);
    }
    
    // Récupérer les produits
    console.log('\n\n📦 Produits créés:');
    console.log('==================');
    const productsResponse = await axios.get(`${API_URL}/products`);
    const products = productsResponse.data.data || productsResponse.data;
    
    if (Array.isArray(products)) {
      products.forEach((product, index) => {
        console.log(`\n${index + 1}. ${product.name}`);
        console.log(`   🏪 Boutique: ${product.shop?.name || 'N/A'}`);
        console.log(`   💰 Prix: ${product.price}€`);
        console.log(`   📊 Quantité: ${product.quantity} ${product.unit}`);
        console.log(`   🖼️  Images: ${product.images?.length || 0}`);
        console.log(`   ⭐ Status: ${product.status}`);
      });
      console.log(`\n✅ Total: ${products.length} produits`);
    }
    
    console.log('\n\n🎉 Vérification terminée!');
    console.log(`\n🌐 URLs pour tester:`);
    console.log(`   - API Boutiques: ${API_URL}/shops`);
    console.log(`   - API Produits: ${API_URL}/products`);
    
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
  }
}

verifyData();
