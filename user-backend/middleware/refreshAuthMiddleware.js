// File: user-backend/middleware/refreshAuthMiddleware.js

const jwtUtils = require('../utils/jwt.utils');

module.exports = (req, res, next) => {
  const headerAuth = req.headers['authorization'];
  if (!headerAuth) return res.status(401).json({ error: 'Authorization manquante' });

  const token = headerAuth.split(' ')[1];
  try {
    const decoded = jwtUtils.verifyRefreshToken(token);
    req.user = { id: decoded.userId };
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Refresh token invalide ou expiré' });
  }
};
// Le middleware vérifie uniquement le refresh token pour prolonger la session
// Il ne bloque pas l'accès aux routes comme authMiddleware
// Assurez-vous que le frontend envoie le refresh token dans l'en-tête Authorization
// Exemple: Authorization: Bearer <refresh_token>