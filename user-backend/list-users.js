// Script pour lister les utilisateurs de la BDD production
const path = require('path');

// Charger la config production
require('dotenv').config({ path: path.join(__dirname, '.env.production') });
process.env.NODE_ENV = 'production';

const { sequelize, User } = require('./models');

async function main() {
  try {
    const users = await User.findAll({
      attributes: ['id', 'email', 'isAdmin', 'lastActivity'],
      order: [['id', 'ASC']],
    });

    const plain = users.map((u) => u.toJSON());
    console.log(JSON.stringify(plain, null, 2));
  } catch (err) {
    console.error('Erreur lors de la lecture des utilisateurs :', err.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close().catch(() => {});
  }
}

main();

