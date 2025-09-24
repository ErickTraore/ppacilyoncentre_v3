// File: user-backend/middleware/authMiddleware.js

const jwtUtils = require('../utils/jwt.utils');

module.exports = (req, res, next) => {
  const authorization = req.headers['authorization'];

  if (!authorization) {
    return res.status(401).json({ error: 'Accès refusé. Aucun token fourni.' });
  }

  const token = authorization.split(' ')[1]; // ✅ extraction correcte
  const decoded = jwtUtils.decodeToken(token);

  if (!decoded || decoded.userId < 0) {
    return res.status(403).json({ error: 'Accès refusé. Token invalide ou expiré.' });
  }

  req.userId = decoded.userId; // ✅ pour les messages
  req.user = decoded;          // ✅ pour isAdminMiddleware
  next();
};
