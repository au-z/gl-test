const path = require('path')
const webpack = require('webpack')
let UglifyJsPlugin = webpack.optimize.UglifyJsPlugin
let HtmlWebpackPlugin = require('html-webpack-plugin')
const env = require('yargs').argv.env
let outputFile

let plugins = []
plugins.push(new HtmlWebpackPlugin({
  template: path.join(__dirname, 'app/index.html'),
  inject: 'head',
}))

const libraryName = 'GLTestApp'
if(env === 'build') {
  plugins.push(new UglifyJsPlugin({minimize: true}))
  outputFile = libraryName + 'min.js'
} else {
  outputFile = libraryName + '.js'
}

module.exports = {
  entry: [
    path.join(__dirname, '/src/index.js')
  ],
  devtool: 'source-map',
  output: {
    path: path.join(__dirname, '/app'),
    filename: outputFile,
    library: libraryName,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.js$/,
        loader: 'eslint-loader',
        exclude: [/node_modules/, /lib/],
      },
    ],
  },
  resolve: {
    modules: [
      path.resolve(__dirname, 'src'),
      path.resolve(__dirname, 'lib'),
      'node_modules',
    ],
  },
  devServer: {
    contentBase: path.join(__dirname, '/app'),
    compress: true,
    port: 9000,
    noInfo: true,
  },
  plugins: plugins,
}