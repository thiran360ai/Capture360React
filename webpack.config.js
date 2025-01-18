// webpack.config.js
module.exports = {
    // other configurations...
    module: {
      rules: [
        {
          enforce: 'pre',
          test: /\.js$/,
          exclude: /node_modules/,
          loader: 'source-map-loader',
          options: {
            // Ignore missing source maps
            ignore: ['@mediapipe/tasks-vision/vision_bundle_mjs.js.map']
          }
        }
      ]
    }
  };
  