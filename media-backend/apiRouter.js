//File media-backend/apiRouter.js

const express = require('express');
const uploadImageRoutes = require('./routes/uploadImage');
const uploadVideoRoutes = require('./routes/uploadVideo');
const getMediaRoutes = require('./routes/getMedia'); // ✅ Ajout de la nouvelle route

exports.router = (function() {
    const apiRouter = express.Router();

    // Routes pour récupérer et uploader des fichiers
    apiRouter.use('/uploadImage', uploadImageRoutes);
    apiRouter.use('/uploadVideo', uploadVideoRoutes);
    apiRouter.use('/getMedia', getMediaRoutes); // ✅ Nouvelle route pour récupérer les médias

    console.log("📌 Routes API actives : /api/uploadImage, /api/uploadVideo, /api/getMedia");
module.exports = { router: apiRouter };
})();