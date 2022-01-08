require('dotenv').config();

module.exports = [
  ['link', { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' }],
  ['link', { rel: 'icon', href: '/favicon.ico' }],
  ['link', { rel: 'manifest', href: '/manifest.json' }],
  ['meta', { name: 'theme-color', content: '#ffffff' }],
  ['meta', { name: 'google-site-verification', content: process.env.GOOGLE_SEARCH_CONSOLE}],
];