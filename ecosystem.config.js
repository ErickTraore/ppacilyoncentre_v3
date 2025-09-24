module.exports = {
  apps: [
    {
      name: "frontend",
      script: "frontend/server.js",
      cwd: "./frontend",
      env: {
        NODE_ENV: "production"
      }
    },
    {
      name: "user-backend",
      script: "server.js",
      cwd: "./user-backend",
      env: {
        NODE_ENV: "production"
      }
    },
    {
      name: "media-backend",
      script: "server.js",
      cwd: "./media-backend",
      env: {
        NODE_ENV: "production"
      }
    }
  ]
};
