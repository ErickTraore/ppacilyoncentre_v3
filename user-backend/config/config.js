// File: user-backend/config/config.js

require('dotenv').config();

module.exports = {
  development: {
    database: process.env.DB_NAME_USER_DEV,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST, // force localhost
    dialect: process.env.DB_DIALECT || 'mysql'
  },
  test: {
    database: process.env.DB_NAME_USER_TEST,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST, // force localhost
    dialect: process.env.DB_DIALECT || 'mysql'
  },
  production: {
    database: process.env.DB_NAME_USER_PROD,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST, // force localhost
    dialect: process.env.DB_DIALECT || 'mysql'
  }
};
