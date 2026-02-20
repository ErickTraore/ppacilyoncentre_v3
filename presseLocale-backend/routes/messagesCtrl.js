const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const MEDIA_API_URL = process.env.MEDIA_API_URL || process.env.MEDIA_LOCALE_BACKEND_URL || 'http://62.171.186.233:7106/api/media-locale/getMedia';
const models = require('../models');
const jwtUtils = require('../utils/jwt.utils');

module.exports = {
  createMessage: function (req, res) {
    const userId = jwtUtils.getUserId(req.headers['authorization']);
    const { content, title } = req.body;
    if (!title || !content || title.length <= 2 || content.length <= 4) {
      return res.status(400).json({ error: 'missing parameters' });
    }
    models.PresseLocale.create({
      title, content, userId: userId || null, categ: 'presse-locale', likes: 0,
    }).then(function (m) {
      return res.status(201).json({ id: m.id });
    }).catch(function (err) {
      console.error(err);
      return res.status(500).json({ error: 'cannot post message' });
    });
  },
  listMessages: async function (req, res) {
    try {
      const messages = await models.PresseLocale.findAll({
        order: [['createdAt', 'DESC']],
        limit: 20,
        offset: 0,
      });
      if (!messages || messages.length === 0) return res.status(200).json([]);
      const out = [];
      for (const m of messages) {
        try {
          const r = await fetch(MEDIA_API_URL + '/' + m.id);
          const data = r.ok ? await r.json() : [];
          out.push({ ...m.get({ plain: true }), media: Array.isArray(data) ? data : [] });
        } catch (e) {
          out.push({ ...m.get({ plain: true }), media: [] });
        }
      }
      return res.status(200).json(out);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Server error' });
    }
  },
};
