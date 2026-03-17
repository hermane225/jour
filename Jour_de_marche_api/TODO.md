# Déploiement VPS - Checklist

## ✅ Plan approuvé par l'utilisateur

### Phase 1: Préparation fichiers (local) ✅
- [x] Créer `scripts/fix-vps-deploy.sh`
- [x] Mettre à jour `infra/nginx/vps.conf` (server_name = jour.marche.blueredc.com)
- [ ] Vérifier `.env.production` existe

### Phase 2: Exécution VPS (root@my-vps) ← **PROCHAIN**
```
cd ~/jour/Jour_de_marche_api
chmod +x scripts/fix-vps-deploy.sh
./scripts/fix-vps-deploy.sh
```

### Phase 3: Vérification
- [ ] `pm2 status` → jour-de-marche-api online
- [ ] `curl localhost:5000/health` → OK
- [ ] `curl http://jour.marche.blueredc.com/health` → OK
- [ ] Logs PM2/nginx clean

### Phase 4: Bonus
- [ ] SSL avec `certbot --nginx`
- [ ] Git remote setup pour futurs déploiements

**Status: ✅ Prêt pour VPS - Phase 2**
