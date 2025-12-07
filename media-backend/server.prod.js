// File: media-backend/server.prod.js

const fs = require('fs');
const https = require('https');
const dotenv = require('dotenv');
dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

const app = require('./app');
const sequelize = require('./database');

// 🔐 Certificats SSL Let's Encrypt (identiques à l’existant)
const sslOptions = {
  key: fs.readFileSync('/etc/letsencrypt/live/ppacilyoncentre.com/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/ppacilyoncentre.com/fullchain.pem')
};

// 🔁 Connexion BDD et démarrage HTTPS (identique à l’existant)
console.log('⏳ Tentative de connexion à la base de données...');
sequelize.sync({ force: false })
  .then(() => {
    https.createServer(sslOptions, app).listen(6002, () => {
      console.log('✅ MEDIA-BACKEND lancé en HTTPS sur le port 6002');
    });
  })
  .catch(err => {
    console.error('❌ Erreur de connexion de MEDIA-BACKEND à la base de données:', err.message);
  });
