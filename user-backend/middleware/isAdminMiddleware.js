// File: backend/middleware/isAdminMiddleware.js

module.exports = (req, res, next) => {
  if (req.user && req.user.isAdmin === true) {
    next(); // ✅ L'utilisateur est admin, on continue
  } else {
    return res.status(403).json({ error: 'Accès interdit : administrateur requis' });
  }
};
