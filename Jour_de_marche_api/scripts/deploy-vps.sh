#!/bin/bash
# ============================================================
# deploy-vps.sh — Déploiement sur VPS IONOS
#
# Usage (depuis votre machine locale) :
#   chmod +x scripts/deploy-vps.sh
#   ./scripts/deploy-vps.sh
#
# Prérequis sur le VPS :
#   - Node.js >= 18, npm >= 9
#   - PM2  : npm install -g pm2
#   - Nginx installé et actif
#   - MongoDB en cours d'exécution (local ou Atlas)
# ============================================================

set -e

# ── Configuration ─────────────────────────────────────────
VPS_USER="root"
VPS_HOST="82.165.35.28"          # IP de votre VPS IONOS
VPS_PORT="22"
APP_DIR="/var/www/jour-de-marche"
REPO_URL="https://github.com/VOTRE_USER/jour-de-marche-api.git"  # ou SSH
BRANCH="main"
NGINX_CONF="/etc/nginx/sites-available/jour-de-marche"
LOG_DIR="/var/log/pm2"
# ──────────────────────────────────────────────────────────

echo "══════════════════════════════════════════"
echo "  Déploiement Jour de Marché → VPS IONOS  "
echo "══════════════════════════════════════════"

ssh -p "$VPS_PORT" "$VPS_USER@$VPS_HOST" << 'REMOTE'
set -e

APP_DIR="/var/www/jour-de-marche"
LOG_DIR="/var/log/pm2"
NGINX_CONF="/etc/nginx/sites-available/jour-de-marche"

# ── 1. Dépendances système ─────────────────────────────
echo "[1/7] Vérification de Node.js et PM2..."
if ! command -v node &> /dev/null; then
    echo "  → Installation de Node.js 20 LTS..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi

if ! command -v pm2 &> /dev/null; then
    echo "  → Installation de PM2..."
    npm install -g pm2
fi

node -v && npm -v && pm2 -v

# ── 2. Répertoire de l'application ────────────────────
echo "[2/7] Préparation du répertoire..."
mkdir -p "$APP_DIR"
mkdir -p "$APP_DIR/uploads"
mkdir -p "$LOG_DIR"

# ── 3. Récupération du code ───────────────────────────
echo "[3/7] Mise à jour du code..."
if [ -d "$APP_DIR/.git" ]; then
    cd "$APP_DIR"
    git fetch origin
    git reset --hard origin/main
else
    # Première installation : clonez manuellement ou copiez les fichiers
    echo "  → ATTENTION : clonez le dépôt dans $APP_DIR avant de relancer ce script"
    echo "  →   git clone <URL> $APP_DIR"
    exit 1
fi

cd "$APP_DIR"

# ── 4. Variables d'environnement ─────────────────────
echo "[4/7] Configuration des variables d'environnement..."
if [ ! -f "$APP_DIR/.env" ]; then
    if [ -f "$APP_DIR/.env.production" ]; then
        cp "$APP_DIR/.env.production" "$APP_DIR/.env"
        echo "  → .env créé depuis .env.production"
        echo "  !! Éditez $APP_DIR/.env et remplacez les valeurs secrets !!"
    else
        echo "  !! ERREUR : aucun fichier .env trouvé. Créez $APP_DIR/.env"
        exit 1
    fi
fi

# ── 5. Installation des dépendances Node ──────────────
echo "[5/7] Installation des dépendances npm (production)..."
npm ci --omit=dev

# ── 6. Configuration Nginx ────────────────────────────
echo "[6/7] Configuration Nginx..."
if [ -f "$APP_DIR/infra/nginx/vps.conf" ]; then
    cp "$APP_DIR/infra/nginx/vps.conf" "$NGINX_CONF"
    ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/jour-de-marche
    # Supprime le site par défaut si présent
    rm -f /etc/nginx/sites-enabled/default
    nginx -t && systemctl reload nginx
    echo "  → Nginx rechargé"
else
    echo "  !! infra/nginx/vps.conf introuvable, Nginx non mis à jour"
fi

# ── 7. Démarrage / rechargement PM2 ──────────────────
echo "[7/7] Démarrage de l'application avec PM2..."
if pm2 describe jour-de-marche-api > /dev/null 2>&1; then
    pm2 reload jour-de-marche-api --update-env
    echo "  → Application rechargée (zero-downtime)"
else
    pm2 start ecosystem.config.js --env production
    pm2 save
    pm2 startup systemd -u root --hp /root | tail -n 1 | bash
    echo "  → Application démarrée et configurée pour auto-démarrage"
fi

echo ""
echo "══════════════════════════════════════════"
echo "  Déploiement terminé !                   "
echo "  API accessible sur http://$(curl -s ifconfig.me):5000"
echo "  Via Nginx : http://$(curl -s ifconfig.me)"
echo "══════════════════════════════════════════"
pm2 status

REMOTE
