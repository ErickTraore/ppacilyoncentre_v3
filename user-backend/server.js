// File: user-backend/server.js
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { Sequelize } = require('sequelize');
const server = express();
const port = 5000;
const { getSignature } = require('./routes/zoomCtrl');

// Configurer Sequelize pour se connecter à MySQL
const sequelize = new Sequelize(process.env.DB_NAME_DEVELOPMENT, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: process.env.DB_DIALECT,
  logging: false, // Désactiver la journalisation si nécessaire
});

// Vérifier la connexion à la base de données
sequelize.authenticate().then(() => {
  console.log('Connexion du serveur USER-BACKEND à sa BDD réussie');
}).catch((err) => {
  console.error('Échec de la connexion du serveur USER-BACKEND à la BDD :', err);
});

const bodyParser = require('body-parser');
// ✅ Middleware JSON avec limite augmentée
server.use(express.json({ limit: '5mb' }));
server.use(express.urlencoded({ extended: true }));

server.use(cors());
const apiRouter = require('./apiRouter').router;

server.use(cors());

server.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.status(200).send('Server running (server-get-localhost) at http://localhost:5000');
});

server.get('/users', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.status(200).send('Server running (server-get-user) at http://localhost:5000');
});

server.get('/api/zoom/signature', getSignature); // 👈 ici tu branches le contrôleur
server.use('/api/', apiRouter);

// Démarrez le serveur
server.listen(port, () => {
  console.log(`Server running (server-listen) at http://localhost:${port}`);
});