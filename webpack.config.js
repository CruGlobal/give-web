const webpack = require('webpack');
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const concat = require('lodash/concat');
const omit = require('lodash/omit');
const keys = require('lodash/keys');

const aemDomain = 'https://give-stage2.cru.org';

const isBuild = process.env.npm_lifecycle_event === 'build';
const ci = process.env.CI === 'true';

const entryPoints = {
  cart: 'app/cart/cart.component.js',
  checkout: 'app/checkout/checkout.component.js',
  thankYou: 'app/thankYou/thankYou.component.js',
  productConfig: 'app/productConfig/productConfig.component.js',
  signIn: 'app/signIn/signIn.component.js',
  searchResults: 'app/searchResults/searchResults.component.js',
  homeSignIn: 'app/homeSignIn/homeSignIn.component.js',
  yourGiving: 'app/profile/yourGiving/yourGiving.component.js',
  profile: 'app/profile/profile.component.js',
  receipts: 'app/profile/receipts/receipts.component.js',
  paymentMethods: 'app/profile/payment-methods/payment-methods.component.js',
  designationEditor: 'app/designationEditor/designationEditor.component.js',
  give: 'assets/scss/styles.scss',
  nav: 'assets/scss/global-nav.scss'
};


module.exports = {
  entry: isBuild ? entryPoints : { main: 'app/main/main.component.js' },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    devtoolModuleFilenameTemplate: info => info.resourcePath.replace(/^\.\//, '')
  },
  plugins: concat(
    [
      new ExtractTextPlugin({ filename: "[name].min.css", disable: !isBuild }),
      new CopyWebpackPlugin([
        {
          context: 'src',
          from: '**/*.+(json|svg|woff|ttf|png|ico|jpg|gif|eot)',
          to: '[path][name].[ext]'
        }
      ]),
      new webpack.EnvironmentPlugin({
        'TRAVIS_COMMIT': 'development'
      })
    ],
    isBuild ?
      [
        new webpack.optimize.CommonsChunkPlugin({
          name: 'common',
          chunks: keys(omit(entryPoints, ['give', 'nav']))
        })
      ] :
      []
  ),
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [['env', { "modules": false }]],
              plugins: ['transform-runtime', 'angularjs-annotate']
            }
          }
        ]
      },
      {
        test: /\.html$/,
        use: ['ngtemplate-loader?relativeTo=' + path.resolve(__dirname, './src') + '/', 'html-loader']
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "eslint-loader",
        enforce: "pre",
        options: {
          // Show errors as warnings during development to prevent start/test commands from exiting
          failOnError: isBuild || ci,
          emitWarning: !isBuild && !ci
        }
      },
      // extract global css into separate files
      {
        test: /\.scss$/,
        include: path.resolve(__dirname, "./src/assets"),
        use: isBuild ?
          ExtractTextPlugin.extract({
            use: [
              "css-loader?-url",
              "sass-loader?sourceMap"
            ]
          }) :
          [
            "style-loader",
            "css-loader?-url&sourceMap",
            "sass-loader?sourceMap"
          ]
      },
      // inline css for components with the component's js
      {
        test: /\.scss$/,
        exclude: path.resolve(__dirname, "./src/assets"),
        use: [
          "style-loader",
          "css-loader?sourceMap",
          "sass-loader?sourceMap"
        ]
      }
    ]
  },
  resolve: {
    modules: [path.resolve(__dirname, "src"), "node_modules"]
  },
  devtool: "source-map",
  devServer: {
    historyApiFallback: {
      rewrites: [
        { from: /\/(?!test\-release).+\.html/, to: '/index.html' }
      ]
    },
    proxy: {
      '/bin': aemDomain,
      '/content': aemDomain,
      '/etc': aemDomain,
      '/designations': aemDomain
    },
    port: 9000
  }
};
