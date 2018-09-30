const path = require('path');
require('dotenv').config({path: path.resolve(__dirname, '.env')});
module.exports = {
  PAGE_SIZE: 10,
  MAX_QUICK_REPLIES: 11,
  FB_AUTHENTICATION: {
    PAGE_ACCESS_TOKEN: process.env.FB_ACCESS_TOKEN,
    WEB_HOOK_VERIFY_TOKEN: process.env.VERIFY_TOKEN,
  },
  BOT_DB: {
    HOST: process.env.BOT_DB_HOST,
    PORT: process.env.BOT_DB_PORT,
    NAME: process.env.BOT_DB_NAME,
    USER: process.env.BOT_DB_USER,
    PASSWORD: process.env.BOT_DB_PASSWORD,
  },
  MAGENTO_AUTHENTICATION: {
    CONSUMER_KEY: process.env.MAGENTO_CONSUMER_KEY,
    CONSUMER_SECRET: process.env.MAGENTO_CONSUMER_SECRET,
    ACCESS_TOKEN: process.env.MAGENTO_ACCESS_TOKEN,
    ACCESS_TOKEN_SECRET: process.env.MAGENTO_ACCESS_TOKEN_SECRET
  },
  UNIFONIC_AUTHENTICATION: {
    APP_SID: process.env.UNIFONIC_APP_SID
  },
  GOOGLE_MAPS_AUTHENTICATION: {
    DISTANCE_MATRIX_API_KEY: process.env.GOOGLE_DISTANCE_MATRIX_API_KEY,
    GEOCODING_API_KEY: process.env.GOOGLE_GEOCODING_API_KEY

  },
  SSL: {
    KEY_PATH: process.env.SSL_KEY_PATH,
    CERT_PATH: process.env.SSL_CERT_PATH,
    CA_PATH: process.env.SSL_CA_PATH,
  },
  SUPPORT: {
    FROM_EMAIL_ID: process.env.SUPPORT_FROM_EMAIL_ID,
    FROM_EMAIL_PASSWORD: process.env.SUPPORT_FROM_EMAIL_PASSWORD,
    TO_EMAILS: process.env.SUPPORT_TO_EMAILS,
  },
  WITAI:{
    ACCESS_TOKEN_AR: process.env.WIT_ACCESS_KEY_AR,
  },
  AZURE: {
    APPLICATION_INSIGHTS_KEY: process.env.AZURE_INSIGHTS_KEY,
  },
  SECRET: process.env.BOT_SECRET,
};
