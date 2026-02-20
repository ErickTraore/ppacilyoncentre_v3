// File: user-backend/server.prod.js
const path = require('path');
const dotenv = require('dotenv');
const https = require('https');
const fs = require('fs');
const app = require('./app');   // ✅ une seule fois
const { sequelize } = require('./models');

// 🔒 Charger uniquement le fichier .env.production
dotenv.config({ path: path.join(__dirname, '.env.production') });

const port = process.env.PORT || 6001;

// 🔐 Options SSL robustes
const sslOptions = {
  key: fs.readFileSync('/etc/letsencrypt/live/ppacilyoncentre.com/privkey.pem', 'utf8'),
  cert: fs.readFileSync('/etc/letsencrypt/live/ppacilyoncentre.com/fullchain.pem', 'utf8'),
  ca: fs.readFileSync('/etc/letsencrypt/live/ppacilyoncentre.com/chain.pem', 'utf8') // 🔹 ajoute la chaîne complète
};

console.log('⏳ Tentative de connexion USER-BACKEND (prod)...');

sequelize.sync({ force: false })
  .then(() => {
    https.createServer(sslOptions, app).listen(port, () => {
      console.log(`✅ USER-BACKEND (prod) lancé en HTTPS sur le port ${port}`);
      console.log(`✅ Connexion USERS-BACKEND à la BDD réussie (base: ${process.env.DB_NAME_USER_PROD})`);
    });
  })
  .catch(err => {
    console.error(`❌ Erreur de connexion USER-BACKEND (prod, base: ${process.env.DB_NAME_USER_PROD}):`, err.message);
    process.exit(1); // 🔹 quitte proprement si la BDD est inaccessible
  });
