#!/usr/bin/env node
'use strict';
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.production') });
const { sequelize, PresseGle, User } = require('../models');

async function main() {
  const [user] = await User.findAll({ limit: 1, order: [['id', 'ASC']] });
  if (!user) {
    console.error('Aucun utilisateur en BDD');
    process.exit(1);
  }
  const [created] = await PresseGle.findOrCreate({
    where: { title: 'vend-6' },
    defaults: {
      title: 'vend-6',
      content: 'article de vend-6',
      userId: user.id,
      categ: 'presse',
    },
  });
  console.log(created ? 'Article vend-6 créé (ou déjà existant).' : 'Échec création.');
  await sequelize.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
