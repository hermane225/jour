const axios = require('axios');

const API_URL = process.env.API_URL || 'https://jour-marche-api.onrender.com/api';
const USER_EMAIL = 'hermane@example.com';
const USER_PASSWORD = 'Passe123';

let authToken = '';

// Placeholder images - using a reliable placeholder service
const PLACEHOLDER_LOGO = 'https://placehold.co/400x400/png?text=Logo';
const PLACEHOLDER_BANNER = 'https://placehold.co/1200x400/png?text=Banner';

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

// Fonction pour récupérer toutes les boutiques (y compris inactives)
async function getAllShops() {
  try {
    // On utilise l'endpoint public pour récupérer les boutiques actives
    const response = await axios.get(`${API_URL}/shops?limit=100`);
    return response.data.data || [];
  } catch (error) {
    console.error('❌ Erreur récupération boutiques:', error.response?.data || error.message);
    return [];
  }
}

// Fonction pour mettre à jour le logo d'une boutique
async function updateShopLogo(shopId, logoUrl) {
  try {
    const response = await axios.put(
      `${API_URL}/shops/${shopId}`,
      { logo: logoUrl },
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error(`❌ Erreur mise à jour logo pour ${shopId}:`, error.response?.data || error.message);
    return null;
  }
}

// Fonction pour mettre à jour le banner d'une boutique
async function updateShopBanner(shopId, bannerUrl) {
  try {
    const response = await axios.put(
      `${API_URL}/shops/${shopId}`,
      { banner: bannerUrl },
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error(`❌ Erreur mise à jour banner pour ${shopId}:`, error.response?.data || error.message);
    return null;
  }
}

// Fonction pour mettre à jour le logo et banner d'une boutique
async function updateShopImages(shopId, logoUrl, bannerUrl) {
  try {
    const response = await axios.put(
      `${API_URL}/shops/${shopId}`,
      { logo: logoUrl, banner: bannerUrl },
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error(`❌ Erreur mise à jour images pour ${shopId}:`, error.response?.data || error.message);
    return null;
  }
}

async function main() {
  try {
    console.log('🚀 Upload des logos et banners pour toutes les boutiques...\n');
    
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
    
    // Mettre à jour chaque boutique
    console.log('🖼️  Upload des logos et banners...\n');
    let updated = 0;
    
    for (const shop of shops) {
      console.log(`▶️  Traitement de: ${shop.name}`);
      
      // Utiliser un texte personnalisé pour chaque boutique
      const shopLogo = `https://placehold.co/400x400/4F46E5/ffffff/png?text=${encodeURIComponent(shop.name)}`;
      const shopBanner = `https://placehold.co/1200x400/10B981/ffffff/png?text=${encodeURIComponent(shop.name)}`;
      
      const result = await updateShopImages(shop._id, shopLogo, shopBanner);
      if (result) {
        console.log(`   ✅ ${shop.name} - Logo et Banner mis à jour`);
        updated++;
      }
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log(`\n✅ ${updated} boutiques mises à jour avec succès!`);
    console.log('\n🎉 Tous les logos et banners ont été uploadés!');
    console.log(`\n🌐 Vérifiez : ${API_URL}/shops`);
    
  } catch (error) {
    console.error('\n❌ Erreur:', error.message);
  }
}

main();
