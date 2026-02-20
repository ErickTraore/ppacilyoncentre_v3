// File: user-backend/server.docker.js
// Version HTTP pour Docker (nginx gère SSL en amont, comme cppeurope)
const app = require('./app');
const { sequelize } = require('./models');

const port = process.env.PORT || 7004;

console.log('⏳ Connexion USER-BACKEND ppacilyoncentre (Docker)...');
console.log(`🛢️ DB = ${process.env.DB_NAME_USER_PROD} (host: ${process.env.DB_HOST})`);

sequelize
  .authenticate()
  .then(() => {
    console.log(`✅ Connexion BDD réussie`);
    app.listen(port, () => {
      console.log(`✅ USER-BACKEND ppacilyoncentre (HTTP) port ${port}`);
    });
  })
  .catch((err) => {
    console.error(`❌ Erreur BDD:`, err.message);
    process.exit(1);
  });
