const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SIGN_SECRET;
module.exports = {
  parseAuthorization: (a) => (a != null ? a.replace('Bearer ', '') : null),
  getUserId: (authorization) => {
    const token = module.exports.parseAuthorization(authorization);
    if (!token) return -1;
    try {
      const d = jwt.verify(token, secret);
      return d != null ? d.userId : -1;
    } catch (e) { return -1; }
  },
  decodeToken: (token) => {
    if (!token) return null;
    try { return jwt.verify(token, secret); } catch (e) { return null; }
  },
};
