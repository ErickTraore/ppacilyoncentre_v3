// File : user-backend/routes/messagesCtrl.js

const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));
// Même base que le front (uploads → /api/media/) : getMedia doit cibler le même backend (62.171.186.233:80 /api/media/)
const MEDIA_API_URL =
  process.env.MEDIA_API_URL || 'http://62.171.186.233/api/media/getMedia';

const models = require('../models');
const asyncLib = require('async');
const jwtUtils = require('../utils/jwt.utils');

const TITLE_LIMIT = 2;
const CONTENT_LIMIT = 4;

// Petit helper pour éviter que listMessages se bloque si le backend média ne répond pas
async function fetchWithTimeout(url, options = {}, timeoutMs = 5000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

// Routes
console.log('Voici la page messagesCtrl.js');

module.exports = {
    createMessage: function (req, res) {
        console.log('Received request body:', req.body);
        console.log('Received headers:', req.headers);

        const headerAuth = req.headers['authorization'];
        const userId = jwtUtils.getUserId(headerAuth);
        console.log('Extracted userId:', userId);

        const {
            content,
            title,
            image,
            video,
            categ
        } = req.body;

        console.log('Extracted content:', content);
        console.log('Extracted title:', title);
        console.log('Extracted image:', image);
        console.log('Extracted video:', video);
        console.log('Extracted content.length:', content.length);
        console.log('Extracted title.length:', title.length);

        if (title === '' || content === '') {
            console.log('Error: missing parameters');
            return res.status(400).json({
                'error': 'missing parameters'
            });
        }

        if (title.length <= TITLE_LIMIT || content.length <= CONTENT_LIMIT) {
            console.log('Error: parameters do not meet length requirements');
            return res.status(400).json({
                'error': 'missing parameters LIMIT'
            });
        }

        asyncLib.waterfall([
            function (done) {
                console.log('Looking for user with id:', userId);
                models.User.findOne({
                        attributes: ['id'],
                        where: {
                            id: userId
                        }
                    })
                    .then(function (userFound) {
                        console.log('User found:', userFound);
                        done(null, userFound);
                    })
                    .catch(function (err) {
                        console.log('Error finding user:', err);
                        return res.status(500).json({
                            'error': 'unable to verify user'
                        });
                    });
            },
            function (userFound, done) {
                if (userFound) {
                    models.Message.create({
                        title: title,
                        content: content,
                        userId: userFound.id,
                        likes: 0,
                        image: image || null,
                        video: video || null,
                        categ: categ || 'presse'
                    })
                        .then(function (newMessage) {
                            done(null, newMessage);
                        })
                        .catch(function (err) {
                            console.log('Error creating message:', err);
                            done(err);
                        });
                } else {
                    res.status(404).json({
                        'error': 'user not found'
                    });
                }
            },
        ], function (err, newMessage) {
            if (err) {
                console.log('Error in waterfall:', err);
                return res.status(500).json({
                    'error': 'cannot post message'
                });
            }
            if (newMessage) {
                // Renvoie l'ID du nouveau message
                return res.status(201).json({
                    id: newMessage.id
                });
            } else {
                return res.status(500).json({
                    'error': 'cannot post message'
                });
            }
        });
    },

    listMessages: async function (req, res) {
        try {
            const fields = req.query.fields && String(req.query.fields).trim() !== '' ? req.query.fields : '*';
            const limit = parseInt(req.query.limit, 10);
            const offset = parseInt(req.query.offset, 10);
            const orderRaw = (req.query.order && String(req.query.order).trim()) || 'title:ASC';
            const orderParts = orderRaw.split(':');
            const order = orderParts.length >= 2 ? [orderParts] : [['title', 'ASC']];

            console.log('Fields:', fields);
            console.log('Limit:', isNaN(limit) ? 'default (20)' : limit);
            console.log('Offset:', isNaN(offset) ? 'default (0)' : offset);
            console.log('Order:', order);

            // Presse Générale uniquement (table PresseGle)
            const messages = await models.PresseGle.findAll({
                where: { categ: 'presse' },
                order,
                attributes: (fields !== '*' && fields) ? fields.split(',') : undefined,
                limit: (!isNaN(limit)) ? limit : 20,
                offset: (!isNaN(offset)) ? offset : 0,
                include: [{
                    model: models.User,
                    attributes: ['email']
                }]
            });


            if (!messages || messages.length === 0) {
                return res.status(200).json([]); // ✅ Réponse valide, juste vide
            }

            // PresseGle = option-1 uniquement (titre + contenu). Pas d’appel getMedia → pas de cadre bleu en Consulter.
            const plainMessages = messages.map((message) => ({
                ...message.get({ plain: true }),
                media: []
            }));

            res.status(200).json(plainMessages);
        } catch (err) {
            console.log('❌ Erreur dans listMessages:', err);
            res.status(500).json({
                error: "Server error"
            });
        }
    },

    updateMessage: async function (req, res) {
        const headerAuth = req.headers['authorization'];
        const userId = jwtUtils.getUserId(headerAuth);
        const messageId = parseInt(req.params.id, 10);
        const { title, content, attachment } = req.body;

        try {
            const message = await models.PresseGle.findOne({ where: { id: messageId } });
            if (!message) return res.status(404).json({ error: 'Message not found' });

            const user = await models.User.findOne({ where: { id: userId } });
            if (!user || !user.isAdmin) return res.status(403).json({ error: 'Access denied: Admin only' });

            await message.update({
                title: title !== undefined ? title : message.title,
                content: content !== undefined ? content : message.content,
                attachment: attachment !== undefined ? attachment : message.attachment
            });
            await message.reload();
            return res.status(200).json({ message: 'Message updated successfully', data: message });
        } catch (err) {
            console.error('Error updating message:', err);
            return res.status(500).json({ error: 'Cannot update message' });
        }
    },

    deleteMessage: async function (req, res) {
        const headerAuth = req.headers['authorization'];
        const userId = jwtUtils.getUserId(headerAuth);
        const messageId = parseInt(req.params.id, 10);

        try {
            const message = await models.PresseGle.findOne({ where: { id: messageId } });
            if (!message) return res.status(404).json({ error: 'Message not found' });

            const user = await models.User.findOne({ where: { id: userId } });
            if (!user || !user.isAdmin) return res.status(403).json({ error: 'Access denied: Admin only' });

            await message.destroy();
            return res.status(200).json({ message: 'Message deleted successfully' });
        } catch (err) {
            console.error('Error deleting message:', err);
            return res.status(500).json({ error: 'Cannot delete message' });
        }
    }
};