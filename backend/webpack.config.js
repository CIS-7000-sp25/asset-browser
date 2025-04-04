const path = require("path");

module.exports = {
  entry: "./library/static/index.js",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "static"),
  },
  optimization: {
    minimize: true,
    splitChunks: {
      chunks: 'all',
    },
  },
};
