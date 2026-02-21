#!/usr/bin/env node
/**
 * Script de correction des URLs d'images en base de données
 *
 * Usage:
 *   node scripts/fix-upload-urls.js --dry-run          # Simulation (aucune modif)
 *   node scripts/fix-upload-urls.js --apply             # Appliquer les corrections
 *   node scripts/fix-upload-urls.js --old-prefix "http://old.com/uploads" --new-prefix "/uploads"
 *
 * Ce script :
 *  1. Se connecte à MongoDB
 *  2. Parcourt tous les Shop (logo, banner) et Product (images)
 *  3. Remplace les anciennes URLs par les nouvelles
 */

const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// Charger la config
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const config = require('../config');

const Shop = require('../src/models/Shop');
const Product = require('../src/models/Product');

// Arguments
const args = process.argv.slice(2);
const dryRun = !args.includes('--apply');
const oldPrefixArg = args.find((_, i) => args[i - 1] === '--old-prefix');
const newPrefixArg = args.find((_, i) => args[i - 1] === '--new-prefix');

const RESOLVED_UPLOAD_DIR = path.resolve(config.storage.path);

async function main() {
  console.log('=== Fix Upload URLs ===');
  console.log(`Mode: ${dryRun ? 'DRY RUN (simulation)' : 'APPLY (modifications réelles)'}`);
  console.log(`UPLOAD_DIR: ${RESOLVED_UPLOAD_DIR}`);
  console.log(`MongoDB: ${config.mongodb.uri.replace(/\/\/.*@/, '//***@')}`);
  console.log('');

  await mongoose.connect(config.mongodb.uri, config.mongodb.options);
  console.log('Connecté à MongoDB\n');

  // --- Diagnostic : fichiers existants ---
  console.log('--- Fichiers sur disque ---');
  if (fs.existsSync(RESOLVED_UPLOAD_DIR)) {
    const entries = fs.readdirSync(RESOLVED_UPLOAD_DIR, { withFileTypes: true });
    const folders = entries.filter(e => e.isDirectory()).map(e => e.name);
    let totalFiles = entries.filter(e => e.isFile()).length;
    for (const folder of folders) {
      const folderFiles = fs.readdirSync(path.join(RESOLVED_UPLOAD_DIR, folder));
      totalFiles += folderFiles.length;
      console.log(`  📁 ${folder}/ (${folderFiles.length} fichiers)`);
    }
    console.log(`  Total: ${totalFiles} fichiers\n`);
  } else {
    console.log(`  ⚠️  Dossier ${RESOLVED_UPLOAD_DIR} n'existe pas !\n`);
  }

  // --- Shops ---
  console.log('--- Shops ---');
  const shops = await Shop.find({
    $or: [
      { logo: { $exists: true, $ne: null, $ne: '' } },
      { banner: { $exists: true, $ne: null, $ne: '' } },
    ]
  });

  let shopFixCount = 0;
  for (const shop of shops) {
    let changed = false;

    for (const field of ['logo', 'banner']) {
      if (!shop[field]) continue;

      const url = shop[field];
      const relativePath = url.replace(/^\/uploads\//, '');
      const fullPath = path.join(RESOLVED_UPLOAD_DIR, relativePath);
      const exists = fs.existsSync(fullPath);

      if (!exists) {
        console.log(`  ❌ ${shop.name} - ${field}: ${url} (fichier ABSENT)`);

        // Si un ancien prefix est fourni, remplacer
        if (oldPrefixArg && newPrefixArg && url.includes(oldPrefixArg)) {
          const newUrl = url.replace(oldPrefixArg, newPrefixArg);
          console.log(`     → ${newUrl}`);
          if (!dryRun) {
            shop[field] = newUrl;
            changed = true;
          }
          shopFixCount++;
        }
      } else {
        console.log(`  ✅ ${shop.name} - ${field}: ${url} (OK)`);
      }
    }

    if (changed && !dryRun) {
      await shop.save();
    }
  }

  // --- Products ---
  console.log('\n--- Products ---');
  const products = await Product.find({
    images: { $exists: true, $not: { $size: 0 } }
  });

  let productFixCount = 0;
  for (const product of products) {
    let changed = false;

    for (let i = 0; i < product.images.length; i++) {
      const url = product.images[i];
      const relativePath = url.replace(/^\/uploads\//, '');
      const fullPath = path.join(RESOLVED_UPLOAD_DIR, relativePath);
      const exists = fs.existsSync(fullPath);

      if (!exists) {
        console.log(`  ❌ ${product.name} - images[${i}]: ${url} (fichier ABSENT)`);

        if (oldPrefixArg && newPrefixArg && url.includes(oldPrefixArg)) {
          const newUrl = url.replace(oldPrefixArg, newPrefixArg);
          console.log(`     → ${newUrl}`);
          if (!dryRun) {
            product.images[i] = newUrl;
            changed = true;
          }
          productFixCount++;
        }
      } else {
        console.log(`  ✅ ${product.name} - images[${i}]: ${url} (OK)`);
      }
    }

    if (changed && !dryRun) {
      product.markModified('images');
      await product.save();
    }
  }

  // --- Résumé ---
  console.log('\n=== Résumé ===');
  console.log(`Shops analysés: ${shops.length}`);
  console.log(`Products analysés: ${products.length}`);
  console.log(`Corrections shops: ${shopFixCount}`);
  console.log(`Corrections products: ${productFixCount}`);
  if (dryRun) {
    console.log('\n⚠️  Mode DRY RUN — aucune modification appliquée.');
    console.log('Pour appliquer: node scripts/fix-upload-urls.js --apply');
  } else {
    console.log('\n✅ Corrections appliquées en base.');
  }

  // --- Commandes Mongo manuelles ---
  console.log('\n=== Commandes Mongo manuelles (exemples) ===');
  console.log(`
// Mettre à jour le logo d'une boutique :
db.shops.updateOne(
  { _id: ObjectId("SHOP_ID") },
  { $set: { logo: "/uploads/USER_ID/nouveau-fichier.jpg" } }
);

// Mettre à jour le banner d'une boutique :
db.shops.updateOne(
  { _id: ObjectId("SHOP_ID") },
  { $set: { banner: "/uploads/USER_ID/nouveau-banner.jpg" } }
);

// Remplacer toutes les images d'un produit :
db.products.updateOne(
  { _id: ObjectId("PRODUCT_ID") },
  { $set: { images: ["/uploads/USER_ID/img1.jpg", "/uploads/USER_ID/img2.jpg"] } }
);

// Remplacer un préfixe d'URL en masse (shops) :
db.shops.find({ logo: /ancien-prefix/ }).forEach(function(shop) {
  shop.logo = shop.logo.replace("ancien-prefix", "/uploads");
  db.shops.save(shop);
});

// Remplacer un préfixe d'URL en masse (products) :
db.products.find({ images: /ancien-prefix/ }).forEach(function(p) {
  p.images = p.images.map(function(img) {
    return img.replace("ancien-prefix", "/uploads");
  });
  db.products.save(p);
});
`);

  await mongoose.disconnect();
  console.log('Déconnecté de MongoDB');
}

main().catch((err) => {
  console.error('Erreur:', err);
  process.exit(1);
});
