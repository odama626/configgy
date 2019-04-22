const config = require('./index');
const path = require('path');

module.exports = config.buildConfig((config, { defaultLoaders, defaultRules, dev }) => {

  config.module.rules = [
    defaultRules.js(),
    defaultRules.css(),
    defaultRules.files(),
    defaultRules.fonts()
  ];

  config.entry = './src/index.js';
  config.target = 'web';

  if (dev) {
    // development specific config here
  }

  config.resolve.alias = {
    common: path.resolve(__dirname, 'src/common')
  }

  return config;
})
