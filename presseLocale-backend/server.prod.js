const app = require('./app');
const { sequelize } = require('./models');
const port = process.env.PORT || 7105;

console.log('Connexion Presse Locale Backend...');
sequelize.authenticate()
  .then(() => {
    console.log('Connexion BDD Presse Locale OK');
    app.listen(port, () => console.log('Presse Locale Backend sur port', port));
  })
  .catch((err) => {
    console.error('Erreur BDD:', err.message);
    process.exit(1);
  });
