// PM2 Ecosystem — VPS IONOS
// Démarrer  : pm2 start ecosystem.config.js --env production
// Recharger : pm2 reload jour-de-marche-api
// Statut    : pm2 status
// Logs      : pm2 logs jour-de-marche-api

module.exports = {
  apps: [
    {
      name: 'jour-de-marche-api',
      script: 'src/server.js',
      cwd: '/var/www/jour-de-marche',

      // Cluster mode : exploite tous les cœurs du VPS
      instances: 'max',
      exec_mode: 'cluster',

      // Variables d'environnement production
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
      },

      // Redémarrage automatique si le process plante
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',

      // Logs
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      out_file: '/var/log/pm2/jour-de-marche-out.log',
      error_file: '/var/log/pm2/jour-de-marche-err.log',
      merge_logs: true,

      // Graceful shutdown
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
    },
  ],
};
