// File : media-backend/server.js

const express = require('express');
const cors = require('cors');
const { Sequelize } = require('sequelize');
const app = express();
const sequelize = require('./database');


// Ajoutez cette ligne pour importer le module CORS

// Middleware pour parser les fichiers multipart/form-data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const apiRouter = require('./apiRouter').router;

app.use('/uploads', express.static('uploads')); // ✅ Permet l'accès aux fichiers médias


// Ajoutez ce middleware pour permettre les requêtes CORS
app.use(cors({
  origin: 'http://localhost:3000', // Remplacez par l'origine de votre frontend
  credentials: true, // Si vous utilisez des cookies ou des identifiants
}));


// Synchroniser la base de données et démarrer le serveur
sequelize.sync({ force: false }).then(() => {
  app.listen(3001, () => {
    console.log('Serveur MEDIA_BACKEND démarré sur le port 3001');
  });
}).catch(err => {
  console.error('Erreur de connexion de MEDIA_BACKEND à la base de données:', err);
});

app.use('/api/', apiRouter);

