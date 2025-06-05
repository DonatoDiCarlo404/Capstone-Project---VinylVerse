module.exports = {
  API: {
    PREFIX: '/api',
    VERSION: 'v1',
    PORT: process.env.PORT || 3001
  },
  
  DISCOGS: {
    API_URL: 'https://api.discogs.com',
    TOKEN: process.env.DISCOGS_TOKEN
  },

  GENRES: [
    'Rock',
    'Jazz',
    'Electronic',
    'Classical',
    'Hip Hop',
    'Pop',
    'Blues',
    'Folk'
  ],

  AUTH: {
    JWT_SECRET: process.env.JWT_SECRET,
    TOKEN_EXPIRY: '1year'
  }
};