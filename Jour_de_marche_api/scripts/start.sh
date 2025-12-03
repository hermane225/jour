#!/bin/bash

# Script de démarrage du serveur

echo "🚀 Démarrage du serveur Jour de Marché..."

# Vérifier si les variables d'environnement sont chargées
if [ ! -f .env ]; then
  echo "❌ Fichier .env non trouvé"
  echo "✅ Créez un fichier .env à partir de .env.example"
  exit 1
fi

# Installer les dépendances si nécessaire
if [ ! -d "node_modules" ]; then
  echo "📦 Installation des dépendances..."
  npm install
fi

# Exécuter les migrations
echo "🔄 Exécution des migrations..."
npm run migrate

# Démarrer le serveur
echo "✅ Démarrage du serveur..."
npm start
