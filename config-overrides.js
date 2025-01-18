const path = require('path');

module.exports = {
  webpack: function (config, env) {
    // Ignore source map warnings for specific package
    config.module.rules.push({
      test: /\.js$/,
      use: 'source-map-loader',
      enforce: 'pre',
      exclude: [
        path.resolve(__dirname, 'node_modules/@mediapipe/tasks-vision')
      ]
    });
    return config;
  }
};
