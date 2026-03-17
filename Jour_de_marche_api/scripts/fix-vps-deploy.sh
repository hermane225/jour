#!/bin/bash
# ============================================================
# fix-vps-deploy.sh — CORRECTION Déploiement VPS IONOS
# Usage: chmod +x scripts/fix-vps-deploy.sh && ./scripts/fix-vps-deploy.sh
# Exécuter en root depuis ~/jour/Jour_de_marche_api
# ============================================================

set -e

# Configuration
APP_DIR="/var/www/jour-de-marche"
LOG_DIR="/var/log/pm2"
NGINX_CONF_SRC="infra/nginx/vps.conf"
NGINX_CONF="/etc/nginx/sites-available/jour-de-marche"
UPLOADS_DIR="$APP_DIR/uploads"

echo "🔧 CORRECTION DÉPLOIEMENT JOUR DE MARCHÉ API"
echo "═══════════════════════════════════════════════"

# ── 1. Vérifications préalables ─────────────────────────
echo "[1/9] Vérifications système..."
command -v node >/dev/null 2>&1 || { echo "❌ Node.js requis"; exit 1; }
command -v pm2 >/dev/null 2>&1 || { echo "❌ PM2 requis (npm i -g pm2)"; exit 1; }
command -v nginx >/dev/null 2>&1 || { echo "❌ Nginx requis"; exit 1; }
command -v git >/dev/null 2>&1 || { echo "❌ Git requis"; exit 1; }

node -v && pm2 -v && nginx -v
echo "✅ Système OK"

# ── 2. Arrêt PM2 existant ────────────────────────────
echo "[2/9] Arrêt PM2..."
pm2 delete jour-de-marche-api 2>/dev/null || true
pm2 flush jour-de-marche-api 2>/dev/null || true

# ── 3. Déplacement vers répertoire standard ──────────
echo "[3/9] Migration → $APP_DIR..."
if [ -d "$APP_DIR" ]; then
    echo "  → Sauvegarde ancienne installation..."
    mv "$APP_DIR" "$APP_DIR.backup.$(date +%Y%m%d_%H%M%S)"
fi
mkdir -p "$APP_DIR"
rsync -av --exclude='scripts/fix-vps-deploy.sh' . "$APP_DIR/"
cd "$APP_DIR"
echo "✅ Code déplacé"

# ── 4. Git setup (futurs déploiements) ───────────────
echo "[4/9] Configuration Git..."
if [ ! -d .git ]; then
    git init
    git add .
    git commit -m "Initial deployment fix $(date)"
fi
echo "  → Pour futurs déploiements: cd $APP_DIR && git pull origin main"
echo "✅ Git OK"

# ── 5. Environnement ──────────────────────────────────
echo "[5/9] Configuration .env..."
if [ -f .env.production ]; then
    cp .env.production .env
    echo "✅ .env créé depuis .env.production"
elif [ ! -f .env ]; then
    echo "⚠️  Aucun .env trouvé - créez .env avec vos secrets (MONGO_URI, JWT_SECRET...)"
fi

# ── 6. Dépendances ────────────────────────────────────
echo "[6/9] Installation npm (production)..."
rm -rf node_modules package-lock.json
npm ci --omit=dev --no-audit --no-fund
echo "✅ Dépendances OK"

# ── 7. Nginx ──────────────────────────────────────────
echo "[7/9] Configuration Nginx..."
mkdir -p /etc/nginx/sites-enabled
cp "$NGINX_CONF_SRC" "$NGINX_CONF"
ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/jour-de-marche 2>/dev/null || true
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx || systemctl restart nginx
echo "✅ Nginx rechargé"

# ── 8. Répertoires & permissions ─────────────────────
echo "[8/9] Setup répertoires..."
mkdir -p "$UPLOADS_DIR" "$LOG_DIR"
chown -R www-data:www-data "$UPLOADS_DIR" "$LOG_DIR" 2>/dev/null || true
chmod -R 755 "$APP_DIR"
echo "✅ Permissions OK"

# ── 9. PM2 & démarrage ────────────────────────────────
echo "[9/9] Démarrage PM2..."
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup systemd -u root --hp /root 2>/dev/null | bash 2>/dev/null || true

# Tests
sleep 3
echo ""
echo "🧪 TESTS AUTOMATIQUES..."
if curl -f -s http://localhost:5000/health >/dev/null 2>&1; then
    echo "✅ PORT 5000 OK"
else
    echo "❌ PORT 5000 ÉCHEC - voir pm2 logs"
fi

PUBLIC_IP=$(curl -s ifconfig.me)
if curl -f -s "http://$PUBLIC_IP/health" >/dev/null 2>&1; then
    echo "✅ DOMAINE OK → http://jour.marche.blueredc.com/health"
else
    echo "❌ DOMAINE ÉCHEC - vérifier DNS/nginx"
fi

echo ""
echo "🎉 DÉPLOIEMENT TERMINÉ!"
echo "════════════════════════"
echo "PM2     : pm2 status | pm2 logs jour-de-marche-api"
echo "Nginx   : systemctl status nginx | tail -f /var/log/nginx/jour-de-marche-error.log"
echo "App     : http://jour.marche.blueredc.com/health"
echo "Uploads : http://jour.marche.blueredc.com/uploads/"
pm2 status jour-de-marche-api
