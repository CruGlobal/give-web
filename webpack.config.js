const webpack = require('webpack')
const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const concat = require('lodash/concat')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const aemDomain = 'https://give-stage2.cru.org'
const isBuild = (process.env.npm_lifecycle_event || '').startsWith('build')
const fs = require('fs')
const entryPoints = {
  common: 'common/common.module.js',
  app: [
    'common/common.module.js',
    'app/cart/cart.component.js',
    'app/checkout/checkout.component.js',
    'app/thankYou/thankYou.component.js',
    'app/productConfig/productConfig.component.js',
    'app/signIn/signIn.component.js',
    'app/searchResults/searchResults.component.js',
    'app/profile/yourGiving/yourGiving.component.js',
    'app/profile/profile.component.js',
    'app/profile/receipts/receipts.component.js',
    'app/profile/payment-methods/payment-methods.component.js',
    'app/designationEditor/designationEditor.component.js'
  ],
  give: 'assets/scss/styles.scss',
  'branded-checkout': [
    'app/branded/branded-checkout.component.js',
    'assets/scss/branded-checkout.scss'
  ]
}

module.exports = (env = {}) => {
  return {
    mode: isBuild ? 'production' : 'development',
    entry: isBuild ? entryPoints : { main: 'app/main/main.component.js' },
    output: {
      filename: '[name].js',
      path: path.resolve(__dirname, 'dist'),
      devtoolModuleFilenameTemplate: info =>
        info.resourcePath.replace(/^\.\//, '')
    },
    plugins: concat(
      [
        new MiniCssExtractPlugin({
          filename: '[name].min.css',
          disable: !isBuild
        }),
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
          TRAVIS_COMMIT: 'development'
        }),
        new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /en/)
      ],
      env.analyze ? [new BundleAnalyzerPlugin()] : []
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
                presets: [['@babel/preset-env', { modules: false }]],
                plugins: [
                  '@babel/plugin-transform-runtime',
                  'angularjs-annotate'
                ]
              }
            }
          ]
        },
        {
          test: /\.html$/,
          use: [
            'ngtemplate-loader?relativeTo=' +
            path.resolve(__dirname, './src') +
            '/',
            'html-loader'
          ]
        },
        // extract global css into separate files
        {
          test: /\.scss$/,
          include: path.resolve(__dirname, './src/assets'),
          use: isBuild
            ? [
              MiniCssExtractPlugin.loader,
              'css-loader?-url',
              'sass-loader?sourceMap'
            ]
            : [
              'style-loader',
              'css-loader?-url&sourceMap',
              'sass-loader?sourceMap'
            ]
        },
        // inline css for components with the component's js
        {
          test: /\.(scss|css)$/,
          exclude: path.resolve(__dirname, './src/assets'),
          use: [
            'style-loader',
            'css-loader?sourceMap',
            'sass-loader?sourceMap'
          ]
        }
      ]
    },
    resolve: {
      modules: [path.resolve(__dirname, 'src'), 'node_modules']
    },
    devtool: 'source-map',
    devServer: {
      https: {
        key: fs.readFileSync('./certs/private.key'),
        cert: fs.readFileSync('./certs/private.crt'),
        ca: fs.readFileSync('./certs/private.pem')
      },
      historyApiFallback: {
        rewrites: [{ from: /\/(?!test-release).+\.html/, to: '/index.html' }]
      },
      proxy: {
        '/bin': {
          target: aemDomain,
          changeOrigin: true
        },
        '/content': {
          target: aemDomain,
          changeOrigin: true
        },
        '/etc': {
          target: aemDomain,
          changeOrigin: true
        },
        '/designations': {
          target: aemDomain,
          changeOrigin: true
        }
      },
      port: 9000,
      public: 'localhost.cru.org:9000'
    }
  }
}
