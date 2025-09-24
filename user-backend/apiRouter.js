// File: user-backend/apiRouter.js

const express = require('express');
const usersCtrl = require('./routes/usersCtrl');
const authMiddleware = require('./middleware/authMiddleware');
const messagesCtrl = require('./routes/messagesCtrl');
const sessionCtrl = require('./routes/sessionCtrl');
const zoomCtrl = require('./routes/zoomCtrl');
const refreshAuthMiddleware = require('./middleware/refreshAuthMiddleware');
const isAdminMiddleware = require('./middleware/isAdminMiddleware');

exports.router = (function() {
    const apiRouter = express.Router();

    apiRouter.route('/users/register/').post(usersCtrl.register);
    apiRouter.route('/users/login/').post(usersCtrl.login);
    apiRouter.route('/users/me/').get(authMiddleware, usersCtrl.getUserProfile);
    apiRouter.route('/users/all/').get(authMiddleware, isAdminMiddleware, usersCtrl.getUserAll);
    apiRouter.route('/users/me/').put(authMiddleware, usersCtrl.updateUserProfile);
    apiRouter.route('/users/refresh-token/').post(usersCtrl.refreshToken);
    apiRouter.route('/users/extend-session').post(refreshAuthMiddleware, usersCtrl.extendSession);
    apiRouter.route('/users/:id').delete(authMiddleware, isAdminMiddleware, usersCtrl.deleteUser);
    apiRouter.route('/users/:id').put(authMiddleware, isAdminMiddleware, usersCtrl.updateUserById);
    apiRouter.route('/users/messages/new/').post(authMiddleware, isAdminMiddleware, messagesCtrl.createMessage);
    apiRouter.route('/users/messages/').get(authMiddleware, messagesCtrl.listMessages);
    apiRouter.route('/zoom/signature').get(zoomCtrl.getSignature);



    return apiRouter;
})();
