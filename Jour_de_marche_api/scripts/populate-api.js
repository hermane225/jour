const axios = require('axios');

const API_URL = 'https://jour-marche-api.onrender.com/api';
const USER_EMAIL = 'hermane@example.com';
const USER_PASSWORD = 'Passe123';

let authToken = '';
let userId = '';

// Configuration des boutiques avec de vraies données professionnelles
const shopsData = [
  {
    name: "Ferme Bio du Soleil",
    description: "Producteur local de fruits et légumes biologiques cultivés avec passion. Nos produits frais sont récoltés chaque jour pour garantir qualité et fraîcheur.",
    logo: "https://images.unsplash.com/photo-1560493676-04071c5f467b?w=400",
    banner: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200",
    category: null, // À remplir avec l'ID catégorie "Fruits et Légumes"
    address: {
      street: "25 Route des Champs",
      city: "Lyon",
      zipCode: "69001",
      country: "France",
      coordinates: {
        type: "Point",
        coordinates: [4.8357, 45.7640] // Lyon coordinates [longitude, latitude]
      }
    },
    contact: {
      email: "contact@fermedusoleil.fr",
      phone: "+33 4 78 12 34 56",
      website: "https://fermedusoleil.fr"
    },
    hours: {
      monday: { open: "08:00", close: "19:00" },
      tuesday: { open: "08:00", close: "19:00" },
      wednesday: { open: "08:00", close: "19:00" },
      thursday: { open: "08:00", close: "19:00" },
      friday: { open: "08:00", close: "20:00" },
      saturday: { open: "08:00", close: "20:00" },
      sunday: { open: "09:00", close: "13:00" }
    },
    deliveryRadius: 15,
    deliveryFee: 5,
    deliveryOptions: ["livraison locale", "retrait en magasin"],
    minimumOrder: 20,
    socialMedia: {
      facebook: "https://facebook.com/fermedusoleil",
      instagram: "https://instagram.com/fermedusoleil"
    }
  },
  {
    name: "Tradition Boucherie",
    description: "Artisan boucher depuis 3 générations. Viandes de qualité supérieure provenant d'élevages locaux et respectueux du bien-être animal.",
    logo: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400",
    banner: "https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=1200",
    category: null, // À remplir avec catégorie "Viandes"
    address: {
      street: "12 Avenue du Marché",
      city: "Paris",
      zipCode: "75015",
      country: "France",
      coordinates: {
        type: "Point",
        coordinates: [2.3522, 48.8566] // Paris coordinates [longitude, latitude]
      }
    },
    contact: {
      email: "contact@boucherie-tradition.fr",
      phone: "+33 1 45 67 89 01",
      website: "https://boucherie-tradition.fr"
    },
    hours: {
      monday: { open: "08:00", close: "19:30" },
      tuesday: { open: "08:00", close: "19:30" },
      wednesday: { open: "08:00", close: "19:30" },
      thursday: { open: "08:00", close: "19:30" },
      friday: { open: "08:00", close: "20:00" },
      saturday: { open: "07:30", close: "20:00" },
      sunday: { open: "08:00", close: "13:00" }
    },
    deliveryRadius: 10,
    deliveryFee: 7,
    deliveryOptions: ["livraison locale", "retrait en magasin"],
    minimumOrder: 30,
    socialMedia: {
      facebook: "https://facebook.com/boucherietradition",
      instagram: "https://instagram.com/boucherietradition"
    }
  },
  {
    name: "Terroirs & Fromages",
    description: "Crèmerie artisanale proposant une sélection exceptionnelle de fromages fermiers français. Plus de 150 variétés provenant des meilleures fromageries.",
    logo: "https://images.unsplash.com/photo-1452195100486-9cc805987862?w=400",
    banner: "https://images.unsplash.com/photo-1618164436241-4473940d1f5c?w=1200",
    category: null, // À remplir avec catégorie "Produits laitiers"
    address: {
      street: "8 Rue du Fromage",
      city: "Toulouse",
      zipCode: "31000",
      country: "France",
      coordinates: {
        type: "Point",
        coordinates: [1.4437, 43.6047] // Toulouse coordinates [longitude, latitude]
      }
    },
    contact: {
      email: "contact@fromages-terroirs.fr",
      phone: "+33 5 61 23 45 67",
      website: "https://fromages-terroirs.fr"
    },
    hours: {
      monday: { open: "09:00", close: "19:00" },
      tuesday: { open: "09:00", close: "19:00" },
      wednesday: { open: "09:00", close: "19:00" },
      thursday: { open: "09:00", close: "19:00" },
      friday: { open: "09:00", close: "20:00" },
      saturday: { open: "08:30", close: "20:00" },
      sunday: { open: "09:00", close: "13:00" }
    },
    deliveryRadius: 12,
    deliveryFee: 6,
    deliveryOptions: ["livraison locale", "retrait en magasin", "livraison nationale"],
    minimumOrder: 25,
    socialMedia: {
      facebook: "https://facebook.com/fromagesetterroirs",
      instagram: "https://instagram.com/fromagesetterroirs"
    }
  },
  {
    name: "Boulangerie Artisanale",
    description: "Boulangerie-pâtisserie artisanale. Pain au levain naturel et pâtisseries maison préparés chaque jour par nos artisans boulangers.",
    logo: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400",
    banner: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=1200",
    category: null, // À remplir avec catégorie "Boulangerie"
    address: {
      street: "15 Place de la République",
      city: "Marseille",
      zipCode: "13001",
      country: "France",
      coordinates: {
        type: "Point",
        coordinates: [5.3698, 43.2965] // Marseille coordinates [longitude, latitude]
      }
    },
    contact: {
      email: "contact@boulangerie-artisanale.fr",
      phone: "+33 4 91 12 34 56",
      website: "https://boulangerie-artisanale.fr"
    },
    hours: {
      monday: { open: "06:30", close: "20:00" },
      tuesday: { open: "06:30", close: "20:00" },
      wednesday: { open: "06:30", close: "20:00" },
      thursday: { open: "06:30", close: "20:00" },
      friday: { open: "06:30", close: "20:00" },
      saturday: { open: "06:30", close: "20:00" },
      sunday: { open: "07:00", close: "14:00" }
    },
    deliveryRadius: 8,
    deliveryFee: 4,
    deliveryOptions: ["livraison locale", "retrait en magasin"],
    minimumOrder: 15,
    socialMedia: {
      facebook: "https://facebook.com/boulangerieartisanale",
      instagram: "https://instagram.com/boulangerieartisanale"
    }
  },
  {
    name: "Poissonnerie de l'Océan",
    description: "Poissonnerie fraîche avec arrivage quotidien direct des ports. Poissons, coquillages et crustacés de la plus haute qualité.",
    logo: "https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=400",
    banner: "https://images.unsplash.com/photo-1559479083-f3a8c223b416?w=1200",
    category: null, // À remplir avec catégorie "Poissons"
    address: {
      street: "30 Quai du Port",
      city: "Nice",
      zipCode: "06000",
      country: "France",
      coordinates: {
        type: "Point",
        coordinates: [7.2619, 43.7102] // Nice coordinates [longitude, latitude]
      }
    },
    contact: {
      email: "contact@poissonnerie-mer.fr",
      phone: "+33 4 93 45 67 89",
      website: "https://poissonnerie-mer.fr"
    },
    hours: {
      monday: { open: "08:00", close: "19:00" },
      tuesday: { open: "08:00", close: "19:00" },
      wednesday: { open: "08:00", close: "19:00" },
      thursday: { open: "08:00", close: "19:00" },
      friday: { open: "07:30", close: "20:00" },
      saturday: { open: "07:30", close: "20:00" },
      sunday: { open: "08:00", close: "13:00" }
    },
    deliveryRadius: 10,
    deliveryFee: 8,
    deliveryOptions: ["livraison locale", "retrait en magasin"],
    minimumOrder: 35,
    socialMedia: {
      facebook: "https://facebook.com/poissonneriemerr",
      instagram: "https://instagram.com/poissonneriemerr"
    }
  }
];

