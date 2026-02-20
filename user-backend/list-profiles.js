// Liste la table Profiles (production)
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env.production') });
process.env.NODE_ENV = 'production';

const { sequelize, Profile } = require('./models');

async function main() {
  try {
    const rows = await Profile.findAll({ order: [['id', 'ASC']] });
    console.log(JSON.stringify(rows.map((r) => r.toJSON()), null, 2));
  } catch (err) {
    console.error('Erreur:', err.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close().catch(() => {});
  }
}

main();
