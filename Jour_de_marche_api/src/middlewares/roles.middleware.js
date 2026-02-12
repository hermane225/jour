const Shop = require('../models/Shop');
const Driver = require('../models/Driver');

const rolesMiddleware = (allowedRoles = []) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non authentifié',
      });
    }

    let hasPermission = false;

    for (const role of allowedRoles) {
      if (role === 'admin' && req.user.role === 'admin') {
        hasPermission = true;
        break;
      } else if (role === 'seller') {
        const shop = await Shop.findOne({ owner: req.user.id, status: 'active' });
        if (shop) {
          hasPermission = true;
          break;
        }
      } else if (role === 'driver') {
        const driver = await Driver.findOne({
          user: req.user.id,
          status: { $in: ['validated', 'active'] }
        });
        if (driver) {
          hasPermission = true;
          break;
        }
      } else if (role === 'customer' && req.user.role === 'customer') {
        hasPermission = true;
        break;
      }
    }

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé - permissions insuffisantes',
      });
    }

    next();
  };
};

module.exports = rolesMiddleware;
