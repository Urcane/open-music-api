const config = {
  app: {
    host: process.env.APP_HOST,
    port: process.env.APP_PORT,
  },
  rabbitMq: {
    server: process.env.RABBITMQ_SERVER,
  },
  jwt: {
    accessKey: process.env.ACCESS_TOKEN_KEY,
    refreshKey: process.env.REFRESH_TOKEN_KEY,
    tokenAge: process.env.ACCESS_TOKEN_AGE,
  },
  redis: {
    host: process.env.REDIS_SERVER,
  },
};

module.exports = config;
