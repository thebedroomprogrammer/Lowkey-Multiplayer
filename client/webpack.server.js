const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const webpack = require('webpack');

var ExtractTextPlugin = require('extract-text-webpack-plugin');
var BUILD_DIR = path.resolve(__dirname, 'dist');
var APP_DIR = path.resolve(__dirname, 'src');

const VENDOR_LIBS = [];
  
  const config = {
    mode:"development",
    entry: {
      bundle: [
        'webpack-dev-server/client?http://localhost:8090',
        APP_DIR + '/app.js'
      ]
    },
    output: {
      path: BUILD_DIR,
      filename: 'js/[name].[hash].js'
    },
    resolve: {
      modules: [path.resolve('./src'), path.resolve('./node_modules')]
    },
    module: {
      rules: [
        {
          use: 'babel-loader',
          test: /\.js$/,
          exclude: /node_modules/
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader']
        },
        {
          test: /\.(jpe?g|svg|png|gif)$/i,
          use: 'file-loader?name=images/[name].[ext]'
        }
      ]
    },
    devServer: {
      historyApiFallback: true,
      contentBase: BUILD_DIR,
      compress: true,
      hot: true,
      port: 8090,
      open: true
    },
    plugins: [
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NamedModulesPlugin(),
      new HtmlWebpackPlugin({
        template: 'src/templates/index.html'
      }),
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: JSON.stringify('development')
        }
      }),
  
    ]
  };
  
  module.exports = config;