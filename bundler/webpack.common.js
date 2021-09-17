const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCSSExtractPlugin = require("mini-css-extract-plugin");
const path = require("path");

module.exports = {
  entry: path.resolve(__dirname, "../src/script.js"),
  output: {
    filename: "bundle.[contenthash].js",
    path: path.resolve(__dirname, "../dist")
  },
  devtool: "source-map",
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "../static")
        }
      ]
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "../src/index.html"),
      minify: true
    }),
    new MiniCSSExtractPlugin()
  ],
  module: {
    rules: [
      //html
      {
        test: /\.(html)$/,
        use: ["html-loader"]
      },
      //js
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ["babel-loader"]
      },
      //css
      {
        test: /\.css$/,
        use: [MiniCSSExtractPlugin.loader, "css-loader"]
      },
      //images
      {
        test: /\.(jpg|png|gif|svg)$/,
        use: [
          {
            loader: "file-loader",
            options: {
              outputPath: "assets/images/"
            }
          }
        ]
      },
      //fonts
      {
        test: /\.(ttf|eot|woff|woff2)$/,
        use: [
          {
            loader: "file-loader",
            options: {
              outputPath: "assets/fonts/"
            }
          }
        ]
      },
      {
        test: /\.mp3$/,
        loader: "file-loader",
        options: {
          name: "[sha512:hash:base64:7].[ext]"
        }
      },
      //shaders///
      {
        test: /\.(glsl|vs|fs|vert|frag)$/,
        exclude: /node_modules/,
        use: ["raw-loader"]
      }
    ]
  }
};