// Configuration de 20 produits avec de vraies images
const productsData = [
  // Produits Fruits et Légumes (La Ferme Bio du Soleil)
  {
    name: "Tomates Cœur de Bœuf Bio",
    description: "Tomates bio cultivées en plein air, variété cœur de bœuf. Chair fondante et savoureuse, idéale pour les salades et sauces.",
    images: ["https://images.unsplash.com/photo-1546458666-2c3a02dfe2f7?w=800", "https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=800"],
    price: 4.50,
    originalPrice: 5.50,
    quantity: 100,
    unit: "kg",
    category: null,
    shop: null,
    organic: true,
    localProduct: true,
    origin: "France",
    tags: ["bio", "local", "été", "tomate"]
  },
  {
    name: "Carottes Bio",
    description: "Carottes biologiques fraîchement récoltées. Croquantes et sucrées, riches en vitamines et bêta-carotène.",
    images: ["https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=800", "https://images.unsplash.com/photo-1582515073490-39981397c445?w=800"],
    price: 3.20,
    quantity: 150,
    unit: "kg",
    category: null,
    shop: null,
    organic: true,
    localProduct: true,
    origin: "France",
    tags: ["bio", "local", "légume", "carotte"]
  },
  {
    name: "Pommes Golden Bio",
    description: "Pommes Golden biologiques, croquantes et juteuses. Parfaites pour croquer ou cuisiner.",
    images: ["https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=800", "https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=800"],
    price: 3.80,
    quantity: 120,
    unit: "kg",
    category: null,
    shop: null,
    organic: true,
    localProduct: true,
    origin: "France",
    tags: ["bio", "local", "fruit", "pomme"]
  },
  {
    name: "Salade Mesclun Bio",
    description: "Mélange de jeunes pousses de salades biologiques. Fraîcheur et croquant garantis.",
    images: ["https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=800"],
    price: 2.50,
    quantity: 80,
    unit: "piece",
    category: null,
    shop: null,
    organic: true,
    localProduct: true,
    origin: "France",
    tags: ["bio", "local", "salade"]
  },
  // Produits Boucherie (Boucherie Tradition)
  {
    name: "Côte de Bœuf Maturée",
    description: "Côte de bœuf de race Charolaise maturée 21 jours. Viande tendre et goûteuse, idéale pour les grillades.",
    images: ["https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=800", "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=800"],
    price: 28.90,
    quantity: 30,
    unit: "kg",
    category: null,
    shop: null,
    localProduct: true,
    origin: "France",
    tags: ["bœuf", "viande", "grillade", "premium"]
  },
  {
    name: "Poulet Fermier Label Rouge",
    description: "Poulet fermier Label Rouge élevé en plein air. Chair savoureuse et tendre, élevage respectueux du bien-être animal.",
    images: ["https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=800"],
    price: 12.50,
    quantity: 50,
    unit: "piece",
    category: null,
    shop: null,
    localProduct: true,
    origin: "France",
    tags: ["poulet", "volaille", "label rouge", "fermier"]
  },
  {
    name: "Saucisses de Toulouse",
    description: "Authentiques saucisses de Toulouse artisanales. Préparées selon la recette traditionnelle avec viande de porc française.",
    images: ["https://images.unsplash.com/photo-1624191249767-d789e59e40dc?w=800"],
    price: 9.80,
    quantity: 60,
    unit: "kg",
    category: null,
    shop: null,
    localProduct: true,
    origin: "France",
    tags: ["saucisse", "charcuterie", "porc"]
  },
  {
    name: "Filet de Veau",
    description: "Filet de veau de haute qualité provenant d'élevages français. Viande très tendre, idéale pour les plats raffinés.",
    images: ["https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=800"],
    price: 32.00,
    quantity: 25,
    unit: "kg",
    category: null,
    shop: null,
    localProduct: true,
    origin: "France",
    tags: ["veau", "viande", "premium"]
  },
  // Produits Fromages (Fromages & Terroirs)
  {
    name: "Comté AOP 18 Mois",
    description: "Comté AOP affiné 18 mois. Fromage à pâte pressée cuite aux arômes fruités et notes de noisette.",
    images: ["https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=800", "https://images.unsplash.com/photo-1634141510639-d691d86f47be?w=800"],
    price: 18.50,
    quantity: 40,
    unit: "kg",
    category: null,
    shop: null,
    origin: "France",
    tags: ["fromage", "AOP", "comté", "affiné"]
  },
  {
    name: "Camembert de Normandie AOP",
    description: "Véritable Camembert de Normandie AOP au lait cru. Texture crémeuse et goût authentique.",
    images: ["https://images.unsplash.com/photo-1452195100486-9cc805987862?w=800"],
    price: 5.80,
    quantity: 80,
    unit: "piece",
    category: null,
    shop: null,
    origin: "France",
    tags: ["fromage", "AOP", "camembert", "normandie"]
  },
  {
    name: "Roquefort AOP Papillon",
    description: "Roquefort AOP au lait cru de brebis. Fromage persillé au caractère affirmé et à la texture fondante.",
    images: ["https://images.unsplash.com/photo-1618164436241-4473940d1f5c?w=800"],
    price: 22.00,
    quantity: 35,
    unit: "kg",
    category: null,
    shop: null,
    origin: "France",
    tags: ["fromage", "AOP", "roquefort", "brebis"]
  },
  {
    name: "Brie de Meaux AOP",
    description: "Brie de Meaux AOP au lait cru. Roi des fromages, texture onctueuse et saveur délicate.",
    images: ["https://images.unsplash.com/photo-1559561853-08451507cbe7?w=800"],
    price: 15.90,
    quantity: 45,
    unit: "kg",
    category: null,
    shop: null,
    origin: "France",
    tags: ["fromage", "AOP", "brie"]
  },
  // Produits Boulangerie (La Boulangerie Artisanale)
  {
    name: "Baguette Tradition",
    description: "Baguette de tradition française au levain naturel. Croûte croustillante et mie alvéolée.",
    images: ["https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800", "https://images.unsplash.com/photo-1549931319-a545dcf3bc57?w=800"],
    price: 1.30,
    quantity: 200,
    unit: "piece",
    category: null,
    shop: null,
    localProduct: true,
    tags: ["pain", "baguette", "tradition"]
  },
  {
    name: "Pain de Campagne au Levain",
    description: "Pain de campagne artisanal au levain naturel. Longue conservation et saveur authentique.",
    images: ["https://images.unsplash.com/photo-1585478259715-876acc5be8eb?w=800"],
    price: 4.50,
    quantity: 100,
    unit: "piece",
    category: null,
    shop: null,
    localProduct: true,
    tags: ["pain", "campagne", "levain"]
  },
  {
    name: "Croissant Pur Beurre",
    description: "Croissant artisanal pur beurre AOP. Feuilleté croustillant et fondant préparé chaque matin.",
    images: ["https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800", "https://images.unsplash.com/photo-1530610476181-d83430b64dcd?w=800"],
    price: 1.50,
    quantity: 150,
    unit: "piece",
    category: null,
    shop: null,
    localProduct: true,
    tags: ["viennoiserie", "croissant", "pur beurre"]
  },
  {
    name: "Tarte aux Pommes Maison",
    description: "Tarte aux pommes fraîches faite maison. Pâte sablée et pommes caramélisées.",
    images: ["https://images.unsplash.com/photo-1535920527002-b35e96722eb9?w=800"],
    price: 18.00,
    quantity: 30,
    unit: "piece",
    category: null,
    shop: null,
    localProduct: true,
    tags: ["pâtisserie", "tarte", "pommes"]
  },
  // Produits Poissonnerie (Poissonnerie de la Mer)
  {
    name: "Saumon Atlantique Frais",
    description: "Saumon frais de l'Atlantique, arrivage quotidien. Chair rose tendre et délicate, riche en oméga-3.",
    images: ["https://images.unsplash.com/photo-1574781330855-d0db8cc6a79c?w=800", "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800"],
    price: 24.90,
    quantity: 40,
    unit: "kg",
    category: null,
    shop: null,
    origin: "Atlantique Nord",
    tags: ["poisson", "saumon", "frais"]
  },
  {
    name: "Bar de Ligne Sauvage",
    description: "Bar de ligne sauvage pêché en Méditerranée. Poisson noble à la chair fine et savoureuse.",
    images: ["https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=800"],
    price: 32.00,
    quantity: 25,
    unit: "kg",
    category: null,
    shop: null,
    origin: "Méditerranée",
    tags: ["poisson", "bar", "sauvage"]
  },
  {
    name: "Huîtres Fines de Claire N°3",
    description: "Huîtres fines de claire calibre N°3. Chair ferme et iodée, élevées en Charente-Maritime.",
    images: ["https://images.unsplash.com/photo-1559475555-e4caa9e0f515?w=800"],
    price: 8.50,
    quantity: 100,
    unit: "piece",
    category: null,
    shop: null,
    origin: "France - Charente-Maritime",
    tags: ["huîtres", "coquillages", "claire"]
  },
  {
    name: "Crevettes Roses Sauvages",
    description: "Crevettes roses sauvages fraîches. Saveur délicate et chair ferme, idéales pour l'apéritif ou les salades.",
    images: ["https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=800"],
    price: 28.50,
    quantity: 35,
    unit: "kg",
    category: null,
    shop: null,
    origin: "Atlantique",
    tags: ["crevettes", "crustacés", "sauvage"]
  }
];

