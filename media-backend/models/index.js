const { Sequelize } = require('sequelize');
const sequelize = require('../database'); 

const Media = require('./media')(sequelize); // ✅ Correction

const db = { sequelize, Sequelize, Media };

module.exports = db;
