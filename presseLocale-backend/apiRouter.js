const express = require('express');
const auth = require('./middleware/authMiddleware');
const isAdmin = require('./middleware/isAdminMiddleware');
const messagesCtrl = require('./routes/messagesCtrl');
const router = express.Router();
router.post('/messages/new/', auth, isAdmin, messagesCtrl.createMessage);
router.get('/messages/', auth, messagesCtrl.listMessages);
module.exports = { router };
