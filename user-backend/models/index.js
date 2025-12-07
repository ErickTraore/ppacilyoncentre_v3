// File : user-backend/models/index.js

const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');   // ✅ importer Sequelize correctement

console.log("📂 Chargement de models/index.js...");

const env = process.env.NODE_ENV || 'development';
console.log(`🌍 Environnement détecté : ${env}`);

const configPath = path.join(__dirname, '..', 'config', 'config.js');
const config = require(configPath)[env];
console.log("⚙️ Configuration Sequelize chargée :", config);

const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host || '127.0.0.1',
  dialect: config.dialect,
  logging: false,
});

console.log(`🔌 Initialisation Sequelize pour la base : ${config.database}`);

// ✅ Import des modèles
console.log("📥 Import des modèles...");
const User = require('./user')(sequelize, DataTypes);
console.log("✅ Modèle User chargé");
const Message = require('./message')(sequelize, DataTypes);
console.log("✅ Modèle Message chargé");
const Profile = require('./profile')(sequelize, DataTypes);
console.log("✅ Modèle Profile chargé");

// ✅ Définir les associations
console.log("🔗 Définition des associations...");
if (User.associate) {
  User.associate({ Message, Profile });
  console.log("🔗 Association User ↔ Message, Profile définie");
}
if (Message.associate) {
  Message.associate({ User });
  console.log("🔗 Association Message ↔ User définie");
}
if (Profile.associate) {
  Profile.associate({ User });
  console.log("🔗 Association Profile ↔ User définie");
}

console.log("📦 Export des modèles et de sequelize...");

module.exports = {
  sequelize,
  User,
  Message,
  Profile,
};
