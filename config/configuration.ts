const t = 'test'

export default () => ({
  port: +process.env.PORT,
  container: +process.env.CONTAINER_PORT,
  database: {
    uri: process.env.NODE_ENV !== 'test' ? process.env.DATABASE_URI : process.env.DATABASE_TEST_URI,
  },
  mongodb: {
    user: process.env.MONGO_USER,
    pwd: process.env.MONGO_PWD,
    db: process.env.MONGO_DB,
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
