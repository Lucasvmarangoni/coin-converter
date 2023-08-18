export default () => ({
  port: parseInt(process.env.PORT, 10) || 3333,
  database: {
    url: process.env.DATABASE_URL,
  },
  api: {
    url: process.env.API_URL,
    key: process.env.API_KEY,
  },
  logger: {
    level: process.env.LOGGER_LEVEL,
    enabled: process.env.LOGGER_ENABLED !== 'true' ? false : true,
  },
  auth: {
    key: process.env.AUTH_KEY,
    expiresIn: Number(process.env.AUTH_TOKEN_EXPIRES_IN),
  }
});