// Fonction de connexion
async function login() {
  try {
    console.log('🔐 Connexion à l\'API...');
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: USER_EMAIL,
      password: USER_PASSWORD
    });
    
    authToken = response.data.data.token;
    userId = response.data.data.user._id;
    console.log('✅ Connexion réussie!');
    console.log(`👤 Utilisateur: ${response.data.data.user.firstName} ${response.data.data.user.lastName}`);
    return response.data.data;
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.response?.data || error.message);
    throw error;
  }
}

// Fonction pour récupérer les catégories
async function getCategories() {
  try {
    console.log('\n📂 Récupération des catégories...');
    const response = await axios.get(`${API_URL}/shops/categories`);
    const categories = response.data.data;
    console.log(`✅ ${categories.length} catégories trouvées`);
    categories.forEach(cat => console.log(`  - ${cat.name} (ID: ${cat._id})`));
    return categories;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des catégories:', error.response?.data || error.message);
    return [];
  }
}

// Fonction pour créer une boutique
async function createShop(shopData) {
  try {
    const response = await axios.post(
      `${API_URL}/shops`,
      shopData,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log(`✅ Boutique créée: ${shopData.name}`);
    return response.data.data;
  } catch (error) {
    console.error(`❌ Erreur création boutique "${shopData.name}":`, error.response?.data || error.message);
    return null;
  }
}

// Fonction pour créer un produit
async function createProduct(productData) {
  try {
    const response = await axios.post(
      `${API_URL}/products`,
      productData,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log(`✅ Produit créé: ${productData.name}`);
    return response.data.data;
  } catch (error) {
    console.error(`❌ Erreur création produit "${productData.name}":`, error.response?.data || error.message);
    return null;
  }
}

// Fonction principale
async function main() {
  try {
    console.log('🚀 Démarrage du peuplement de l\'API...\n');
    
    // 1. Connexion
    await login();
    
    // 2. Récupération des catégories
    const categories = await getCategories();
    
    if (categories.length === 0) {
      console.log('\n⚠️  Aucune catégorie trouvée. Création des catégories...');
      // On va d'abord créer les catégories nécessaires
      const categoriesToCreate = [
        'Fruits et Légumes',
        'Viandes',
        'Produits laitiers',
        'Boulangerie',
        'Poissons'
      ];
      
      console.log('⚠️  Vous devrez créer ces catégories manuellement via l\'interface admin:');
      categoriesToCreate.forEach(cat => console.log(`  - ${cat}`));
      console.log('\nRelancez ce script après avoir créé les catégories.');
      return;
    }
    
    // 3. Mapper les catégories
    const categoryMap = {};
    categories.forEach(cat => {
      const name = cat.name.toLowerCase();
      if (name.includes('légume') || name.includes('fruit')) categoryMap['fruits'] = cat._id;
      if (name.includes('viande') || name.includes('poisson')) categoryMap['viandes'] = cat._id;
      if (name.includes('alimentation')) categoryMap['laitiers'] = cat._id;
      if (name.includes('alimentation')) categoryMap['boulangerie'] = cat._id;
      if (name.includes('viande') || name.includes('poisson')) categoryMap['poissons'] = cat._id;
    });
    
    console.log('\n🏪 Création des boutiques...\n');
    
    // 4. Créer les boutiques
    const createdShops = [];
    const shopTypes = ['fruits', 'viandes', 'laitiers', 'boulangerie', 'poissons'];
    
    for (let i = 0; i < shopsData.length; i++) {
      const shopData = { ...shopsData[i] };
      const type = shopTypes[i];
      
      if (categoryMap[type]) {
        shopData.category = categoryMap[type];
        shopData.owner = userId; // Ajouter le propriétaire
        shopData.status = 'active'; // Forcer le statut à active
        const shop = await createShop(shopData);
        if (shop) {
          createdShops.push({ ...shop, type });
          await new Promise(resolve => setTimeout(resolve, 1000)); // Pause de 1s entre chaque création
        }
      } else {
        console.log(`⚠️  Catégorie manquante pour: ${shopData.name}`);
      }
    }
    
    if (createdShops.length === 0) {
      console.log('\n❌ Aucune boutique créée. Arrêt du script.');
      return;
    }
    
    console.log(`\n✅ ${createdShops.length} boutiques créées avec succès!\n`);
    console.log('📦 Création des produits...\n');
    
    // 5. Créer les produits
    const productsByShop = {
      fruits: productsData.slice(0, 4),
      viandes: productsData.slice(4, 8),
      laitiers: productsData.slice(8, 12),
      boulangerie: productsData.slice(12, 16),
      poissons: productsData.slice(16, 20)
    };
    
    let totalProducts = 0;
    
    for (const shop of createdShops) {
      const products = productsByShop[shop.type] || [];
      
      for (const productData of products) {
        const product = { ...productData };
        product.shop = shop._id;
        product.category = shop.category;
        
        const created = await createProduct(product);
        if (created) {
          totalProducts++;
          await new Promise(resolve => setTimeout(resolve, 500)); // Pause de 500ms entre chaque produit
        }
      }
    }
    
    console.log(`\n✅ ${totalProducts} produits créés avec succès!`);
    console.log('\n🎉 Peuplement terminé avec succès!');
    console.log(`\n📊 Résumé:`);
    console.log(`   - Boutiques créées: ${createdShops.length}`);
    console.log(`   - Produits créés: ${totalProducts}`);
    console.log(`\n🌐 Visitez l'API: ${API_URL}`);
    
  } catch (error) {
    console.error('\n❌ Erreur lors du peuplement:', error.message);
    process.exit(1);
  }
}

// Exécution
main();
