const axios = require('axios');

const API_URL = 'https://jour-marche-api.onrender.com/api';
const USER_EMAIL = 'hermane@example.com';
const USER_PASSWORD = 'Passe123';

let authToken = '';
let userRole = '';

async function login() {
  try {
    console.log('🔐 Connexion à l\'API...');
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: USER_EMAIL,
      password: USER_PASSWORD
    });
    
    authToken = response.data.data.token;
    userRole = response.data.data.user.role;
    console.log('✅ Connexion réussie!');
    console.log(`👤 Utilisateur: ${response.data.data.user.firstName} ${response.data.data.user.lastName}`);
    console.log(`🎭 Rôle: ${userRole}`);
    return response.data.data;
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.response?.data || error.message);
    throw error;
  }
}

async function checkRole() {
  try {
    console.log('\n🔍 Vérification du rôle utilisateur...');
    const response = await axios.get(`${API_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    const role = response.data.data.role;
    console.log(`✅ Rôle actuel: ${role}`);
    
    if (role !== 'admin') {
      console.log('\n⚠️  Vous n\'avez pas le rôle admin.');
      console.log('Pour activer les boutiques, vous devez avoir le rôle admin.');
      console.log('\nPour obtenir le rôle admin, modifiez directement dans la base de données:');
      console.log('  - Connectez-vous à MongoDB');
      console.log('  - Exécutez: db.users.updateOne({email: "hermane@example.com"}, {$set: {role: "admin"}})');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
    return false;
  }
}

async function main() {
  await login();
  await checkRole();
}

main();
