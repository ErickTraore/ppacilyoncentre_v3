const jwtUtils = require('../utils/jwt.utils');
module.exports = (req, res, next) => {
  const auth = req.headers['authorization'];
  if (!auth) return res.status(401).json({ error: 'Aucun token' });
  const token = auth.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Format token invalide' });
  const decoded = jwtUtils.decodeToken(token);
  if (!decoded || decoded.userId == null) return res.status(403).json({ error: 'Token invalide' });
  req.userId = decoded.userId;
  req.user = decoded;
  next();
};
