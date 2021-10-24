const { merge } = require("webpack-merge");
const commonConfig = require("./webpack.common.js");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
module.exports = merge(commonConfig, {
  mode: "production",
  externals: {
    bufferutil: "bufferutil",
    "utf-8-validate": "utf-8-validate"
  },
  plugins: [new CleanWebpackPlugin()]
});
