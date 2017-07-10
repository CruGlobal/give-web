const webpack = require('webpack');
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const concat = require('lodash/concat');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const { CheckerPlugin } = require('awesome-typescript-loader');

const aemDomain = 'https://give-stage2.cru.org';

const isBuild = (process.env.npm_lifecycle_event || '').startsWith('build');
const ci = process.env.CI === 'true';

const entryPoints = {
  common: 'common/common.module.js',
  cruNav: 'common/components/nav/nav.bundle.js',
  app: [
    'common/common.module.js',
    'app/cart/cart.component.js',
    'app/checkout/checkout.component.js',
    'app/thankYou/thankYou.component.js',
    'app/productConfig/productConfig.component.js',
    'app/signIn/signIn.component.js',
    'app/searchResults/searchResults.component.js',
    'app/homeSignIn/homeSignIn.component.js',
    'app/profile/yourGiving/yourGiving.component.js',
    'app/profile/profile.component.js',
    'app/profile/receipts/receipts.component.js',
    'app/profile/payment-methods/payment-methods.component.js',
    'app/designationEditor/designationEditor.component.js',
    'app/branded/branded-checkout.component.ts'
  ],
  give: 'assets/scss/styles.scss',
  nav: 'assets/scss/global-nav.scss',
  'branded-checkout': 'assets/scss/branded-checkout.scss'
};


module.exports = env => {
  env = env || {};
  return {
    entry: isBuild ? entryPoints : { main: 'app/main/main.module.ts' },
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
          },
          {
            from: 'unsupportedBrowser.html'
          }
        ]),
        new webpack.EnvironmentPlugin({
          'TRAVIS_COMMIT': 'development'
        }),
        new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /en/),
        new webpack.ContextReplacementPlugin(
          /angular(\\|\/)core(\\|\/)@angular/,
          path.resolve(__dirname, '../src')
        ),
        new CheckerPlugin()
      ],
      env.analyze ? [ new BundleAnalyzerPlugin() ] : []

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
          use: ['html-loader']
        },
        {
          test: /\.tsx?$/,
          loader: "awesome-typescript-loader"
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
        {
          test: /\.(scss|css)$/,
          use: [
            "exports-loader?module.exports.toString()",
            "css-loader?-url&sourceMap", // TODO: fix url paths so loaders can be used
            "sass-loader?sourceMap"
          ]
        }
      ]
    },
    resolve: {
      modules: [path.resolve(__dirname, "src"), "node_modules"],
      extensions: [".ts", ".js", ".json"]
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
      port: 9000,
      public: "localhost.cru.org:9000"
    }
  };
};
