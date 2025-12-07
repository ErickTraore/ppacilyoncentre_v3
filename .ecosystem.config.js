// File: ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'user-backend-ppaci',
      script: 'server.prod.js',          // ✅ Production officiel
      cwd: './user-backend',
      env: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'media-backend-ppaci',
      script: 'server.prod.js',          // ✅ Production officiel
      cwd: './media-backend',
      env: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'frontend-ppaci',
      script: 'npx',
      args: 'serve -s build -l 8080',
      cwd: './frontend',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
