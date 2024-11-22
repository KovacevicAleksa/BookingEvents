const Dotenv = require('dotenv-webpack');
const path = require('path');

module.exports = {
  plugins: [
    new Dotenv({
      path: path.resolve(__dirname, '.env'),
      systemvars: true
    })
  ],
  resolve: {
    extensions: ['.js', '.jsx'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    fallback: {
      path: require.resolve("path-browserify"),
      os: require.resolve("os-browserify/browser"),
      crypto: require.resolve("crypto-browserify"),
    }
  }
};