// File : user-backend/models/index.js

const path = require('path');
const Sequelize = require('sequelize');
require('dotenv').config();

const env = process.env.NODE_ENV || 'development';
const configPath = path.join(__dirname, '..', 'config', 'config.js');
const config = require(configPath)[env];

const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  dialect: config.dialect,
  logging: false,
});

// A décommenter pour détecter une erreur dans cette page.

// sequelize.authenticate()
// .then(() => {
//   console.log('Connexion à la base de données USERS-BACKEND réussie: page index.js');
// })
// .catch((err) => {
//   console.error('Échec de la connexion USERS-BACKEND à la base de données :', err);
// });

const User = require('./user')(sequelize, Sequelize.DataTypes);
const Message = require('./message')(sequelize, Sequelize.DataTypes);

// Définir les associations
User.associate({ Message });
Message.associate({ User });

sequelize.sync({ alter: true })
  .then(() => console.log('Connexion USERS-BACKEND à sa BDD réussie sur le port 5000'))
  .catch(err => console.error('Erreur de synchronisation USER-BACKEND', err));

module.exports = {
  sequelize,
  User,
  Message,
};
