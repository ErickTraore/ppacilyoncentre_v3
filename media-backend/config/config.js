// File: user-backend/config/config.js
module.exports = {
  development: {
    database: process.env.DB_NAME_USER_DEV,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: process.env.DB_DIALECT || 'mysql'
  },
  test: {
    database: process.env.DB_NAME_USER_TEST,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: process.env.DB_DIALECT || 'mysql'
  },
  production: {
    database: process.env.DB_NAME_MEDIA_PROD,   // ✅ doit pointer vers ta variable .env
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST || '127.0.0.1',  // ✅ force IPv4
    dialect: process.env.DB_DIALECT || 'mysql'
  }
};
