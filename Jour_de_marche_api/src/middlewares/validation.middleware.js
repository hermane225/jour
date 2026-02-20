const { validationResult } = require('express-validator');

const validationMiddleware = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // Grouper les erreurs par champ
    const details = {};
    errors.array().forEach(err => {
      const field = err.param || err.path || 'unknown';
      if (!details[field]) {
        details[field] = [];
      }
      details[field].push(err.msg);
    });

    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details,
    });
  }

  next();
};

module.exports = validationMiddleware;
