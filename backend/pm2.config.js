module.exports = {
  apps: [
    {
      name: 'little-creators-backend',
      script: './dist/server.js',
      instances: 'max', // Multi-core CPU cluster mode
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
        UV_THREADPOOL_SIZE: 64,
      },
    },
  ],
};
