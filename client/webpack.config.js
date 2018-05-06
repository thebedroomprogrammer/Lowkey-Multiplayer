const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");
const CleanWebpackPlugin = require("clean-webpack-plugin");

var ExtractTextPlugin = require("extract-text-webpack-plugin");
var BUILD_DIR = path.resolve(__dirname, "dist");
var APP_DIR = path.resolve(__dirname, "src");

const config = {
  mode: "production",
  entry: {
    bundle: APP_DIR + "/app.js"
  },
  output: {
    path: BUILD_DIR,
    filename: "js/[name].[hash].js"
  },
  resolve: {
    modules: [path.resolve("./src"), path.resolve("./node_modules")]
  },
  module: {
    rules: [
      {
        use: "babel-loader",
        test: /\.js$/,
        exclude: /node_modules/
      },
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: ["style-loader", "css-loader"]
        })
      },
      {
        use: "file-loader?name=images/[name].[ext]",
        test: /\.(jpe?g|svg|png|gif)$/i
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "src/templates/index.html"
    }),
    new CleanWebpackPlugin(["dist"]),
    // new CopyWebpackPlugin([{ from: APP_DIR + '/images', to: 'images/' }]),
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify("production")
      }
    }),
    new webpack.optimize.OccurrenceOrderPlugin()
  ]
};

module.exports = config;
