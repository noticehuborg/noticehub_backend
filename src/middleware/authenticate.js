const jwt = require('jsonwebtoken');
const { accessSecret } = require('../config/jwt');
const { User } = require('../models');

const authenticate = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ status: 'error', message: 'Access token required' });
  }

  try {
    const payload = jwt.verify(token, accessSecret);
    const user = await User.findByPk(payload.id, {
      attributes: { exclude: ['password_hash', 'refresh_token_hash', 'otp_code', 'password_reset_token'] },
    });

    if (!user || !user.is_active) {
      return res.status(401).json({ status: 'error', message: 'Account not found or deactivated' });
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = authenticate;
