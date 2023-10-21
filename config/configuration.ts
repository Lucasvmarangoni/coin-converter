export default () => ({
  port: parseInt(process.env.PORT, 10) || 3333,
  database: {
    uri: process.env.DATABASE_URI,
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
    key: process.env.JWT_SECRET,
    expiresIn: +process.env.AUTH_TOKEN_EXPIRES_IN,
    secret: process.env.EXPRESS_SESSION_SECRET,
    google: {
      id: process.env.GOOGLE_CLIENT_ID,
      secret: process.env.GOOGLE_CLIENT_SECRET,
    },
  },
  cache: {
    host: process.env.CACHE_HOST,
    port: process.env.CACHE_PORT,
    ttl: process.env.CACHE_TTL,
    max: process.env.CACHE_MAX,
    password: process.env.CACHE_PASSWORD,
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: +process.env.REDIS_PORT,
  },
});
