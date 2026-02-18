const axios = require('axios');

const API_URL = 'https://jour-marche-api.onrender.com/api';

async function waitForDeployment() {
  console.log('⏳ Attente du déploiement sur Render...');
  console.log('   Cela peut prendre 2-5 minutes...\n');
  
  let attempts = 0;
  const maxAttempts = 30; // 5 minutes max
  
  while (attempts < maxAttempts) {
    try {
      // Test si l'API répond
      const response = await axios.get(`${API_URL}/shops/categories`, { timeout: 5000 });
      
      if (response.status === 200) {
        console.log('✅ API en ligne et fonctionnelle!');
        return true;
      }
    } catch (error) {
      // API pas encore disponible ou redémarrage en cours
      process.stdout.write('.');
      await new Promise(resolve => setTimeout(resolve, 10000)); // Attendre 10 secondes
      attempts++;
    }
  }
  
  console.log('\n⚠️  Timeout: Le déploiement prend plus de temps que prévu.');
  console.log('   Vérifiez manuellement sur: https://dashboard.render.com');
  return false;
}

async function checkShops() {
  try {
    console.log('\n🔍 Vérification des boutiques...');
    const response = await axios.get(`${API_URL}/shops`);
    const shops = response.data.data || response.data;
    
    console.log(`\n📊 Boutiques actives visibles: ${Array.isArray(shops) ? shops.length : 0}`);
    
    if (Array.isArray(shops) && shops.length > 0) {
      console.log('\n✅ SUCCÈS! Les boutiques sont maintenant visibles:');
      shops.forEach((shop, index) => {
        console.log(`   ${index + 1}. ${shop.name} (${shop.address?.city || 'N/A'})`);
      });
      return true;
    } else {
      console.log('\n⚠️  Aucune boutique visible. Les boutiques sont peut-être encore en status "pending".');
      console.log('   Vous pouvez:');
      console.log('   1. Attendre encore quelques minutes que Render redémarre complètement');
      console.log('   2. Ou relancer: node scripts/populate-api.js (pour créer de nouvelles boutiques avec status active)');
      return false;
    }
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Vérification du déploiement Render\n');
  console.log('📝 Modifications déployées:');
  console.log('   - Support du champ status lors de création de boutiques');
  console.log('   - Routes admin pour gérer les boutiques');
  console.log('   - Support complet des champs (logo, banner, contact, etc.)');
  console.log('');
  
  // Attendre que l'API soit en ligne
  const isOnline = await waitForDeployment();
  
  if (isOnline) {
    // Vérifier les boutiques
    await checkShops();
  }
  
  console.log('\n🌐 URLs utiles:');
  console.log('   - Dashboard Render: https://dashboard.render.com');
  console.log('   - API Boutiques: https://jour-marche-api.onrender.com/api/shops');
  console.log('   - API Produits: https://jour-marche-api.onrender.com/api/products');
}

main();
