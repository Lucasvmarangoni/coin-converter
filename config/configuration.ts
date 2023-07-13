export default () => ({
  port: parseInt(process.env.PORT, 10) || 3333,
  database: {
    default: process.env.DATABASE_URL,
    test: process.env.TEST_DATABASE_URL,
  },
  api: {
    url: process.env.API_URL,
    key: process.env.API_KEY,
    test_key: process.env.TEST_KEY,
  },
  logger: {
    level: process.env.LOGGER_LEVEL,
    enabled: process.env.LOGGER_ENABLED !== 'true' ? false : true,
    teste_enabled: process.env.TEST_LOGGER_ENABLED !== 'true' ? false : true,
  },
});
